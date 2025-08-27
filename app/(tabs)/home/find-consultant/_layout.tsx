import { View, Text } from "react-native";
import React from "react";
import { Stack } from "expo-router";
import colors from "@/utils/colors";
import NotificationIconButton from "@/features/Home/Components/NotificationIconButton";
import BackButton from "@/features/Home/Components/BackButton";
import { WhiteBackButton } from "@/features/Home/Components/BackButton";
import { useTranslation } from "react-i18next";

export default function ProgramLayout() {
  const { t } = useTranslation();

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: "#000F8F", 
        },
        headerTintColor: "#fff", 
        headerTitleStyle: {
          color: "#fff",
          fontWeight: "500",
          fontSize: 16,
        },
        headerLeft: () => <WhiteBackButton className="mr-4"  />,
        headerRight: () => <NotificationIconButton className="mr-4" />,
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          headerTitle: "Help me find the right consultant",
        }}
      />
      <Stack.Screen
        name="step1"
        options={{
          headerTitle: "Help me find the right consultant",
        }}
      />
      <Stack.Screen
        name="step2"
        options={{
          headerTitle: "Help me find the right consultant",
        }}
      />
    </Stack>
  );
}
