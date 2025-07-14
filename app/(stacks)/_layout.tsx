import React from "react";
import { Stack } from "expo-router";
import { View, Text } from "react-native";
import { useTranslation } from "react-i18next";
import BackButton from "@/features/Home/Components/BackButton";

export default function StacksLayout() {
  const { t } = useTranslation();

  return (
    <Stack
      screenOptions={{
        headerLeft: () => <BackButton className="mr-4" />,
      }}
    >
      <Stack.Screen
        name="fatoorah/MyFatoorahWebView"
        options={{
          headerTitle: () => (
            <Text className="font-semibold text-lg">
              {t("payment")}
            </Text>
          ),
        }}
      />
      <Stack.Screen
        name="notification/index"
        options={{
          headerTitle: () => (
            <Text className="font-semibold text-lg">
              {t("notification")}
            </Text>
          ),
        }}
      />
      <Stack.Screen
        name="help/ticket"
        options={{
          headerTitle: () => (
            <Text className="font-semibold text-lg">
              {t("tickets")}
            </Text>
          ),
        }}
      />
    </Stack>
  );
}
