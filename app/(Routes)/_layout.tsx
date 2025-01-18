import { Text } from "@/components/ui/Text";
import BackButton from "@/features/Home/Components/BackButton";
import NotificationIconButton from "@/features/Home/Components/NotificationIconButton";
import { Stack, Tabs } from "expo-router";
import React from "react";

export default function TabLayout() {
  return (
    // <Stack
    //   screenOptions={{
    //     headerShown: false,
    //   }}
    // />
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="(patient)/p" options={{ headerShown: false }} />
      <Stack.Screen name="(patient)/help" options={{ headerShown: false }} />
      <Stack.Screen name="(patient)/(nt)" options={{ headerShown: false }} />
    </Stack>
  );
}
