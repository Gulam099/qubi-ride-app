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
      <Stack.Screen
        name="notification/index"
        options={{
          title: "Notifications",
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
        name="favorite/index"
        options={{
          title: "Favorites",
        }}
      />
      <Stack.Screen
        name="family/index"
        options={{
          title: "Family",
        }}
      />
      <Stack.Screen
        name="profile/index"
        options={{
          title: "Profile",
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
        name="setting/index"
        options={{
          title: "Settings",
        }}
      />
      <Stack.Screen
        name="consult"
        options={{
          headerShown: false,
        }}
      />
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
