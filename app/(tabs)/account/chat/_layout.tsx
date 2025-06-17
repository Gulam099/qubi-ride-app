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
        headerBackVisible: true,
        headerRight: () => <NotificationIconButton className="mr-4" />,
        headerShadowVisible: true,
      }}
    >
      <Stack.Screen
        name="chatlist"
        options={{
          headerTitle: () => (
            <Text className="font-semibold text-lg">My Chats</Text>
          ),
        }}
      />
    </Stack>
  );
}
