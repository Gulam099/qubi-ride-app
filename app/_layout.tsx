import { Redirect, Stack, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
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
import { I18nManager } from "react-native";

import {
  ClerkProvider,
  ClerkLoaded,
  useAuth,
  ClerkLoading,
  useSession,
  useUser,
} from "@clerk/clerk-expo";
import { Text } from "@/components/ui/Text";
import { tokenCache } from "@/lib/cache";
import { use } from "i18next";
import { SafeAreaProvider } from "react-native-safe-area-context";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

if (!publishableKey) {
  throw new Error(
    "Missing Publishable Key. Please set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in your .env"
  );
}

// Main App Component
const InitialLayout = () => {
  const router = useRouter();
  const { user } = useUser();

  const { isLoaded, isSignedIn } = useAuth();
  const language = useSelector((state: any) => state.appState.language);
  const isRTL = language === "ar";
  console.log(isRTL);

  useEffect(() => {
    i18n.changeLanguage(language); // Sync language with Redux
    I18nManager.forceRTL(isRTL);
    I18nManager.allowRTL(isRTL);
  }, [language]);

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.replace("/");
    } else {
      router.replace("/(auth)/sign-in");
    }
  }, [isLoaded]);

  return (
    <ThemeProvider>
      <GestureHandlerRootView>
        <SafeAreaProvider>
          <Stack>
            <Stack.Screen name="+not-found" />
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="(stacks)" options={{ headerShown: false }} />
          </Stack>
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
  // console.log("Clerk Key:", publishableKey);

  return (
    <ClerkProvider tokenCache={tokenCache} publishableKey={publishableKey}>
      <ClerkLoading>
        <Text>Loading Clerk......</Text>
      </ClerkLoading>

      <ClerkLoaded>
        <Provider store={store}>
          <PersistGate
            loading={<Text>Loading App Data...</Text>}
            persistor={persistor}
          >
            <I18nextProvider i18n={i18n}>
              <InitialLayout />
            </I18nextProvider>
          </PersistGate>
        </Provider>
      </ClerkLoaded>
    </ClerkProvider>
  );
};

export default RootLayout;
