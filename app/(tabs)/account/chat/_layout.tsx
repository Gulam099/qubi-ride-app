import { View, Text } from "react-native";
import React from "react";
import { Stack, useLocalSearchParams } from "expo-router";
import colors from "@/utils/colors";
import NotificationIconButton from "@/features/Home/Components/NotificationIconButton";
import BackButton from "@/features/Home/Components/BackButton";
import { useUser } from "@clerk/clerk-expo";

export default function ChatLayout() {
const { name } = useLocalSearchParams();
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
