import { Stack, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";

import "react-native-reanimated";
import "../global.css";
import { ThemeProvider } from "@/Provider/ThemeProvider";

import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "@/store";
import colors from "@/utils/colors";
import { Toaster } from "sonner-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ActivityIndicator, View } from "react-native";

import { Text } from "@/components/ui/Text";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";

import notifee, { AndroidImportance } from "@notifee/react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

SplashScreen.preventAutoHideAsync();

const AppContent = () => {
  const router = useRouter();

  // Channel creation
  useEffect(() => {
    notifee.createChannel({
      id: "default",
      name: "Default Channel",
      importance: AndroidImportance.HIGH,
    });
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem("jwt_token");

        if (token) {
          router.replace("/(tabs)/home");
        } else {
          router.replace("/(tabs)/home");
        }
      } catch (error) {
        console.error("Error checking auth:", error);
        router.replace("/(tabs)/home");
      }
    };

    checkAuth();
  }, []);

  return (
    <ThemeProvider>
      <GestureHandlerRootView>
        <SafeAreaProvider>
          <SafeAreaView style={{ flex: 1 }}>
            <Stack>
              <Stack.Screen name="+not-found" />
              <Stack.Screen name="(auth)" options={{ headerShown: false }} />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            </Stack>
          </SafeAreaView>
        </SafeAreaProvider>
        <StatusBar style="light" backgroundColor={colors.blue[600]} />
        <Toaster />
      </GestureHandlerRootView>
    </ThemeProvider>
  );
};

const RootLayout = () => {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <PersistGate
          loading={
            <View className="w-full h-full justify-center items-center">
              <ActivityIndicator size={48} color={colors.primary[500]} />
            </View>
          }
          persistor={persistor}
        >
          <AppContent />
        </PersistGate>
      </Provider>
    </QueryClientProvider>
  );
};

export default RootLayout;