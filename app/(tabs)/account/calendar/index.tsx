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
  fetchGroupAppointments,
  fetchPrograms,
} from "@/features/util/constHome";
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
  const [error, setError] = useState("");
  const [appointments, setAppointments] = useState<{
    scheduled: any[];
    instant: any[];
    group: any[];
    program: any[];
  }>({
    scheduled: [],
    instant: [],
    group: [],
    program: [],
  });

  // Fetch all appointments (scheduled + instant + group + program)
  const loadAppointments = useCallback(
    async (isRefresh = false) => {
      if (!userId) return;

      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError("");

      try {
        const [scheduledRes, instantRes, groupRes, programRes] =
          await Promise.all([
            fetchAppointments({ userId }),
            fetchInstantAppointments({ userId }),
            fetchGroupAppointments(userId),
            fetchPrograms(userId),
          ]);

        let scheduledData = [];
        let instantData = [];
        let groupData = [];
        let programData = [];

        if (scheduledRes.success) {
          scheduledData = scheduledRes.data.filter(
            (appointment: any) =>
              appointment.type === "scheduled" ||
              appointment.appointmentType === "scheduled" ||
              !appointment.isInstant ||
              (!appointment.type && !appointment.appointmentType)
          );
        }

        if (instantRes.success) {
          instantData = instantRes.data;
        }

        if (groupRes.success) {
          groupData = groupRes.data;
        }

        if (programRes.success) {
          programData = programRes.data;
        }

        setAppointments({
          scheduled: scheduledData,
          instant: instantData,
          group: groupData,
          program: programData,
        });
      } catch (error) {
        console.error("Error loading appointments:", error);
        setError("Failed to load appointments");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [userId]
  );

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
      program: applyFilters(appointments.program),
    };
  }, [appointments, appState.filter]);

  // Get all appointments combined (no tab filtering)
  const allAppointments = useMemo(() => {
    return [
      ...filteredAppointments.scheduled,
      ...filteredAppointments.instant,
      ...filteredAppointments.group,
      ...filteredAppointments.program,
    ];
  }, [filteredAppointments]);

  // Group ALL appointments by date for calendar marking and selection
  const appointmentsByDate = useMemo(() => {
    const grouped: { [key: string]: any[] } = {};

    allAppointments.forEach((appointment) => {
      const date = (appointment.appointmentDate || appointment.createdAt).split(
        "T"
      )[0];
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(appointment);
    });

    return grouped;
  }, [allAppointments]);

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
      {/* Header with Today Button */}
      <View className="mx-4 mt-4 rounded-lg p-4 ">
        <View className="flex-row justify-between items-center">
          <Text className="text-lg font-semibold text-gray-800">
            {t("My Calendar")}
          </Text>
        </View>
      </View>

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
              {new Date(selectedDate).toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </Text>
            <Text className="text-sm text-gray-600">
              {selectedDateAppointments.length} {t("appointments")}
            </Text>
          </View>
        </View>

        {/* Error message */}
        {error && (
          <View className="bg-red-50 border border-red-200 rounded-lg p-4 mb-2">
            <Text className="text-red-600 text-center">{error}</Text>
            <TouchableOpacity
              onPress={() => loadAppointments()}
              className="mt-2 bg-red-600 py-2 px-4 rounded-lg self-center"
            >
              <Text className="text-white font-medium">{t("retry")}</Text>
            </TouchableOpacity>
          </View>
        )}

        {selectedDateAppointments.length === 0 ? (
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
            renderItem={({ item }) => {
              const dateObj = new Date(item.appointmentDate || item.createdAt);

              const time = dateObj.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              });

              const date = dateObj.toLocaleDateString("en-US", {
                month: "long",
                day: "2-digit",
              });

              return (
                <View className="bg-white rounded-lg p-4 mb-2 shadow-sm flex-row items-start">
                  {/* Left side: Time & Date */}
                  <View className="w-24 border-r border-gray-200 pr-3">
                    <Text className="text-base font-medium text-gray-800">
                      {time}
                    </Text>
                    <Text className="text-base text-gray-500 mt-1">{date}</Text>
                  </View>

                  {/* Right side: Details */}
                  <View className="flex-1 pl-3">
                    <Text className="text-lg font-semibold text-gray-800 mb-1">
                      {item.groupId
                        ? t("Group")
                        : item.programId
                        ? t("program")
                        : t("appointment")}
                    </Text>

                    {/* <Text className="text-sm text-gray-500" numberOfLines={1}>
                      {item.description ||
                        item.notes ||
                        "Simple text, not more than one line"}
                    </Text> */}

                    {item.doctorId?.full_name && (
                      <Text className="text-sm text-gray-400 mt-1">
                        {t("with")} {item?.doctorId?.full_name}
                      </Text>
                    )}
                  </View>

                  {/* Actions (Edit/Delete) */}
                  {/* <View className="flex-row ml-2">
                    <TouchableOpacity className="p-2">
                      <Text className="text-red-500 text-lg">🗑</Text>
                    </TouchableOpacity>
                    <TouchableOpacity className="p-2">
                      <Text className="text-gray-500 text-lg">✏️</Text>
                    </TouchableOpacity>
                  </View> */}
                </View>
              );
            }}
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
