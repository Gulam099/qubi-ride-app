import { View, Text } from "react-native";
import React from "react";
import { Stack } from "expo-router";
import colors from "@/utils/colors";
import NotificationIconButton from "@/features/Home/Components/NotificationIconButton";

export default function ConsultLayout() {
  return (
    <Stack
      screenOptions={{
        headerShadowVisible: false,
        headerStyle: {
          backgroundColor: colors.blue[900],
        },
        headerTintColor: "white",
        headerBackVisible: true,
        headerRight: () => <NotificationIconButton className="mr-4" />,

        headerTitle: ({ children }) => (
          <Text className="font-semibold text-lg text-white">
            Help me find the right consultant
          </Text>
        ),
        headerBackButtonMenuEnabled: true,
        headerBackButtonDisplayMode: "generic",
      }}
    />
  );
}
