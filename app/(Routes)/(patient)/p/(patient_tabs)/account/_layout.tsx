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

        headerBackVisible: true,
        headerRight: () => <NotificationIconButton className="mr-4" />,
        headerTitle: ({ children }) => (
          <Text className="font-semibold text-lg ">My {children}</Text>
        ),
        headerBackButtonMenuEnabled: true,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "In",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="calendar/index"
        options={{
          title: "Calender",
        }}
      />
      <Stack.Screen
        name="appointment/index"
        options={{
          title: "Appointments",
        }}
      />
    </Stack>
  );
}
