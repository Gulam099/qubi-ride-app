import { View, Text } from "react-native";
import React from "react";
import { Stack } from "expo-router";
import colors from "@/utils/colors";
import NotificationIconButton from "@/features/Home/Components/NotificationIconButton";
import BackButton from "@/features/Home/Components/BackButton";

export default function ProgramLayout() {
  return (
    <Stack
      screenOptions={{
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "In",
          headerLeft: () => <BackButton className="p" />,
          headerRight: () => <NotificationIconButton className="mr-4" />,
          headerTitle: () => (
            <Text className="font-semibold text-lg  px-2">
              Cultural Library
            </Text>
          ),
        }}
      />

      {/* <Stack.Screen name="[library]/index" options={{ headerShown: false }} /> */}
    </Stack>
  );
}
