import { View, Text, FlatList } from "react-native";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { useRouter } from "expo-router";
import { cn } from "@/lib/utils";
import AppointmentCard from "@/features/account/components/AppointmentCard";
import { AppointmentCardType } from "@/features/account/types/account.types";
import { apiNewUrl } from "@/const";
import { useSelector } from "react-redux";
import { toast } from "sonner-native";

export default function AccountAppointmentsPage() {
  const router = useRouter();
  const user = useSelector((state: any) => state.user);
  const [activeTab, setActiveTab] = useState("My Sessions");
  const [activeCategory, setActiveCategory] = useState("Current");
  const [appointments, setAppointments] = useState<AppointmentCardType[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch data based on active tab and category
  useEffect(() => {
    const fetchAppointments = async () => {
      if (!user?._id) {
        toast.error("User is not authenticated.");
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(
          `${apiNewUrl}/booking/list?userId=${user._id}&type=${activeTab}&category=${activeCategory}`
        );
        const result = await response.json();

        if (response.ok && result.success) {
          setAppointments(result.data);
        } else {
          toast.error("Failed to fetch appointments.");
        }
      } catch (error) {
        console.error("Error fetching appointments:", error);
        toast.error("An error occurred while fetching appointments.");
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [activeTab, activeCategory, user]);

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
        {loading ? (
          <Text className="text-center text-gray-500 mt-4">Loading...</Text>
        ) : appointments.length > 0 ? (
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
