import { View, Text } from "react-native";
import React from "react";
import { Stack } from "expo-router";
import colors from "@/utils/colors";
import NotificationIconButton from "@/features/Home/Components/NotificationIconButton";
import BackButton from "@/features/Home/Components/BackButton";

export default function ConsultLayout() {
  return (
    <Stack
      screenOptions={{
        headerRight: () => <NotificationIconButton className="mr-4" />,
        headerShadowVisible: false,
        headerTintColor: "white",
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          headerStyle: {
            backgroundColor: colors.blue[900],
          },
          headerLeft: () => (
            <BackButton iconColor="white" customBackLink="/" className="" />
          ),

          headerTitle: () => (
            <Text className="font-semibold text-lg text-white">
              Help me find the right consultant
            </Text>
          ),
        }}
      />
      <Stack.Screen
        name="filter"
        options={{
          headerLeft: () => <BackButton className="" />,

          headerTitle: () => (
            <Text className="font-semibold text-lg ">
              Help me find the right consultant
            </Text>
          ),
        }}
      />
      <Stack.Screen
        name="custom"
        options={{
          headerLeft: () => <BackButton className="" />,

          headerTitle: () => (
            <Text className="font-semibold text-lg ">
              Help me find the right consultant
            </Text>
          ),
        }}
      />
    </Stack>
  );
}
