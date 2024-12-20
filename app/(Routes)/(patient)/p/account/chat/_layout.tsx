import { View, Text } from "react-native";
import React from "react";
import { Stack } from "expo-router";
import colors from "@/utils/colors";
import NotificationIconButton from "@/features/Home/Components/NotificationIconButton";
import BackButton from "@/features/Home/Components/BackButton";

export default function ChatLayout() {
  return (
    <Stack
      screenOptions={{
        headerLeft: () => <BackButton className="" />,
        headerRight: () => <NotificationIconButton className="mr-4" />,
        headerShadowVisible: false,
        headerTintColor: "white",
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          headerTitle: () => (
            <Text className="font-semibold text-lg">My Chats</Text>
          ),
        }}
      />
      <Stack.Screen
        name="[specialistId_chat]/index"
        options={{
          headerTitle: ({ children }) => (
            <Text className="font-semibold text-lg">My Chats</Text>
          ),
        }}
      />
    </Stack>
  );
}
