import { View, Text } from "react-native";
import React from "react";
import { Stack } from "expo-router";
import colors from "@/utils/colors";
import NotificationIconButton from "@/features/Home/Components/NotificationIconButton";
import BackButton from "@/features/Home/Components/BackButton";
import { useTranslation } from "react-i18next";

export default function ConsultLayout() {
  const { t } = useTranslation();

  return (
    <Stack
      screenOptions={{
        headerLeft:() =><BackButton className="mr-4"/>,
        headerRight: () => <NotificationIconButton className="mr-4" />,
        headerShadowVisible: true,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          headerTitle: () => (
            <Text className="font-semibold text-lg">
              {" "}
              {t("Schedule booking")}
            </Text>
          ),
        }}
      />
      <Stack.Screen
        name="s/[specialist_Id]/index"
        options={{
          headerTitle: () => (
            <Text className="font-semibold text-lg">
              {" "}
              {t("Specialist Details")}
            </Text>
          ),
        }}
      />
      <Stack.Screen
        name="s/[specialist_Id]/session"
        options={{
          headerTitle: () => (
            <Text className="font-semibold text-lg">
              {t("Schedule Appointment")}
            </Text>
          ),
        }}
      />
    </Stack>
  );
}
