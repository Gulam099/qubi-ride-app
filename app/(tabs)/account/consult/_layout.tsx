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
        headerRight: () => <NotificationIconButton className="mr-4" />,
        headerShadowVisible: false,
        headerTintColor: "white",
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          headerLeft: () => <BackButton customBackLink="/" className="" />,
          headerTitle: () => (
            <Text className="font-semibold text-lg ">Consultants</Text>
          ),
        }}
      />
      <Stack.Screen
        name="s/[specialist_Id]/session"
        options={{
          headerLeft: () => <BackButton customBackLink="/" />,
          headerTitle: () => (
            <Text className="font-semibold text-lg ">Session Details</Text>
          ),
        }}
      />

      <Stack.Screen
        name="help"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}
