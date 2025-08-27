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
        headerShown: false,
      }}
    >
    </Stack>
  );
}
