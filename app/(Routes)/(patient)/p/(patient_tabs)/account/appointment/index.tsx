import { View, Text, ScrollView } from "react-native";
import React from "react";
import { Button } from "@/components/ui/Button";
import { RelativePathString, useRouter } from "expo-router";

export default function AccountAppointmentsPage() {
  const router = useRouter();
  return (
    <ScrollView
      contentContainerStyle={{ paddingBottom: 20 }} // Ensures some padding at the bottom
      showsVerticalScrollIndicator={false}
      className="bg-blue-50/20"
    >
      <View className="p-4 flex flex-col gap-4">
        <Text className="font-semibold text-xl">My Appointments</Text>
        <View className="w-full flex flex-row gap-2">
          {[
            { title: "My Groups", link: "/" },
            { title: "My apps", link: "/" },
            { title: "My Sessions", link: "/" },
          ].map((e, i) => (
            <Button
              onPress={() => router.push(e.link as RelativePathString)}
              className="flex-1 rounded-2xl"
            >
              <Text className="text-white font-semibold text-sm">{e.title}</Text>
            </Button>
          ))}
        </View>
      </View>
      <View className="p-4 flex flex-col gap-4">
        <Text className="font-semibold text-xl">Appointment Category</Text>
        <View className="w-full flex flex-row gap-2">
          {[
            { title: "Canceled", link: "/" },
            { title: "Completed", link: "/" },
            { title: "Current", link: "/" },
          ].map((e, i) => (
            <Button
              onPress={() => router.push(e.link as RelativePathString)}
              className="flex-1 rounded-2xl"
            >
              <Text className="text-white font-semibold text-sm">{e.title}</Text>
            </Button>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}
