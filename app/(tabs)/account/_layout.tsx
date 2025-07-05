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
        headerBackVisible: true,
        headerShadowVisible: true,
        headerRight: () => <NotificationIconButton className="mr-4" />,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />
      {/* <Stack.Screen
        name="notification/index"
         options={{
          headerTitle: () => (
            <Text className="font-semibold text-lg">{t("notifications")}</Text>
          ),
        }}
      /> */}

      <Stack.Screen
        name="calendar/index"
         options={{
          headerTitle: () => (
            <Text className="font-semibold text-lg">{t("calendar")}</Text>
          ),
        }}
      />
      <Stack.Screen
        name="appointment/index"
         options={{
          headerTitle: () => (
            <Text className="font-semibold text-lg">{t("appointments")}</Text>
          ),
        }}
      />
      <Stack.Screen
        name="favorite/index"
        options={{
          headerTitle: () => (
            <Text className="font-semibold text-lg">{t("favorites")}</Text>
          ),
        }}
      />
      <Stack.Screen
        name="family/index"
         options={{
          headerTitle: () => (
            <Text className="font-semibold text-lg">{t("family")}</Text>
          ),
        }}
      />
      <Stack.Screen
        name="profile/index"
        options={{
          headerTitle: () => (
            <Text className="font-semibold text-lg">{t("profile")}</Text>
          ),
        }}
      />

      <Stack.Screen
        name="payment/index"
        options={{
          headerTitle: () => (
            <Text className="font-semibold text-lg ">Payment</Text>
          ),
        }}
      />
      <Stack.Screen
        name="report/index"
         options={{
          headerTitle: () => (
            <Text className="font-semibold text-lg">
              {t("profileVerificationCode")}
            </Text>
          ),
        }}
      />
      <Stack.Screen
        name="setting/index"
        options={{
          headerTitle: () => <Text className="font-semibold text-lg ">{t("settings")}</Text>,
        }}
      />
      {/* <Stack.Screen
        name="consult"
        options={{
          headerShown: false,
        }}
      /> */}
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
      <Stack.Screen
        name="scale"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}
