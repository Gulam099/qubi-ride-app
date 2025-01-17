import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
// import * as MediaLibrary from "expo-media-library";
import * as Camera from "expo-camera";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import "react-native-reanimated";
import "../global.css"; // Global CSS file
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
import { I18nManager, Alert, View } from "react-native";
import { useCameraPermissions } from "expo-camera";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  

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

  

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <I18nextProvider i18n={i18n}>
          <MainApp />
        </I18nextProvider>
      </PersistGate>
    </Provider>
  );
}

// Main App Component
const MainApp = () => {
  const [permissionsGranted, setPermissionsGranted] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const language = useSelector((state: any) => state.appState.language);
  const isRTL = language === "ar";

  useEffect(() => {
    i18n.changeLanguage(language); // Sync language with Redux
    I18nManager.forceRTL(isRTL);
    I18nManager.allowRTL(isRTL);
  }, [language]);

  // const requestPermissions = async () => {
  //   try {
  //     if (!permission) {
  //       // Camera permissions are still loading.
  //       return <View />;
  //     }
  //     // Request Camera Permissions

  //     if (!permission.granted) {
  //       Alert.alert(
  //         "Permission Required",
  //         "Camera permission is required for this app."
  //       );
  //       return false;
  //     }

  //     // Request Media Library Permissions
  //     const { status: mediaStatus } =
  //       await MediaLibrary.requestPermissionsAsync();
  //     if (mediaStatus !== "granted") {
  //       Alert.alert(
  //         "Permission Required",
  //         "Media library permission is required to access your photos and videos."
  //       );
  //       return false;
  //     }

  //     setPermissionsGranted(true);
  //     return true;
  //   } catch (error) {
  //     console.error("Error requesting permissions:", error);
  //     Alert.alert(
  //       "Permission Error",
  //       "An error occurred while requesting permissions."
  //     );
  //     return false;
  //   }
  // };

  // useEffect(() => {
  //   const initializeApp = async () => {
  //     const permissionsSuccess = await requestPermissions();
  //     if (permissionsSuccess) {
  //       SplashScreen.hideAsync(); // Hide the splash screen only if permissions are granted
  //     }
  //   };

  //   if (loaded || error) {
  //     initializeApp();
  //   }
  // }, [loaded, error]);

  // if (!loaded && !error && !permissionsGranted) {
  //   return null;
  // }

  return (
    <ThemeProvider>
      <GestureHandlerRootView>
        <Stack>
          <Stack.Screen name="(Routes)" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
        <Toaster position="top-center" />
        <StatusBar style="light" backgroundColor={colors.primary[900]} />
        <PortalHost />
      </GestureHandlerRootView>
    </ThemeProvider>
  );
};
