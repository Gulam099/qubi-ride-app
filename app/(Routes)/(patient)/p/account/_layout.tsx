import { View, Text } from "react-native";
import React from "react";
import { Stack } from "expo-router";
import colors from "@/utils/colors";
import NotificationIconButton from "@/features/Home/Components/NotificationIconButton";
import BackButton from "@/features/Home/Components/BackButton";

export default function AccountLayout() {
  return (
    <Stack
      screenOptions={{
        headerBackButtonDisplayMode: "generic",
        headerShadowVisible: false,
        headerLeft: () => <BackButton className="p" />,
        headerRight: () => <NotificationIconButton className="mr-4" />,
        headerTitle: ({ children }) => (
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
        name="consult"
        options={{
          headerShadowVisible: false,
          headerStyle: {
            backgroundColor: colors.blue[900],
          },
          headerTintColor: "white",

          headerRight: () => <NotificationIconButton className="mr-4" />,

          headerTitle: ({ children }) => (
            <Text className="font-semibold text-lg text-white">
              Help me find the right consultant
            </Text>
          ),
        }}
      />
    </Stack>
  );
}
