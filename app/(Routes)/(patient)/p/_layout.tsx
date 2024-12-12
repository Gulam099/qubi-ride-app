import { Stack, Tabs } from "expo-router";
import React from "react";

export default function PatientTabLayout() {
  return (
    // <Stack
    //   screenOptions={{
    //     headerShown: false,
    //   }}
    // />
    <Stack
      screenOptions={{
        headerShown: false,
        headerBackButtonDisplayMode:"generic"
      }}
    >
      <Stack.Screen name="consult" options={{ headerShown: false }} />
    </Stack>
  );
}
