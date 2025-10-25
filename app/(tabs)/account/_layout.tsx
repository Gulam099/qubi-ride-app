import { View, Text } from "react-native";
import React from "react";
import { Stack, useRouter } from "expo-router";
import colors from "@/utils/colors";
import NotificationIconButton from "@/features/Home/Components/NotificationIconButton";
import BackButton from "@/features/Home/Components/BackButton";
import { useTranslation } from "react-i18next";

export default function AccountLayout() {
  const { t } = useTranslation();

  const router = useRouter();
  return (
    <Stack
      screenOptions={{
        headerBackButtonDisplayMode: "generic",
        // headerLeft: () => <BackButton className="mr-4" />,
        headerShown: false,
        // headerRight: () => <NotificationIconButton className="mr-4" />,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="chat"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="invoice"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}
