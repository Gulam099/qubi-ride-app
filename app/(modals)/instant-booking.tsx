// app/(modals)/instant-booking.tsx

import { ScrollView } from "react-native";
import React from "react";
import { Stack, useRouter } from "expo-router";
import InstantBookingContent from "@/features/Home/Components/InstantBookingContent";
import { Button } from "@/components/ui/Button";
import NotificationIconButton from "@/features/Home/Components/NotificationIconButton";

export default function InstantBookingModal() {
  const router = useRouter();
  return (
    <>
      <Stack.Screen
        options={{
          title: "Instant Booking",
          headerRight: () => <NotificationIconButton className="mr-4" />,
        }}
      />

      <ScrollView className="flex-1 bg-background ">
        <InstantBookingContent />
      </ScrollView>
    </>
  );
}
