import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
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

import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "@/store";
import colors from "@/utils/colors";
import { Toaster } from "sonner-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

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

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ThemeProvider>
          <GestureHandlerRootView>
            {/* <UserProvider> */}
            <Stack>
              <Stack.Screen name="(Routes)" options={{ headerShown: false }} />
              <Stack.Screen name="+not-found" />
            </Stack>
            <Toaster />
            <StatusBar style="light" backgroundColor={colors.primary[900]} />
            <PortalHost />
            {/* </UserProvider> */}
          </GestureHandlerRootView>
        </ThemeProvider>
      </PersistGate>
    </Provider>
  );
}
