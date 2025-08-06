import React, { useEffect, useState, useCallback, useMemo } from "react";
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
  fetchGroupAppointments,
} from "@/features/util/constHome";
import AppointmentCard from "@/features/account/components/AppointmentCard";
import { useTranslation } from "react-i18next";

type TabType = "session" | "group";

export default function AppointmentUpcomingList() {
  const { user } = useUser();
  const userId = user?.publicMetadata?.dbPatientId as string;

  const appState: AppStateType = useSelector((state: any) => state.appState);
  const { t } = useTranslation();

  const [activeTab, setActiveTab] = useState<TabType>("session");
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({
    session: "",
    group: "",
  });
  const [appointments, setAppointments] = useState<{
    scheduled: any[];
    instant: any[];
    group: any[];
  }>({
    scheduled: [],
    instant: [],
    group: [],
  });

  const loadAppointments = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    setErrors({ session: "", group: "" });

    try {
      const [scheduledRes, instantRes, groupRes] = await Promise.all([
        fetchAppointments({ userId }),
        fetchInstantAppointments({ userId }),
        fetchGroupAppointments(userId),
      ]);

      let scheduledData = [];
      let instantData = [];
      let groupData = [];

      if (scheduledRes.success) {
        scheduledData = scheduledRes.data.filter(
          (appointment: any) =>
            appointment.type === "scheduled" ||
            appointment.appointmentType === "scheduled" ||
            !appointment.isInstant ||
            (!appointment.type && !appointment.appointmentType)
        );
      } else {
        setErrors((prev) => ({ ...prev, session: scheduledRes.message }));
      }

      if (instantRes.success) {
        instantData = instantRes.data;
      } else {
        setErrors((prev) => ({ ...prev, session: instantRes.message }));
      }

      if (groupRes.success) {
        groupData = groupRes.data;
      } else {
        setErrors((prev) => ({ ...prev, group: groupRes.message }));
      }

      setAppointments({
        scheduled: scheduledData,
        instant: instantData,
        group: groupData,
      });
    } catch (error) {
      console.error("Error loading appointments:", error);
      setErrors({
        session: "Failed to load session appointments",
        group: "Failed to load group appointments",
      });
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  const filteredAppointments = useMemo(() => {
    const applyFilters = (appointmentList: any[]) => {
      if (!appState.filter) return appointmentList;

      const { name, startDate, endDate, sortBy } = appState.filter;
      let filtered = [...appointmentList];

      if (name) {
        filtered = filtered.filter((appointment: any) =>
          appointment.user?.name?.toLowerCase().includes(name.toLowerCase())
        );
      }

      if (startDate) {
        filtered = filtered.filter(
          (appointment: any) =>
            new Date(appointment.createdAt) >= new Date(startDate)
        );
      }

      if (endDate) {
        filtered = filtered.filter(
          (appointment: any) =>
            new Date(appointment.createdAt) <= new Date(endDate)
        );
      }

      if (sortBy) {
        filtered = filtered.sort((a: any, b: any) =>
          sortBy === "Recent"
            ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            : new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      }

      return filtered;
    };

    return {
      scheduled: applyFilters(appointments.scheduled),
      instant: applyFilters(appointments.instant),
      group: applyFilters(appointments.group),
    };
  }, [appointments, appState.filter]);

  const currentAppointments = useMemo(() => {
    if (activeTab === "session") {
      return [
        ...filteredAppointments.scheduled,
        ...filteredAppointments.instant,
      ];
    } else {
      return filteredAppointments.group || [];
    }
  }, [activeTab, filteredAppointments]);

  const handleTabPress = useCallback((tab: TabType) => {
    setActiveTab(tab);
  }, []);

  const renderAppointmentItem = useCallback(({ item }: { item: any }) => {
    return (
      <View>
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
      </View>
    );
  }, []);

  return (
    <View className="bg-blue-50/20 flex-1">
      {/* Tabs */}
      <View className="flex-row bg-white mx-4 mt-4 rounded-lg p-1 shadow-sm">
        {["session", "group"].map((tab) => (
          <TouchableOpacity
            key={tab}
            className={`flex-1 py-3 rounded-md ${
              activeTab === tab ? "bg-[#000F8F]" : "bg-transparent"
            }`}
            onPress={() => handleTabPress(tab as TabType)}
          >
            <Text
              className={`text-center font-medium ${
                activeTab === tab ? "text-white" : "text-[#000F8F]"
              }`}
            >
              {tab === "session" ? t("My Sessions") : t("My Group")}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* List */}
      <View className="flex-1 p-4">
        {loading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#007BFF" />
          </View>
        ) : currentAppointments.length === 0 ? (
          <View className="flex-1 justify-center items-center">
            <Text className="text-center text-gray-500">
              {t("noAppointmentsAvailable", {
                type: activeTab === "session" ? t("mySessions") : t("group"),
              })}
            </Text>
          </View>
        ) : (
          <FlatList
            data={currentAppointments}
            keyExtractor={(item) => item._id}
            renderItem={renderAppointmentItem}
            contentContainerStyle={{ gap: 8 }}
            showsVerticalScrollIndicator={false}
          />
        )}

        {/* Error message */}
        {errors[activeTab] && (
          <Text className="text-red-500 text-center mt-4">
            {t("loadingFailed")}
          </Text>
        )}
      </View>
    </View>
  );
}
