import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  View,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  RefreshControl,
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

export default function AppointmentCalendarScreen() {
  const { user } = useUser();
  const userId = user?.publicMetadata?.dbPatientId as string;

  const appState: AppStateType = useSelector((state: any) => state.appState);
  const { t } = useTranslation();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [appointments, setAppointments] = useState<any[]>([]);
  const [error, setError] = useState("");

  // Fetch all appointments (scheduled + instant)
  const loadAppointments = useCallback(async (isRefresh = false) => {
    if (!userId) return;

    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError("");

    try {
      const [scheduledRes, instantRes] = await Promise.all([
        fetchAppointments({ userId }),
        fetchInstantAppointments({ userId }),
      ]);

      let allAppointments: any[] = [];

      // Combine scheduled appointments
      if (scheduledRes.success) {
        const scheduledData = scheduledRes.data.filter(
          (appointment: any) =>
            appointment.type === "scheduled" ||
            appointment.appointmentType === "scheduled" ||
            !appointment.isInstant ||
            (!appointment.type && !appointment.appointmentType)
        );
        allAppointments = [...allAppointments, ...scheduledData];
      }

      // Combine instant appointments
      if (instantRes.success) {
        allAppointments = [...allAppointments, ...instantRes.data];
      }

      setAppointments(allAppointments);
    } catch (error) {
      console.error("Error loading appointments:", error);
      setError("Failed to load appointments");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userId]);

  // Load appointments when component mounts or userId changes
  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  // Apply filters to appointments
  const filteredAppointments = useMemo(() => {
    if (!appState.filter) return appointments;

    const { name, startDate, endDate, sortBy } = appState.filter;
    let filtered = [...appointments];

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
  }, [appointments, appState.filter]);

  // Group appointments by date
  const appointmentsByDate = useMemo(() => {
    const grouped: { [key: string]: any[] } = {};
    
    filteredAppointments.forEach((appointment) => {
      const date = (appointment.appointmentDate || appointment.createdAt)
        .split("T")[0];
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(appointment);
    });

    return grouped;
  }, [filteredAppointments]);

  // Get marked dates for calendar
  const markedDates = useMemo(() => {
    const marked: { [key: string]: any } = {};
    
    Object.keys(appointmentsByDate).forEach((date) => {
      const appointmentCount = appointmentsByDate[date].length;
      marked[date] = {
        marked: true,
        dotColor: "#000F8F",
        selectedColor: date === selectedDate ? "#000F8F" : undefined,
        customStyles: {
          container: {
            backgroundColor: date === selectedDate ? "#000F8F" : "transparent",
          },
          text: {
            color: date === selectedDate ? "#ffffff" : "#2d4150",
            fontWeight: appointmentCount > 0 ? "bold" : "normal",
          },
        },
      };
    });

    // Mark selected date even if no appointments
    if (!marked[selectedDate]) {
      marked[selectedDate] = {
        customStyles: {
          container: {
            backgroundColor: "#000F8F",
          },
          text: {
            color: "#ffffff",
          },
        },
      };
    }
    marked[selectedDate].selected = true;
    marked[selectedDate].selectedColor = "#000F8F";

    return marked;
  }, [appointmentsByDate, selectedDate]);

  // Get appointments for selected date
  const selectedDateAppointments = useMemo(() => {
    return appointmentsByDate[selectedDate] || [];
  }, [appointmentsByDate, selectedDate]);

  // Handle date selection
  const handleDateSelect = useCallback((date: any) => {
    setSelectedDate(date.dateString);
  }, []);

  // Handle refresh
  const onRefresh = useCallback(() => {
    loadAppointments(true);
  }, [loadAppointments]);

  // Get today's date for quick navigation
  const goToToday = useCallback(() => {
    const today = new Date().toISOString().split("T")[0];
    setSelectedDate(today);
  }, []);

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
      textMonthFontSize: 18,
      textDayHeaderFontSize: 13,
    }),
    []
  );

  // Get appointment statistics
  const appointmentStats = useMemo(() => {
    const total = filteredAppointments.length;
    const today = new Date().toISOString().split("T")[0];
    const todayAppointments = appointmentsByDate[today]?.length || 0;
    const upcoming = filteredAppointments.filter(appointment => {
      const appointmentDate = (appointment.appointmentDate || appointment.createdAt).split("T")[0];
      return appointmentDate >= today;
    }).length;

    return { total, todayAppointments, upcoming };
  }, [filteredAppointments, appointmentsByDate]);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-blue-50/20">
        <ActivityIndicator size="large" color="#000F8F" />
        <Text className="mt-4 text-gray-600">{t("loadingAppointments")}</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-blue-50/20">
      {/* Header with Statistics */}
      {/* <View className="bg-white mx-4 mt-4 rounded-lg p-4 shadow-sm">
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-lg font-semibold text-gray-800">
            {t("appointmentCalendar")}
          </Text>
          <TouchableOpacity
            onPress={goToToday}
            className="bg-[#000F8F] px-3 py-1 rounded-full"
          >
            <Text className="text-white text-sm font-medium">
              {t("today")}
            </Text>
          </TouchableOpacity>
        </View>
        
        <View className="flex-row justify-around">
          <View className="items-center">
            <Text className="text-2xl font-bold text-[#000F8F]">
              {appointmentStats.total}
            </Text>
            <Text className="text-xs text-gray-600">{t("total")}</Text>
          </View>
          <View className="items-center">
            <Text className="text-2xl font-bold text-green-600">
              {appointmentStats.todayAppointments}
            </Text>
            <Text className="text-xs text-gray-600">{t("today")}</Text>
          </View>
          <View className="items-center">
            <Text className="text-2xl font-bold text-orange-600">
              {appointmentStats.upcoming}
            </Text>
            <Text className="text-xs text-gray-600">{t("upcoming")}</Text>
          </View>
        </View>
      </View> */}

      {/* Calendar */}
      <View className="bg-white mx-4 mt-4 rounded-lg shadow-sm">
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
          markingType="custom"
        />
      </View>

      {/* Selected Date Appointments */}
      <View className="flex-1 mx-4 mt-4">
        <View className="bg-white rounded-lg p-4 shadow-sm mb-2">
          <View className="flex-row justify-between items-center">
            <Text className="text-lg font-semibold text-gray-800">
              {new Date(selectedDate).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </Text>
            <Text className="text-sm text-gray-600">
              {selectedDateAppointments.length} {t("appointments")}
            </Text>
          </View>
        </View>

        {error ? (
          <View className="bg-red-50 border border-red-200 rounded-lg p-4">
            <Text className="text-red-600 text-center">{error}</Text>
            <TouchableOpacity
              onPress={() => loadAppointments()}
              className="mt-2 bg-red-600 py-2 px-4 rounded-lg self-center"
            >
              <Text className="text-white font-medium">{t("retry")}</Text>
            </TouchableOpacity>
          </View>
        ) : selectedDateAppointments.length === 0 ? (
          <View className="flex-1 justify-center items-center bg-white rounded-lg p-8">
            <Text className="text-gray-500 text-center text-lg mb-2">
              {t("noAppointmentsForDate")}
            </Text>
            <Text className="text-gray-400 text-center text-sm">
              {t("selectDifferentDate")}
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
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={["#000F8F"]}
                tintColor="#000F8F"
              />
            }
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        )}
      </View>
    </View>
  );
}