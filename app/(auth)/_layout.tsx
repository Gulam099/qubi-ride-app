import { Redirect, Stack } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";
import { SafeAreaView } from "react-native";

const UnAuthenticatedLayout = () => {
  return <Stack screenOptions={{ headerShown: false }}></Stack>;
};

export default UnAuthenticatedLayout();
