import { View, Text, ScrollView, FlatList } from "react-native";
import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useRouter } from "expo-router";
import { cn } from "@/lib/utils";
import { AppointmentData } from "@/features/account/constAccount";
import AppointmentCard from "@/features/account/components/AppointmentCard";

export default function AccountAppointmentsPage() {
  const router = useRouter();
  const [ActiveTab, setActiveTab] = useState({
    appointment: "My Sessions",
    appointmentCategory: "Current",
  });
  return (
    <View className="bg-blue-50/20 w-full h-full px-4 flex flex-col gap-2">
      <View className="py-4 flex flex-col gap-4">
        <Text className="font-semibold text-xl">My Appointments</Text>
        <View className="w-full flex flex-row gap-2">
          {["My Groups", "My Apps", "My Sessions"].map((e, i) => {
            const isActiveTabThis = e === ActiveTab.appointment;
            return (
              <Button
                key={e + i}
                size={"sm"}
                className={cn(
                  isActiveTabThis ? "bg-blue-900" : "bg-white",
                  "w-36 h-9 rounded-xl  "
                )}
              >
                <Text
                  className={cn(
                    isActiveTabThis ? "text-white" : "",
                    "font-medium"
                  )}
                >
                  {e}
                </Text>
              </Button>
            );
          })}
        </View>
      </View>
      <View className="py-4 flex flex-col gap-4">
        <Text className="font-semibold text-xl">Appointment Category</Text>
        <View className="w-full flex flex-row gap-2">
          {["Canceled", "Completed", "Current"].map((e, i) => {
            const isActiveTabThis = e === ActiveTab.appointmentCategory;
            return (
              <Button
                key={e + i}
                size={"sm"}
                className={cn(
                  isActiveTabThis ? "bg-blue-900" : "bg-white",
                  "w-36 h-9 rounded-xl  "
                )}
              >
                <Text
                  className={cn(
                    isActiveTabThis ? "text-white" : "",
                    "font-medium"
                  )}
                >
                  {e}
                </Text>
              </Button>
            );
          })}
        </View>
      </View>
      <View>
        <FlatList
          data={AppointmentData}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <AppointmentCard {...item} />}
        />
      </View>
    </View>
  );
}
