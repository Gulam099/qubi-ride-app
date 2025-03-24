import React, { useEffect, useState } from "react";
import { View, Text, FlatList } from "react-native";
import { Calendar } from "@/components/ui/Calendar";
import ScheduleCalendarCard from "@/features/account/components/ScheduleCalendarCard";
import { useSelector } from "react-redux";
import { UserType } from "@/features/user/types/user.type";
import { apiNewUrl } from "@/const";

export default function AccountCalendarPage() {
  const user: UserType = useSelector((state: any) => state.user); // Fetch user details from Redux state
  const [markedDates, setMarkedDates] = useState({});
  const [scheduleData, setScheduleData] = useState([]);
  const [selectedDate, setSelectedDate] = useState<string>("");

  const fetchSchedulesForMonth = async (month: number, year: number) => {
    try {
      const response = await fetch(
        `${apiNewUrl}/booking/calendar?userId=${user._id}&month=${month}&year=${year}`
      );
      const result = await response.json();

      if (response.ok && result.success) {
        return result.data;
      } else {
        // console.error("Failed to fetch schedules:", result.message);
        return [];
      }
    } catch (error) {
      console.error("Error fetching schedules:", error);
      return [];
    }
  };

  const handleMonthChange = async (date: { month: number; year: number }) => {
    const { month, year } = date;

    const data = await fetchSchedulesForMonth(month, year);

    const marks = {};
    data.forEach((item: any) => {
      const date = item.time.split("T")[0]; // Extract date part from ISO string
      if (!marks[date]) {
        marks[date] = { marked: true };
      }
    });

    setMarkedDates(marks);
    setScheduleData(data);
    setSelectedDate(""); // Clear selected date when the month changes
  };

  const handleDayPress = (date: { dateString: string }) => {
    setSelectedDate(date.dateString);
  };

  const fetchCurrentMonthData = async () => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1; // Get month as a number
    const currentYear = currentDate.getFullYear();

    const data = await fetchSchedulesForMonth(currentMonth, currentYear);

    const marks = {};
    data.forEach((item: any) => {
      const date = item.time.split("T")[0]; // Extract date part from ISO string
      if (!marks[date]) {
        marks[date] = { marked: true };
      }
    });

    setMarkedDates(marks);
    setScheduleData(data);
  };

  // Fetch data for the current month on initial load
  useEffect(() => {
    fetchCurrentMonthData();
  }, []);

  const filteredSchedules = selectedDate
    ? scheduleData.filter((item: any) => item.time.startsWith(selectedDate))
    : scheduleData;

  return (
    <View className="bg-blue-50/20 h-full w-full px-4 py-8 flex flex-col gap-4">
      <Text className="text-lg font-semibold">My Calendar</Text>

      {/* Calendar Component */}
      <Calendar
        markedDates={{
          ...markedDates,
          [selectedDate]: { selected: true },
        }}
        onMonthChange={handleMonthChange}
        onDayPress={handleDayPress}
      />

      <FlatList
        data={filteredSchedules}
        keyExtractor={(item: any) => item.id}
        renderItem={({ item }: any) => (
          <ScheduleCalendarCard
            time={item.time}
            title={item.title}
            description={item.description}
            onDelete={() => console.log(`Delete card with id: ${item.id}`)}
            onEdit={() => console.log(`Edit card with id: ${item.id}`)}
          />
        )}
        contentContainerClassName="flex flex-col gap-3"
        ListEmptyComponent={() => (
          <Text className="text-gray-500 text-center mt-4">
            No schedules available for the selected date.
          </Text>
        )}
      />
    </View>
  );
}
