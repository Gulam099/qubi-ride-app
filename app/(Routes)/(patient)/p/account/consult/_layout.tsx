import { View, Text } from "react-native";
import React from "react";
import { Stack } from "expo-router";
import colors from "@/utils/colors";
import NotificationIconButton from "@/features/Home/Components/NotificationIconButton";

export default function ConsultLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: "In",
          headerShown: false,
        }}
      />
    </Stack>
  );
}
