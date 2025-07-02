import React, { useEffect, useState } from "react";
import {
  FlatList,
  View,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { Agenda } from 'react-native-calendars';
import { Text } from "@/components/ui/Text";
import { useSelector } from "react-redux";
import { AppStateType } from "@/features/setting/types/setting.type";
import { useUser } from "@clerk/clerk-expo";
import {
  fetchAppointments,
  fetchInstantAppointments,
} from "@/features/util/constHome";
import AppointmentCard from "@/features/account/components/AppointmentCard";
import { useTranslation } from "react-i18next";
type TabType = "scheduled" | "instant" | "calendar";

export default function AppointmentUpcomingList() {
  const { user } = useUser();
  const userId = user?.publicMetadata?.dbPatientId as string;

  const appState: AppStateType = useSelector((state: any) => state.appState);
    const { t } = useTranslation();

  const [activeTab, setActiveTab] = useState<TabType>("scheduled");
  const [scheduledAppointments, setScheduledAppointments] = useState<any[]>([]);
  const [instantAppointments, setInstantAppointments] = useState<any[]>([]);
  const [agendaItems, setAgendaItems] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const [scheduledError, setScheduledError] = useState("");
  const [instantError, setInstantError] = useState("");

  console.log('instantAppointments', instantAppointments)

  const applyFilters = (appointments: any[]) => {
    let filteredAppointments = appointments;

    if (appState.filter) {
      const { name, startDate, endDate, sortBy } = appState.filter;

      if (name) {
        filteredAppointments = filteredAppointments.filter((appointment: any) =>
          appointment.user?.name?.toLowerCase().includes(name.toLowerCase())
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

  const convertToAgendaItems = (appointments: any[]) => {
    const items: any = {};

    // Extract appointment dates
    appointments.forEach((appointment) => {
      const appointmentDate = appointment.appointmentDate || appointment.createdAt;
      const dateKey = new Date(appointmentDate).toISOString().split('T')[0];

      if (!items[dateKey]) {
        items[dateKey] = [];
      }

      items[dateKey].push({
        ...appointment,
        height: 80,
        day: dateKey,
      });
    });

    // Ensure empty arrays for all dates in range (+/-12 months)
    const today = new Date();
    for (let i = -365; i <= 365; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      const dateKey = date.toISOString().split('T')[0];
      if (!items[dateKey]) {
        items[dateKey] = [];
      }
    }

    return items;
  };


  console.log('userId', userId)
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
      return filteredAppointments;
    } else {
      setScheduledError(response.message);
      return [];
    }
  };

  const loadInstantAppointments = async () => {
    const response = await fetchInstantAppointments({ userId });

    if (response.success) {
      const filteredAppointments = applyFilters(response.data);
      setInstantAppointments(filteredAppointments);
      setInstantError("");
      return filteredAppointments;
    } else {
      setInstantError(response.message);
      return [];
    }
  };

  useEffect(() => {
    async function loadAppointments() {
      setLoading(true);
      setScheduledError("");
      setInstantError("");

      try {
        const [scheduledData, instantData] = await Promise.all([
          loadScheduledAppointments(),
          loadInstantAppointments(),
        ]);

        const allAppointments = [...scheduledData, ...instantData];
        const agendaData = convertToAgendaItems(allAppointments);
        setAgendaItems(agendaData);
      } catch {
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

  const renderAgendaItem = (item: any) => {
    const isInstant = item.type === "instant" || item.appointmentType === "instant" || item.isInstant;

    return (
      <View
        style={{
          marginVertical: 4,
          backgroundColor: isInstant ? "#FEF3C7" : "#DBEAFE",
          borderRadius: 8,
          padding: 8,
        }}
      >
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
  };

  const renderEmptyDate = () => {
    return (
      <View className="flex-1 justify-center items-center p-4">
        <Text className="text-gray-500 text-center">
          No appointments for this date
        </Text>
      </View>
    );
  };

  return (
    <View className="bg-blue-50/20 flex-1">
      {/* Tab Header */}
      <View className="flex-row bg-white mx-4 mt-4 rounded-lg p-1 shadow-sm">
        {["scheduled", "instant", "calendar"].map((tab) => (
          <TouchableOpacity
            key={tab}
            className={`flex-1 py-3 rounded-md ${activeTab === tab ? "bg-blue-500" : "bg-transparent"
              }`}
            onPress={() => {
              setActiveTab(tab as TabType);
              if (tab !== "calendar") setIsCalendarOpen(false);
            }}
          >
            <Text
              className={`text-center font-medium ${activeTab === tab ? "text-white" : "text-gray-600"
                }`}
            >
               {t(tab)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      <View className="flex-1 p-4">
        {loading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#007BFF" />
          </View>
        ) : activeTab === "calendar" ? (
          <Agenda
            items={agendaItems}
            renderItem={renderAgendaItem}
            renderEmptyDate={renderEmptyDate}
            rowHasChanged={(r1: { _id: any; }, r2: { _id: any; }) => r1._id !== r2._id}
            onCalendarToggled={(opened: boolean | ((prevState: boolean) => boolean)) => setIsCalendarOpen(opened)}
            pastScrollRange={12}
            futureScrollRange={12}
            showClosingKnob={true}
            markedDates={Object.keys(agendaItems).reduce((acc, date) => {
              if (agendaItems[date]?.length > 0) {
                acc[date] = { marked: true, dotColor: '#007BFF' };
              }
              return acc;
            }, {} as Record<string, any>)}
            theme={{
              selectedDayBackgroundColor: '#007BFF',
              selectedDayTextColor: '#ffffff',
              todayTextColor: '#007BFF',
              dayTextColor: '#2d4150',
              textDisabledColor: '#d9e1e8',
              dotColor: '#00adf5',
              selectedDotColor: '#ffffff',
              arrowColor: '#007BFF',
              disabledArrowColor: '#d9e1e8',
              monthTextColor: '#2d4150',
              indicatorColor: '#007BFF',
              textDayFontFamily: 'System',
              textMonthFontFamily: 'System',
              textDayHeaderFontFamily: 'System',
              textDayFontSize: 16,
              textMonthFontSize: 16,
              textDayHeaderFontSize: 13,
              agendaDayTextColor: '#2d4150',
              agendaDayNumColor: '#2d4150',
              agendaTodayColor: '#007BFF',
              agendaKnobColor: '#73d4e8',
            }}
          />
        ) : currentAppointments.length === 0 ? (
          <Text className="text-center text-gray-500">
            {t("noAppointmentsAvailable", { type: t(activeTab) })}
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

        {/* Error display */}
        {activeTab === "scheduled" && scheduledError && (
          <Text className="text-red-500 text-center mt-4">{t("loadingFailedScheduled")}</Text>
        )}
        {activeTab === "instant" && instantError && (
          <Text className="text-red-500 text-center mt-4"> {t("loadingFailedInstant")}</Text>
        )}
      </View>
    </View>
  );
}
