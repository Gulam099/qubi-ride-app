import { View, Text } from "react-native";
import React from "react";
import { Stack } from "expo-router";
import colors from "@/utils/colors";
import NotificationIconButton from "@/features/Home/Components/NotificationIconButton";
import BackButton from "@/features/Home/Components/BackButton";
import { useTranslation } from "react-i18next";

export default function ChatLayout() {
    const { t } = useTranslation();
  
  return (
    <Stack
      screenOptions={{
        headerLeft: () => <BackButton className="mr-4" />,
        headerRight: () => <NotificationIconButton className="mr-4" />,
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          headerTitle: () => (
            <Text className="font-semibold text-lg">{t("Scale")}</Text>
          ),
        }}
      />
      <Stack.Screen
        name="(scale_Test_Page)/depression-scale"
        options={{
          headerTitle: () => (
            <Text className="font-semibold text-lg">{t("Depression scale")}</Text>
          ),
        }}
      />
      <Stack.Screen
        name="(scale_Test_Page)/generalized-anxiety-disorder-scale"
        options={{
          headerTitle: () => (
            <Text className="font-semibold text-lg">
              {t("Generalized Anxiety Disorder scale")}
            </Text>
          ),
        }}
      />
      <Stack.Screen
        name="(scale_Test_Page)/mood-scale"
        options={{
          headerTitle: () => (
            <Text className="font-semibold text-lg">{t("Mood scale")}</Text>
          ),
        }}
      />
      <Stack.Screen
        name="(scale_Test_Page)/quality-of-life-scale"
        options={{
          headerTitle: () => (
            <Text className="font-semibold text-lg">{t("Quality of Life scale")}</Text>
          ),
        }}
      />
      <Stack.Screen
        name="record"
        options={{
          headerLeft: () => (
            <BackButton className="" customBackLink="/account/scale" />
          ),
          headerTitle: () => (
            <Text className="font-semibold text-lg ">{t("ScalesRecord")}</Text>
          ),
        }}
      />
    </Stack>
  );
}
