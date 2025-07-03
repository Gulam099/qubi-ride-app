import { Stack, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import * as Linking from "expo-linking";

import "react-native-reanimated";
// Import your global CSS file
import "../global.css";
import { ThemeProvider } from "@/Provider/ThemeProvider";
import { PortalHost } from "@rn-primitives/portal";
import {
  useFonts,
  NotoKufiArabic_100Thin,
  NotoKufiArabic_200ExtraLight,
  NotoKufiArabic_300Light,
  NotoKufiArabic_400Regular,
  NotoKufiArabic_500Medium,
  NotoKufiArabic_600SemiBold,
  NotoKufiArabic_700Bold,
  NotoKufiArabic_800ExtraBold,
  NotoKufiArabic_900Black,
} from "@expo-google-fonts/noto-kufi-arabic";

import { Provider, useSelector } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "@/store";
import colors from "@/utils/colors";
import { Toaster } from "sonner-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import i18n from "@/lib/i18n";
import { I18nextProvider } from "react-i18next";
import {
  ActivityIndicator,
  I18nManager,
  PermissionsAndroid,
  Platform,
  View,
  Alert,
} from "react-native";

import {
  ClerkProvider,
  ClerkLoaded,
  useAuth,
  ClerkLoading,
  useUser,
} from "@clerk/clerk-expo";
import { Text } from "@/components/ui/Text";
import { tokenCache } from "@/lib/cache";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";

import messaging from "@react-native-firebase/messaging";
import firebase from "@react-native-firebase/app";
import notifee, { AndroidImportance, EventType } from "@notifee/react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiBaseUrl } from "@/features/Home/constHome";
import { handleDeepLink } from "@/utils/deeplink";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

if (!publishableKey) {
  throw new Error(
    "Missing Publishable Key. Please set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in your .env"
  );
}

// Add this at the top of your file
interface Logger {
  info: (message: string, data?: any) => void;
  error: (message: string, error?: any) => void;
}

const logger: Logger = {
  info: (message, data) => __DEV__ && console.log(`[INFO] ${message}`, data),
  error: (message, error) =>
    __DEV__ && console.error(`[ERROR] ${message}`, error),
};

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp({
    // Your Firebase config here
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  });
}

// Separate component that uses Clerk hooks - this will be INSIDE ClerkProvider
const AppContent = () => {
  const router = useRouter();
  const { user, isLoaded: userLoaded } = useUser(); // Now this is inside ClerkProvider
  const { isLoaded, isSignedIn } = useAuth();
  const language = useSelector((state: any) => state.appState.language);
  const isRTL = language === "ar";

  // Android 13+ Notification Permission Helper
  const requestNotificationPermission = async () => {
    if (Platform.OS === "android" && Platform.Version >= 33) {
      try {
        const hasPermission = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
        );
        if (!hasPermission) {
          const status = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
          );
          return status === PermissionsAndroid.RESULTS.GRANTED;
        }
        return true;
      } catch (error) {
        logger.error("Notification permission error:", error);
        return false;
      }
    }
    return true;
  };

  // Helper: Send token to backend
  const sendTokenToBackend = async (token: string) => {
    try {
      const patientId = user?.publicMetadata.dbPatientId as string;
      const response = await fetch(
        `${apiBaseUrl}/api/room/patients/${patientId}/fcmtoken`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fcmToken: token }),
        }
      );

      // Check if response status is NOT 2xx
      if (response.status < 200 || response.status >= 300) {
        const errorBody = await response.text();
        logger.error(
          "API Error:",
          `Status: ${response.status}, Body: ${errorBody}`
        );
        throw new Error(`HTTP ${response.status}: ${errorBody}`);
      }

      logger.info("Token saved successfully", token);
      await AsyncStorage.setItem("lastFcmToken", token);
    } catch (error) {
      logger.error("Token upload failed:", error);
    }
  };

  // Core Notification Setup
  const setupNotifications = async () => {
    try {
      // 1. Request permissions
      await requestNotificationPermission();
      await notifee.requestPermission();

      // 2. Check notification authorization
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (!enabled) {
        console.log("Notifications disabled by user");
        return;
      }

      // 3. Get current token and check if changed
      const currentToken = await messaging().getToken();
      const lastStoredToken = await AsyncStorage.getItem("lastFcmToken");

      if (currentToken !== lastStoredToken) {
        logger.info("New/updated FCM token detected");
        await sendTokenToBackend(currentToken);
      }
    } catch (error) {
      logger.error("Notification setup error:", error);
    }
  };

  // Channel creation
  useEffect(() => {
    notifee.createChannel({
      id: "default",
      name: "Default Channel",
      importance: AndroidImportance.HIGH,
    });
  }, []);

  // Main Effect Hook
  useEffect(() => {
    let unsubscribeTokenRefresh: (() => void) | null = null;
    let unsubscribeMessage: (() => void) | null = null;

    const initializeFcm = async () => {
      try {
        await setupNotifications();

        // Token refresh handler
        unsubscribeTokenRefresh = messaging().onTokenRefresh(async () => {
          logger.info("FCM token refresh triggered");
          await setupNotifications();
        });

        // Message handler
        unsubscribeMessage = messaging().onMessage(async (remoteMessage) => {
          if (!remoteMessage.notification) {
            console.warn(
              "Received message without notification payload",
              remoteMessage
            );
            return;
          }

          const { title, body } = remoteMessage.notification;
          const deepLink = remoteMessage.data?.deepLink;
          const deepLinkString =
            typeof deepLink === "string"
              ? deepLink
              : JSON.stringify(deepLink || "");
          console.log("deepLinkString", deepLinkString);

          await notifee.displayNotification({
            title: title ?? "New Notification",
            body: body ?? "You have a new message",
            android: {
              channelId: "default",
              importance: AndroidImportance.HIGH,
              smallIcon: "ic_launcher",
              ...(deepLinkString &&
                deepLinkString !== "{}" && {
                  actions: [
                    {
                      title: "Join Room",
                      pressAction: {
                        id: "join-room",
                        launchActivity: "default",
                      },
                    },
                  ],
                }),
            },
            data: {
              deepLink: deepLinkString,
            },
          });
        });
      } catch (error) {
        logger.error("FCM initialization failed:", error);
      }
    };

    initializeFcm();

    return () => {
      unsubscribeTokenRefresh?.();
      unsubscribeMessage?.();
    };
  }, []);

  // Deep link handling
  useEffect(() => {
    const subscription = Linking.addEventListener("url", (event) => {
      console.log("URL received in tabs layout:", event.url);
      handleDeepLink(event.url);
    });

    Linking.getInitialURL().then((url) => {
      if (url) {
        console.log("Initial URL in tabs layout:", url);
        setTimeout(() => {
          handleDeepLink(url);
        }, 500);
      }
    });

    return () => subscription?.remove();
  }, []);

  // Notification handlers setup
  useEffect(() => {
    // Foreground handler
    const unsubscribeForeground = notifee.onForegroundEvent(
      handleNotificationEvent
    );

    // Background handler
    notifee.onBackgroundEvent(handleNotificationEvent);

    return () => {
      unsubscribeForeground();
    };
  }, []);

  // Unified notification handler
  const handleNotificationEvent = async ({ type, detail }: Event) => {
    const handleDeepLinkInternal = (link?: string) => {
      console.log("initailixeeeee>>>deep");

      try {
        if (!link) {
          console.warn("Received empty deep link");
          router.push("/");
          return;
        }

        // Validate URI format
        const isValidUri = /^baserti:\/\/(joinroom|other-route)\/[\w-]+$/.test(
          link
        );
        console.log("deep link url is ", isValidUri);
        if (!isValidUri) {
          Alert.alert(
            "Invalid Link",
            "The provided link is not formatted correctly"
          );
          router.push("/(stacks)/joinroom/the%20room%20url%20is%20broken");
          return;
        }

        // Convert to Expo Router path
        const expoPath = link
          .replace("baserti://", "")
          .replace("joinroom/", "joinroom/")
          .replace("other-route/", "other/");
        console.log("link", link);
        router.push(`/${expoPath}` as import("expo-router").Href);
        console.log("deep link done");
      } catch (error) {
        console.error("Deep link handling failed:", error);
        router.push("/(auth)/sign-in");
      }
    };

    if ([EventType.ACTION_PRESS, EventType.PRESS].includes(type)) {
      const deepLink = detail.notification?.data?.deepLink;
      handleDeepLinkInternal(deepLink as string | undefined);
    }
  };

  useEffect(() => {
    i18n.changeLanguage(language);
    I18nManager.forceRTL(isRTL);
    I18nManager.allowRTL(isRTL);
  }, [language]);

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.replace("/(tabs)");
    } else {
      router.replace("/(auth)/sign-in");
    }
  }, [isLoaded]);

  if (!userLoaded) return null;

  return (
    <ThemeProvider>
      <GestureHandlerRootView>
        <SafeAreaProvider>
          <SafeAreaView style={{ flex: 1 }}>
            <Stack>
              <Stack.Screen name="+not-found" />
              <Stack.Screen name="(auth)" options={{ headerShown: false }} />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="(stacks)" options={{ headerShown: false }} />
              <Stack.Screen name="(modals)" options={{ headerShown: false }} />
              <Stack.Screen name="consult" options={{ headerShown: false }} />
              <Stack.Screen
                name="instant-booking"
                options={{ headerShown: false }}
              />
            </Stack>
          </SafeAreaView>
        </SafeAreaProvider>
        <Toaster position="top-center" />
        <StatusBar style="light" backgroundColor={colors.blue[700]} />
        <PortalHost />
      </GestureHandlerRootView>
    </ThemeProvider>
  );
};

const RootLayout = () => {
  let [loaded, error] = useFonts({
    NotoKufiArabic_100Thin,
    NotoKufiArabic_200ExtraLight,
    NotoKufiArabic_300Light,
    NotoKufiArabic_400Regular,
    NotoKufiArabic_500Medium,
    NotoKufiArabic_600SemiBold,
    NotoKufiArabic_700Bold,
    NotoKufiArabic_800ExtraBold,
    NotoKufiArabic_900Black,
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <ClerkProvider tokenCache={tokenCache} publishableKey={publishableKey}>
      <QueryClientProvider client={queryClient}>
        <ClerkLoading>
          <View className="w-full h-full justify-center items-center">
            <ActivityIndicator size={48} color={colors.primary[500]} />
          </View>
        </ClerkLoading>

        <ClerkLoaded>
          <Provider store={store}>
            <PersistGate
              loading={<Text>Loading App Data...</Text>}
              persistor={persistor}
            >
              <I18nextProvider i18n={i18n}>
                <AppContent />
              </I18nextProvider>
            </PersistGate>
          </Provider>
        </ClerkLoaded>
      </QueryClientProvider>
    </ClerkProvider>
  );
};

export default RootLayout;
