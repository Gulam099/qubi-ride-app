import { Text } from "@/components/ui/Text";
import BackButton from "@/features/Home/Components/BackButton";
import NotificationIconButton from "@/features/Home/Components/NotificationIconButton";
import { Stack, Tabs } from "expo-router";
import React from "react";

export default function HelpLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        headerShadowVisible: false,
        headerRight: () => <NotificationIconButton className="mr-4" />,
        headerStyle: {
          backgroundColor: "white",
        },
        headerTitle: ({ children }) => (
          <Text className="font-semibold text-lg">{children}</Text>
        ),
        headerLeft: () => <BackButton />,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          headerTitle: ({ children }) => (
            <Text className="font-semibold text-lg">Help Center</Text>
          ),
        }}
      />
      <Stack.Screen
        name="faqs"
        options={{
          headerTitle: ({ children }) => (
            <Text className="font-semibold text-lg">
              Frequently Asked Questions (FAQ)
            </Text>
          ),
        }}
      />
      <Stack.Screen
        name="numbers"
        options={{
          headerTitle: ({ children }) => (
            <Text className="font-semibold text-lg">Numbers concern you</Text>
          ),
        }}
      />
      {/* <Stack.Screen
        name="ticket"
        options={{
          headerTitle: ({ children }) => (
            <Text className="font-semibold text-lg">Tickets</Text>
          ),
        }}
      /> */}
    </Stack>
  );
}
