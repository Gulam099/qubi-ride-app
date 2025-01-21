import { View, Text, FlatList } from "react-native";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { useRouter } from "expo-router";
import { cn } from "@/lib/utils";
import AppointmentCard from "@/features/account/components/AppointmentCard";
import { AppointmentCardType } from "@/features/account/types/account.types";

// Mock API response for different tabs and categories
const mockData = {
  "My Sessions": {
    Current: [
      {
        _id: "1",
        specialist_Id: "1",
        doctorName: "Dr. Abdul Wahab Muhammad",
        sessionDateTime: "2024-12-22T01:30:00Z",
        image: "https://via.placeholder.com/50",
        type: "current",
        category: "session",
      },
    ],
    Completed: [
      {
        _id: "3",
        specialist_Id: "2",
        doctorName: "Dr. Abdul Wahab Muhammad",
        sessionDateTime: "2024-12-21T01:30:00Z",
        image: "https://via.placeholder.com/50",
        type: "completed",
        category: "session",
      },
    ],
    Canceled: [
      {
        _id: "2",
        specialist_Id: "2",
        doctorName: "Dr. Abdul Wahab Muhammad",
        sessionDateTime: "2024-12-21T01:30:00Z",
        image: "https://via.placeholder.com/50",
        type: "canceled",
        category: "session",
      },
    ],
  },
  "My Program": {
    Current: [],
    Completed: [],
    Canceled: [],
  },
  "My Groups": {
    Current: [],
    Completed: [],
    Canceled: [],
  },
};

export default function AccountAppointmentsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("My Sessions");
  const [activeCategory, setActiveCategory] = useState("Current");
  const [appointments, setAppointments] = useState<AppointmentCardType[]>([]);

  // Fetch data based on active tab and category
  useEffect(() => {
    const fetchAppointments = async () => {
      // Simulate API call
      const data = mockData[activeTab][activeCategory] || [];
      setAppointments(data);
    };

    fetchAppointments();
  }, [activeTab, activeCategory]);

  return (
    <View className="bg-blue-50/20 w-full h-full px-4 flex flex-col gap-2">
      <View className="py-4 flex flex-col gap-4">
        <Text className="font-semibold text-xl">My Appointments</Text>
        <View className="w-full flex flex-row gap-2">
          {["My Groups", "My Program", "My Sessions"].map((tab) => {
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
                  {tab}
                </Text>
              </Button>
            );
          })}
        </View>
      </View>
      <View className="py-4 flex flex-col gap-4">
        <Text className="font-semibold text-xl">Appointment Category</Text>
        <View className="w-full flex flex-row gap-2">
          {["Canceled", "Completed", "Current"].map((category) => {
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
                  className={cn(isActive ? "text-white" : "", "font-medium")}
                >
                  {category}
                </Text>
              </Button>
            );
          })}
        </View>
      </View>
      <View>
        {appointments.length > 0 ? (
          <FlatList
            data={appointments}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <AppointmentCard
                _id={item._id}
                specialist_Id={item.specialist_Id}
                doctorName={item.doctorName}
                sessionDateTime={item.sessionDateTime}
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
