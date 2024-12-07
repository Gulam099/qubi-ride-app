import { View, Text } from "react-native";
import React from "react";
import { Stack } from "expo-router";
import colors from "@/utils/colors";
import NotificationIconButton from "@/features/Home/Components/NotificationIconButton";

export default function AccountLayout() {
  return (
    <Stack
      screenOptions={{
        headerBackButtonDisplayMode: "generic",
        headerShadowVisible: false,
        headerStyle: {
          backgroundColor: colors.gray[500],
        },
        headerRight: () => <NotificationIconButton className="mr-4" />,
        headerTitle: ({ children }) => (
          <Text className="font-semibold text-lg text-white">
            My {children}
          </Text>
        ),
        headerBackButtonMenuEnabled: true,
      }}
    />
  );
}
