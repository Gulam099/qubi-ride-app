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
        headerLeft: () => <BackButton className="mr-4" />,
        headerRight: () => <NotificationIconButton className="mr-4" />,
        headerShown: false,
      }}
    >
      {/* <Stack.Screen
        name="index"
        options={{
          headerTitle: () => (
            <Text className="font-semibold text-lg">
              {t("invoices")}
            </Text>
          ),
        }}
      /> */}
      {/* <Stack.Screen
        name="[invoice_Id]/index"
        options={{
          headerTitle: () => (
            <Text className="font-semibold text-lg">
              {t("invoiceDetails")}
            </Text>
          ),
        }}
      /> */}
    </Stack>
  );
}
