// app/(modals)/instant-booking.tsx

import { ScrollView } from "react-native";
import React from "react";
import { Stack, useRouter } from "expo-router";
import InstantBookingContent from "@/features/Home/Components/InstantBookingContent";
import { Button } from "@/components/ui/Button";
import { X } from "lucide-react-native";

export default function InstantBookingModal() {
  const router = useRouter();
  return (
    <>
      <Stack.Screen
        options={{
          title: "Instant Booking",
          headerRight: () => (
            <Button
              size={"icon"}
              variant={"ghost"}
              onPress={() => router.back()}
            >
              <X size={20} color={"#262626"} />
            </Button>
          ),
        }}
      />

      <ScrollView className="flex-1 bg-background ">
        <InstantBookingContent />
      </ScrollView>
    </>
  );
}
