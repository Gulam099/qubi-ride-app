import { View, Text } from "react-native";
import React from "react";
import { Stack } from "expo-router";
import colors from "@/utils/colors";
import NotificationIconButton from "@/features/Home/Components/NotificationIconButton";
import BackButton from "@/features/Home/Components/BackButton";

export default function ConsultLayout() {
  return (
    <Stack
      screenOptions={{
        headerBackVisible: true,
        headerRight: () => <NotificationIconButton className="mr-4" />,
        headerShadowVisible: true,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          headerTitle: () => (
            <Text className="font-semibold text-lg">Schedule booking</Text>
          ),
        }}
      />
      <Stack.Screen
        name="s/[specialist_Id]/index"
        options={{
          headerTitle: () => (
            <Text className="font-semibold text-lg">Specialist Details</Text>
          ),
        }}
      />
      <Stack.Screen
        name="s/[specialist_Id]/session"
        options={{
          headerTitle: () => (
            <Text className="font-semibold text-lg">Schedule Appointment</Text>
          ),
        }}
      />
    </Stack>
  );
}
