import { View, Text } from "react-native";
import React from "react";
import { Stack } from "expo-router";
import colors from "@/utils/colors";
import NotificationIconButton from "@/features/Home/Components/NotificationIconButton";
import BackButton from "@/features/Home/Components/BackButton";
import { useTranslation } from "react-i18next";

export default function ProgramLayout() {
  const { t } = useTranslation();

  return (
    <Stack
      screenOptions={{
        headerLeft: () => <BackButton className="mr-4" />,
        headerShadowVisible: false,
        headerRight: () => <NotificationIconButton className="mr-4" />,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          headerTitle: () => (
            <Text className="font-semibold text-lg  px-2">{t("Group")}</Text>
          ),
        }}
      />
      {/* <Stack.Screen
        
        options={{
          headerTitle: () => (
            <Text className="font-semibold text-lg">{t("Group")}</Text>
          ),
        }}
      /> */}
    </Stack>
  );
}
