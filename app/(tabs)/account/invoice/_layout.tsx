import { View, Text } from "react-native";
import React from "react";
import { Stack } from "expo-router";
import colors from "@/utils/colors";
import NotificationIconButton from "@/features/Home/Components/NotificationIconButton";
import BackButton from "@/features/Home/Components/BackButton";

export default function InvoiceLayout() {
  return (
    <Stack
      screenOptions={{
        headerLeft: () => <BackButton className="" />,
        headerRight: () => <NotificationIconButton className="mr-4" />,
        headerShadowVisible: false,
        headerTintColor: "white",
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          headerTitle: () => (
            <Text className="font-semibold text-lg">My Invoices</Text>
          ),
        }}
      />
      <Stack.Screen
        name="[invoice_Id]/index"
        options={{
          headerTitle: () => (
            <Text className="font-semibold text-lg">Invoice Details</Text>
          ),
        }}
      />
    </Stack>
  );
}
