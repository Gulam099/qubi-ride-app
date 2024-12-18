import { View, Text, FlatList } from "react-native";
import React from "react";
import { Calendar } from "@/components/ui/Calendar";
import ScheduleCalendarCard from "@/features/account/components/ScheduleCalendarCard";

export default function AccountCalenderPage() {
  const scheduleData = [
    {
      id: "1",
      time: "12:00 PM",
      date: "April, 08",
      title: "Anxiety program",
      description: "Simple text, not more than one line",
    },
    {
      id: "2",
      time: "12:00 PM",
      date: "April, 08",
      title: "Anxiety program",
      description: "Simple text, not more than one line",
    },
  ];

  const handleDelete = (id: string) => {
    console.log(`Delete card with id: ${id}`);
  };

  const handleEdit = (id: string) => {
    console.log(`Edit card with id: ${id}`);
  };

  return (
    <View className="bg-blue-50/20 h-full w-full px-4 py-8 flex flex-col gap-4">
      <Text className="text-lg font-semibold">My Calender</Text>
      <Calendar
        markedDates={{
          "2024-12-15": { selected: true },
        }}
      />

      <FlatList
        data={scheduleData}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ScheduleCalendarCard
            time={item.time}
            date={item.date}
            title={item.title}
            description={item.description}
            onDelete={() => handleDelete(item.id)}
            onEdit={() => handleEdit(item.id)}
          />
        )}
        contentContainerClassName="flex flex-col gap-3"
      />
    </View>
  );
}
