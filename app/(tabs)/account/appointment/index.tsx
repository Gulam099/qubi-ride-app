import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  FlatList,
  View,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Calendar } from "react-native-calendars";
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

type TabType = "scheduled" | "instant";

export default function AppointmentUpcomingList() {
  const { user } = useUser();
  const userId = user?.publicMetadata?.dbPatientId as string;

  const appState: AppStateType = useSelector((state: any) => state.appState);
  const { t } = useTranslation();

  const [activeTab, setActiveTab] = useState<TabType>("scheduled");
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [errors, setErrors] = useState({ scheduled: "", instant: "" });

  // Store all appointments in a single state
  const [appointments, setAppointments] = useState<{
    scheduled: any[];
    instant: any[];
  }>({
    scheduled: [],
    instant: [],
  });

  console.log("appointments", appointments);

  // Fetch appointments data
  const loadAppointments = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    setErrors({ scheduled: "", instant: "" });

    try {
      const [scheduledRes, instantRes] = await Promise.all([
        fetchAppointments({ userId }),
        fetchInstantAppointments({ userId }),
      ]);

      let scheduledData = [];
      let instantData = [];

      if (scheduledRes.success) {
        scheduledData = scheduledRes.data.filter(
          (appointment: any) =>
            appointment.type === "scheduled" ||
            appointment.appointmentType === "scheduled" ||
            !appointment.isInstant ||
            (!appointment.type && !appointment.appointmentType)
        );
      } else {
        setErrors((prev) => ({ ...prev, scheduled: scheduledRes.message }));
      }

      if (instantRes.success) {
        instantData = instantRes.data;
      } else {
        setErrors((prev) => ({ ...prev, instant: instantRes.message }));
      }

      setAppointments({
        scheduled: scheduledData,
        instant: instantData,
      });
    } catch (error) {
      console.error("Error loading appointments:", error);
      setErrors({
        scheduled: "Failed to load scheduled appointments",
        instant: "Failed to load instant appointments",
      });
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Load appointments when component mounts or userId changes
  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  // Apply filters to appointments
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
        filtered = filtered.filter((appointment: any) =>
          new Date(appointment.createdAt) >= new Date(startDate)
        );
      }

      if (endDate) {
        filtered = filtered.filter((appointment: any) =>
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
    };
  }, [appointments, appState.filter]);

  // Get appointments for calendar view
  const calendarAppointments = useMemo(() => {
    const allAppointments = [
      ...filteredAppointments.scheduled,
      ...filteredAppointments.instant,
    ];

    // Group by date
    const appointmentsByDate: { [key: string]: any[] } = {};
    allAppointments.forEach((appointment) => {
      const date = (appointment.appointmentDate || appointment.createdAt)
        .split("T")[0];
      if (!appointmentsByDate[date]) {
        appointmentsByDate[date] = [];
      }
      appointmentsByDate[date].push(appointment);
    });

    return appointmentsByDate;
  }, [filteredAppointments]);

  // Get marked dates for calendar
  const markedDates = useMemo(() => {
    const marked: { [key: string]: any } = {};
    
    Object.keys(calendarAppointments).forEach((date) => {
      marked[date] = {
        marked: true,
        dotColor: "#000F8F",
        selectedColor: date === selectedDate ? "#000F8F" : undefined,
      };
    });

    // Mark selected date
    if (!marked[selectedDate]) {
      marked[selectedDate] = {};
    }
    marked[selectedDate].selected = true;
    marked[selectedDate].selectedColor = "#000F8F";

    return marked;
  }, [calendarAppointments, selectedDate]);

  // Get appointments for selected date
  const selectedDateAppointments = useMemo(() => {
    return calendarAppointments[selectedDate] || [];
  }, [calendarAppointments, selectedDate]);

  // Current appointments based on active tab
  const currentAppointments = useMemo(() => {
    return activeTab === "scheduled" 
      ? filteredAppointments.scheduled 
      : filteredAppointments.instant;
  }, [activeTab, filteredAppointments]);

  // Handle tab change
  const handleTabPress = useCallback((tab: TabType) => {
    setActiveTab(tab);
  }, []);

  // Handle date selection
  const handleDateSelect = useCallback((date: any) => {
    setSelectedDate(date.dateString);
  }, []);

  // Render appointment item
  const renderAppointmentItem = useCallback(
    ({ item }: { item: any }) => (
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
    ),
    []
  );

  // Calendar theme
  const calendarTheme = useMemo(
    () => ({
      selectedDayBackgroundColor: "#000F8F",
      selectedDayTextColor: "#ffffff",
      todayTextColor: "#000F8F",
      dayTextColor: "#2d4150",
      textDisabledColor: "#d9e1e8",
      dotColor: "#000F8F",
      selectedDotColor: "#ffffff",
      arrowColor: "#000F8F",
      disabledArrowColor: "#d9e1e8",
      monthTextColor: "#2d4150",
      indicatorColor: "#000F8F",
      textDayFontFamily: "System",
      textMonthFontFamily: "System",
      textDayHeaderFontFamily: "System",
      textDayFontSize: 16,
      textMonthFontSize: 16,
      textDayHeaderFontSize: 13,
    }),
    []
  );

  return (
    <View className="bg-blue-50/20 flex-1">
      {/* Tab Header */}
      <View className="flex-row bg-white mx-4 mt-4 rounded-lg p-1 shadow-sm">
        {["scheduled", "instant",].map((tab) => (
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
          <View className="flex-1">
            {/* Calendar Component */}
            <Calendar
              onDayPress={handleDateSelect}
              markedDates={markedDates}
              theme={calendarTheme}
              enableSwipeMonths
              hideExtraDays
              firstDay={1}
              showWeekNumbers={false}
              onPressArrowLeft={(subtractMonth) => subtractMonth()}
              onPressArrowRight={(addMonth) => addMonth()}
            />
            
            {/* Selected Date Appointments */}
            <View className="flex-1 mt-4">
              <Text className="text-lg font-semibold mb-2">
                {t("appointmentsFor")} {selectedDate}
              </Text>
              
              {selectedDateAppointments.length === 0 ? (
                <View className="flex-1 justify-center items-center">
                  <Text className="text-gray-500 text-center">
                    {t("noAppointmentsForDate")}
                  </Text>
                </View>
              ) : (
                <FlatList
                  data={selectedDateAppointments}
                  keyExtractor={(item, index) => `${item._id}-${index}`}
                  renderItem={({ item }) => (
                    <View className="mb-2">
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
                  )}
                  showsVerticalScrollIndicator={false}
                />
              )}
            </View>
          </View>
        ) : currentAppointments.length === 0 ? (
          <View className="flex-1 justify-center items-center">
            <Text className="text-center text-gray-500">
              {t("noAppointmentsAvailable", { type: t(activeTab) })}
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

        {/* Error Messages */}
        {activeTab === "scheduled" && errors.scheduled && (
          <Text className="text-red-500 text-center mt-4">
            {t("loadingFailedScheduled")}
          </Text>
        )}
        {activeTab === "instant" && errors.instant && (
          <Text className="text-red-500 text-center mt-4">
            {t("loadingFailedInstant")}
          </Text>
        )}
      </View>
    </View>
  );
}