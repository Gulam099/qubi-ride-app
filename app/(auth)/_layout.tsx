import { Redirect, Stack } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";
import { SafeAreaView } from "react-native";

export default function UnAuthenticatedLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      
    </Stack>
  );
}
