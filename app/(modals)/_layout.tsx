import React from "react";
import { Stack } from "expo-router";
import BackButton from "@/features/Home/Components/BackButton";
import { Text } from "@/components/ui/Text";

export default function ModalsLayout() {
  return (
    <Stack
      screenOptions={{
        headerBackVisible: false,
        headerShadowVisible: false,
        headerBackButtonMenuEnabled: false,
        headerLeft: () => <BackButton />,
        presentation: "modal",
        headerTitle: ({ children }) => <Text>{children}</Text>,
      }}
    />
  );
}
