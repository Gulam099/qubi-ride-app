import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Stack, Tabs } from "expo-router";
import { Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AuthLayout() {
  const colorScheme = useColorScheme();
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Stack screenOptions={{headerShown:false}} />
    </SafeAreaView>
  );
}
