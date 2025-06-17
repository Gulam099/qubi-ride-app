import { View, Text } from "react-native";
import React from "react";
import { Stack } from "expo-router";
import colors from "@/utils/colors";
import NotificationIconButton from "@/features/Home/Components/NotificationIconButton";
import BackButton from "@/features/Home/Components/BackButton";

export default function ChatLayout() {
  return (
    <Stack
      screenOptions={{
        headerBackVisible: true,
        headerRight: () => <NotificationIconButton className="mr-4" />,
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          headerTitle: () => (
            <Text className="font-semibold text-lg">Scale</Text>
          ),
        }}
      />
      <Stack.Screen
        name="(scale_Test_Page)/depression-scale"
        options={{
          headerTitle: () => (
            <Text className="font-semibold text-lg">Scale</Text>
          ),
        }}
      />
      <Stack.Screen
        name="(scale_Test_Page)/generalized-anxiety-disorder-scale"
        options={{
          headerTitle: () => (
            <Text className="font-semibold text-lg">
              Generalized Anxiety Disorder scale
            </Text>
          ),
        }}
      />
      <Stack.Screen
        name="(scale_Test_Page)/mood-scale"
        options={{
          headerTitle: () => (
            <Text className="font-semibold text-lg">Mood</Text>
          ),
        }}
      />
      <Stack.Screen
        name="(scale_Test_Page)/quality-of-life-scale"
        options={{
          headerTitle: () => (
            <Text className="font-semibold text-lg">Quality of Life scale</Text>
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
            <Text className="font-semibold text-lg ">Scales Record</Text>
          ),
        }}
      />
    </Stack>
  );
}
