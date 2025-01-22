import { View, Text, FlatList } from "react-native";
import React, { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/Calendar";
import ScheduleCalendarCard from "@/features/account/components/ScheduleCalendarCard";
import { format } from "date-fns";

export default function AccountCalenderPage() {
  // Mock API function
  const fetchSchedulesForMonth = async (month: string, year: string) => {
    // Simulated API response
    const mockResponse = [
      {
        id: "1",
        time: "2025-01-02T12:00:00Z",
        title: "Anxiety program",
        description: "Simple text, not more than one line",
      },
      {
        id: "2",
        time: "2025-01-02T14:00:00Z",
        title: "Depression support group",
        description: "Short description for this schedule",
      },
      {
        id: "3",
        time: "2025-01-05T15:00:00Z",
        title: "Mindfulness workshop",
        description: "Simple text, not more than one line",
      },
      {
        id: "3",
        time: "2025-02-05T14:00:00Z",
        title: "Depression support group",
        description: "Short description for this schedule",
      },
      {
        id: "4",
        time: "2024-12-15T15:00:00Z",
        title: "Mindfulness workshop",
        description: "Simple text, not more than one line",
      },
    ];

    return mockResponse.filter((item) =>
      item.time.startsWith(`${year}-${month.padStart(2, "0")}`)
    );
  };

  const [markedDates, setMarkedDates] = useState({});
  const [scheduleData, setScheduleData] = useState([]);
  const [selectedDate, setSelectedDate] = useState<string>("");

  const handleMonthChange = (date: { month: number; year: number }) => {
    const { month, year } = date;
    fetchSchedulesForMonth(month.toString(), year.toString()).then((data) => {
      const marks = {};
      data.forEach((item) => {
        const date = item.time.split("T")[0]; // Extract date part from ISO string
        if (!marks[date]) {
          marks[date] = { marked: true };
        }
      });

      setMarkedDates(marks);
      setScheduleData(data);
      setSelectedDate(""); // Clear selected date when the month changes
    });
  };

  const handleDayPress = (date: { dateString: string }) => {
    setSelectedDate(date.dateString);
  };

  const fetchCurrentMonthData = async () => {
    const currentDate = new Date();
    const currentMonth = (currentDate.getMonth() + 1).toString();
    const currentYear = currentDate.getFullYear().toString();

    const data = await fetchSchedulesForMonth(currentMonth, currentYear);
    const marks = {};
    data.forEach((item) => {
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
    ? scheduleData.filter((item) => item.time.startsWith(selectedDate))
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
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ScheduleCalendarCard
            time={item.time}
            title={item.title}
            description={item.description}
            onDelete={() => console.log(`Delete card with id: ${item.id}`)}
            onEdit={() => console.log(`Edit card with id: ${item.id}`)}
          />
        )}
        contentContainerClassName="flex flex-col gap-3"
      />
    </View>
  );
}
