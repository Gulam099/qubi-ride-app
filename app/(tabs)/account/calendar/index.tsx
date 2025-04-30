import React, { useEffect, useState } from "react";
import { View, Text, FlatList } from "react-native";
import { Calendar } from "@/components/ui/Calendar";
import ScheduleCalendarCard from "@/features/account/components/ScheduleCalendarCard";
import { useUser } from "@clerk/clerk-expo";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";

export default function AccountCalendarPage() {
  const { user } = useUser();
  const userId = user?.publicMetadata?.dbPatientId as string;

  const [selectedDate, setSelectedDate] = useState<string>("");
  const [markedDates, setMarkedDates] = useState({});
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const formatDate = (date: Date) => dayjs(date).format("DD-MM-YYYY");

  const getMonthRange = (date: Date) => {
    const start = new Date(date.getFullYear(), date.getMonth(), 1);
    const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    return {
      from: formatDate(start),
      to: formatDate(end),
    };
  };

  const fetchSchedule = async ({ queryKey }: any) => {
    const [_key, userId, date] = queryKey;
    const { from, to } = getMonthRange(date);
    const res = await axios.get(`https://www.baserah.sa/api/schedule`, {
      params: {
        patientId: userId,
        from,
        to,
      },
    });

    if (res.data.success && res.data.schedule?.except) {
      return res.data.schedule.except.map((iso: string, i: number) => ({
        id: `${i}`,
        time: iso,
        title: "Session",
        description: "Scheduled session",
      }));
    }

    return [];
  };

  const { data: scheduleData = [], refetch } = useQuery({
    queryKey: ["schedule", userId, currentMonth],
    queryFn: fetchSchedule,
    enabled: !!userId,
  });

  useEffect(() => {
    const marks: any = {};
    scheduleData.forEach((item: any) => {
      const date = item.time.split("T")[0];
      marks[date] = { marked: true };
    });
    setMarkedDates(marks);
  }, [scheduleData]);

  const handleDayPress = (day: { dateString: string }) => {
    setSelectedDate(day.dateString);
  };

  const handleMonthChange = (monthData: { timestamp: number }) => {
    const newMonth = new Date(monthData.timestamp);
    setCurrentMonth(newMonth);
    setSelectedDate("");
  };

  const filteredSchedules = selectedDate
    ? scheduleData.filter((item: any) => item.time.startsWith(selectedDate))
    : scheduleData;

  return (
    <View className="bg-blue-50/20 h-full w-full px-4 py-8 flex flex-col gap-4">
      <Text className="text-lg font-semibold">My Calendar</Text>

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
