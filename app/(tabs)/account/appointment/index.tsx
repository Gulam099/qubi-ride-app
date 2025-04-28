import { View, Text, FlatList } from "react-native";
import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useRouter } from "expo-router";
import { cn } from "@/lib/utils";
import AppointmentCard from "@/features/account/components/AppointmentCard";
import { AppointmentCardType } from "@/features/account/types/account.types";
import { toast } from "sonner-native";
import { useUser } from "@clerk/clerk-expo";
import { useQuery } from "@tanstack/react-query";
import { ApiResponseType } from "@/const";

async function fetchAppointments({
  userId,
  activeTab,
  activeCategory,
}: {
  userId: string;
  activeTab: string;
  activeCategory: string;
}) {
  const res = await fetch(
    `https://www.baserah.sa/api/booking?patientId=${userId}&type=${activeTab}&status=${activeCategory}`
  );

  if (!res.ok) {
    throw new Error("Failed to fetch appointments"); 
  }

  const result = await res.json();

  return result; // If no bookings, return empty array
}

export default function AccountAppointmentsPage() {
  const router = useRouter();
  const { user } = useUser();
  const userId = user?.publicMetadata?.dbPatientId as string ;

  const [activeTab, setActiveTab] = useState("session");
  const [activeCategory, setActiveCategory] = useState("pending");

  const {
    data: appointment,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<ApiResponseType>({
    queryKey: ["appointments", userId, activeTab, activeCategory],
    queryFn: () => {
      if (!userId) {
        throw new Error("User Id is not found");
      }
      return fetchAppointments({ userId, activeTab, activeCategory });
    },
    enabled: !!userId, // Only run query if userId exists
    staleTime: 1000 * 60 * 2, // 2 minutes cache
  });

  console.log("appointments", appointment);
  console.log(isError , error);
  
  



  return (
    <View className="bg-blue-50/20 w-full h-full px-4 flex flex-col gap-2">
      <View className="py-4 flex flex-col gap-4">
        <Text className="font-semibold ">My Appointments</Text>
        <View className="w-full flex flex-row gap-2">
          {["group", "program", "session"].map((tab) => {
            const isActive = tab === activeTab;
            return (
              <Button
                key={tab}
                size={"sm"}
                className={cn(
                  isActive ? "bg-blue-900" : "bg-white",
                  "w-36 h-9 rounded-xl"
                )}
                onPress={() => setActiveTab(tab)}
              >
                <Text
                  className={cn(isActive ? "text-white" : "", "font-medium")}
                >
                  {`My ${tab.charAt(0).toUpperCase() + tab.slice(1)}s`}
                </Text>
              </Button>
            );
          })}
        </View>
      </View>

      <View className="py-4 flex flex-col gap-4">
        <Text className="font-semibold ">Appointment Category</Text>
        <View className="w-full flex flex-row gap-2">
          {["cancelled", "completed", "pending"].map((category) => {
            const isActive = category === activeCategory;
            return (
              <Button
                key={category}
                size={"sm"}
                className={cn(
                  isActive ? "bg-blue-900" : "bg-white",
                  "w-36 h-9 rounded-xl"
                )}
                onPress={() => setActiveCategory(category)}
              >
                <Text
                  className={cn(isActive ? "text-white" : "", "font-medium", "capitalize")}
                >
                  {category}
                </Text>
              </Button>
            );
          })}
        </View>
      </View>

      <View>
        {isLoading ? (
          <Text className="text-center text-gray-500 mt-4">Loading...</Text>
        ) : isError ? (
          <Text className="text-center text-red-500 mt-4">
            Failed to load appointments.
          </Text>
        ) : appointment?.data.length > 0 ? (
          <FlatList
            data={appointment?.data}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <AppointmentCard
                _id={item._id}
                specialist_Id={item.specialist_Id}
                doctorName={item.doctorName}
                sessionDateTime={item.sessionDateTime ?? new Date()}
                image={item.image}
                type={item.type}
                category={item.category}
              />
            )}
          />
        ) : (
          <Text className="text-center text-gray-500 mt-4">
            No appointments available.
          </Text>
        )}
      </View>
    </View>
  );
}
