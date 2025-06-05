import React, { useEffect, useState } from "react";
import {
  FlatList,
  View,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { Text } from "@/components/ui/Text";
import { useSelector } from "react-redux";
import { AppStateType } from "@/features/setting/types/setting.type";
import { useUser } from "@clerk/clerk-expo";
import {
  fetchAppointments,
  fetchInstantAppointments,
} from "@/features/util/constHome";
import AppointmentCard from "@/features/account/components/AppointmentCard";

type TabType = "scheduled" | "instant";

export default function AppointmentUpcomingList() {
  const { user } = useUser();
  const userId = user?.publicMetadata?.dbPatientId as string;

  const appState: AppStateType = useSelector((state: any) => state.appState);

  const [activeTab, setActiveTab] = useState<TabType>("scheduled");
  const [scheduledAppointments, setScheduledAppointments] = useState<any[]>([]);
  const [instantAppointments, setInstantAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Separate error states
  const [scheduledError, setScheduledError] = useState("");
  const [instantError, setInstantError] = useState("");


  const applyFilters = (appointments: any[]) => {
    let filteredAppointments = appointments;

    if (appState.filter) {
      const { name, startDate, endDate, sortBy } = appState.filter;

      if (name) {
        filteredAppointments = filteredAppointments.filter((appointment: any) =>
          appointment.user?.name
            ?.toLowerCase()
            .includes(name.toLowerCase())
        );
      }

      if (startDate) {
        filteredAppointments = filteredAppointments.filter(
          (appointment: any) =>
            new Date(appointment.createdAt) >= new Date(startDate)
        );
      }

      if (endDate) {
        filteredAppointments = filteredAppointments.filter(
          (appointment: any) =>
            new Date(appointment.createdAt) <= new Date(endDate)
        );
      }

      if (sortBy) {
        filteredAppointments = filteredAppointments.sort((a: any, b: any) =>
          sortBy === "Recent"
            ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            : new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      }
    }

    return filteredAppointments;
  };

  console.log('userId',userId)
  const loadScheduledAppointments = async () => {
    const response = await fetchAppointments({
      userId: userId,
    });

    if (response.success) {
      const scheduledOnly = response.data.filter((appointment: any) =>
        appointment.type === "scheduled" ||
        appointment.appointmentType === "scheduled" ||
        !appointment.isInstant ||
        (!appointment.type && !appointment.appointmentType)
      );

      const filteredAppointments = applyFilters(scheduledOnly);
      setScheduledAppointments(filteredAppointments);
      setScheduledError("");
    } else {
      setScheduledError(response.message);
    }
  };

  const loadInstantAppointments = async () => {
    const response = await fetchInstantAppointments({
      userId: userId,
    });

    if (response.success) {
      const filteredAppointments = applyFilters(response.data);
      setInstantAppointments(filteredAppointments);
      setInstantError("");
    } else {
      setInstantError(response.message);
    }
  };

  useEffect(() => {
    async function loadAppointments() {
      setLoading(true);
      setScheduledError("");
      setInstantError("");

      try {
        await Promise.all([
          loadScheduledAppointments(),
          loadInstantAppointments(),
        ]);
      } catch (err) {
        setScheduledError("Failed to load scheduled appointments");
        setInstantError("Failed to load instant appointments");
      }

      setLoading(false);
    }

    if (userId) {
      loadAppointments();
    }
  }, [userId, appState.filter]);

  const currentAppointments =
    activeTab === "scheduled" ? scheduledAppointments : instantAppointments;

  return (
    <View className="bg-blue-50/20 flex-1">
      {/* Tab Header */}
      <View className="flex-row bg-white mx-4 mt-4 rounded-lg p-1 shadow-sm">
        <TouchableOpacity
          className={`flex-1 py-3 rounded-md ${
            activeTab === "scheduled" ? "bg-blue-500" : "bg-transparent"
          }`}
          onPress={() => setActiveTab("scheduled")}
        >
          <Text
            className={`text-center font-medium ${
              activeTab === "scheduled" ? "text-white" : "text-gray-600"
            }`}
          >
            Scheduled
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className={`flex-1 py-3 rounded-md ${
            activeTab === "instant" ? "bg-blue-500" : "bg-transparent"
          }`}
          onPress={() => setActiveTab("instant")}
        >
          <Text
            className={`text-center font-medium ${
              activeTab === "instant" ? "text-white" : "text-gray-600"
            }`}
          >
            Instant
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View className="flex-1 p-4">
        {loading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#007BFF" />
          </View>
        ) : (
          <>
            {currentAppointments.length === 0 ? (
              <Text className="text-center text-gray-500">
                No {activeTab} appointments available.
              </Text>
            ) : (
              <FlatList
                data={currentAppointments}
                keyExtractor={(item) => item._id}
                renderItem={({ item }) => (
                  <AppointmentCard
                    appointment={item}
                    type={
                      (item.status?.toLowerCase?.() || "upcoming") as
                        | "completed"
                        | "delayed"
                        | "ongoing"
                        | "urgent"
                        | "upcoming"
                    }
                  />
                )}
                contentContainerStyle={{ gap: 8 }}
                showsVerticalScrollIndicator={false}
              />
            )}

            {activeTab === "scheduled" && scheduledError && (
              <Text className="text-red-500 text-center mt-4">
                {scheduledError}
              </Text>
            )}
            {activeTab === "instant" && instantError && (
              <Text className="text-red-500 text-center mt-4">
                {instantError}
              </Text>
            )}
          </>
        )}
      </View>
    </View>
  );
}
