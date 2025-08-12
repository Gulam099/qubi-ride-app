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
        name="joinroom/[roomId]/index"
        options={{
          headerTitle: () => (
            <Text className="font-semibold text-lg">
              {t("joinRoom")}
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
      <Stack.Screen
        name="find-consultant/index"
        options={{
          headerTitle: () => (
            <Text className="font-semibold text-lg">
              {t("Help me find the right consultant")}
            </Text>
          ),
        }}
      />
      <Stack.Screen
        name="find-consultant/step1"
        options={{
          headerTitle: () => (
            <Text className="font-semibold text-lg">
              {t("Help me find the right consultant")}
            </Text>
          ),
        }}
      />
      <Stack.Screen
        name="find-consultant/step2"
        options={{
          headerTitle: () => (
            <Text className="font-semibold text-lg">
              {t("Help me find the right consultant")}
            </Text>
          ),
        }}
      />
      <Stack.Screen
        name="help/index"
        options={{
          headerTitle: () => (
            <Text className="font-semibold text-lg">
              {t("HelpCenter")}
            </Text>
          ),
        }}
      />
      
      <Stack.Screen
        name="help/faqs"
        options={{
          headerTitle: () => (
            <Text className="font-semibold text-lg">
              {t("Frequently Asked Questions")}
            </Text>
          ),
        }}
      />
       <Stack.Screen
        name="help/numbers"
        options={{
          headerTitle: () => (
            <Text className="font-semibold text-lg">
              {t("NumbersThatConcernYou")}
            </Text>
          ),
        }}
      />
    </Stack>
  );
}
