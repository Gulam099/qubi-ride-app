import { View, Text } from "react-native";
import React from "react";
import { Stack } from "expo-router";
import BackButton from "@/features/Home/Components/BackButton";
import NotificationIconButton from "@/features/Home/Components/NotificationIconButton";

export default function VideoCallPage() {
  return (
    <View>
      <Stack.Screen
        options={{
          headerShown: true,
          headerLeft: () => <BackButton className="" />,
          headerRight: () => <NotificationIconButton className="mr-4" />,
          headerTitle: () => (
            <Text className="font-semibold text-lg ">Video Call</Text>
          ),
        }}
      />
      <Text>VideoCallPage</Text>
    </View>
  );
}
