import { View, Text } from "react-native";
import React from "react";
import { Stack, useRouter } from "expo-router";
import colors from "@/utils/colors";
import NotificationIconButton from "@/features/Home/Components/NotificationIconButton";
import BackButton from "@/features/Home/Components/BackButton";

export default function AccountLayout() {
  const router = useRouter();
  return (
    <Stack
      screenOptions={{
        headerBackButtonDisplayMode: "generic",
        headerShadowVisible: false,
        headerLeft: () => <BackButton className="" />,
        headerRight: () => <NotificationIconButton className="mr-4" />,
        headerTitle: ({ children }: { children: any }) => (
          <Text className="font-semibold text-lg ">My {children}</Text>
        ),
      }}
    >
      <Stack.Screen
        name="notification/index"
        options={{
          title: "Notification",
        }}
      />
      <Stack.Screen
        name="index"
        options={{
          title: "In",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="calendar/index"
        options={{
          title: "Calender",
        }}
      />
      <Stack.Screen
        name="appointment/index"
        options={{
          title: "Appointments",
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
          title: "Profile Verification Code",
        }}
      />
      <Stack.Screen
        name="consult"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}
