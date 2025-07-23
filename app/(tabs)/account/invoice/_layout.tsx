import { View, Text } from "react-native";
import React from "react";
import { Stack } from "expo-router";
import colors from "@/utils/colors";
import NotificationIconButton from "@/features/Home/Components/NotificationIconButton";
import BackButton from "@/features/Home/Components/BackButton";
import { useTranslation } from "react-i18next";

export default function InvoiceLayout() {
    const { t } = useTranslation();

  return (
    <Stack
      screenOptions={{
        headerBackVisible: true,
        headerRight: () => <NotificationIconButton className="mr-4" />,
        headerShadowVisible: true,
        headerTintColor: "white",
        headerStyle: {
          backgroundColor: "#666666",
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          headerTitle: () => (
            <Text className="font-semibold text-lg text-white">{t("invoices")}</Text>
          ),
        }}
      />
      <Stack.Screen
        name="[invoice_Id]/index"
        options={{
          headerTitle: () => (
            <Text className="font-semibold text-lg text-white">{t("invoiceDetails")}</Text>
          ),
        }}
      />
    </Stack>
  );
}
