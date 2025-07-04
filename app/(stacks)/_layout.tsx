import React from "react";
import { Stack } from "expo-router";
import { View, Text } from "react-native";
import { useTranslation } from "react-i18next";

export default function StacksLayout() {
    const { t } = useTranslation();
  
  return (
    <Stack screenOptions={{ headerShown: true }}>
      <Stack.Screen
        name="notification/index"
        options={{
          headerTitle: () => (
            <Text className="font-semibold text-lg">{t("notification")}</Text>
          ),
        }}
      />
    </Stack>
  );
}
