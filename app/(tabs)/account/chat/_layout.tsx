import { View, Text } from "react-native";
import React from "react";
import { Stack, useLocalSearchParams } from "expo-router";
import colors from "@/utils/colors";
import NotificationIconButton from "@/features/Home/Components/NotificationIconButton";
import BackButton from "@/features/Home/Components/BackButton";

export default function ChatLayout() {
  const { name } = useLocalSearchParams();

  return (
    <Stack
      screenOptions={{
        headerLeft: () => <BackButton className="mr-4" />,
        headerRight: () => <NotificationIconButton className="mr-4" />,
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="chatlist"
        options={{
          headerTitle: () => (
            <Text className="font-semibold text-lg">
              "My chats
            </Text>
          ),
        }}
      />
      <Stack.Screen
        name="c/[id]/index"
        options={{
          headerTitle: () => (
            <Text className="font-semibold text-lg">{name}</Text>
          ),
        }}
      />
    </Stack>
  );
}
