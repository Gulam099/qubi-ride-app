import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Calendar } from "@/components/ui/Calendar";
import { format } from "date-fns";

interface ScheduleSelectorProps {
  selectedDateTime: string;
  setSelectedDateTime: (value: string) => void;
  availableTimes: string[]; // ISO Strings
  CalenderHeading?: string;
  TimeSliderHeading?: string;
}

export default function ScheduleSelector({
  selectedDateTime,
  setSelectedDateTime,
  availableTimes,
  CalenderHeading,
  TimeSliderHeading,
}: ScheduleSelectorProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(
    selectedDateTime
  );

  // Extract unique dates from availableTimes
  const uniqueDates = Array.from(
    new Set(availableTimes.map((iso) => format(new Date(iso), "yyyy-MM-dd")))
  );

  // Filter times based on the selected date
  const timesForSelectedDate = selectedDate
    ? availableTimes.filter(
        (iso) => format(new Date(iso), "yyyy-MM-dd") === selectedDate
      )
    : [];

  // Mark available dates on the calendar
  const markedDates = uniqueDates.reduce((acc, date) => {
    acc[date] = { marked: true, dotColor: "purple" };
    return acc;
  }, {} as Record<string, any>);

  if (selectedDate) {
    markedDates[selectedDate] = { selected: true, marked: true };
  }

  // Format ISO string into a readable date and time
  const formattedDateTime = selectedDateTime
    ? format(new Date(selectedDateTime), "d MMMM yyyy | h:mm a") // 1 January 2025 | 11:34 PM
    : "";

  return (
    <View className=" gap-4">
      <Text className="text-lg font-medium">
        {CalenderHeading ?? "Available Dates"}
      </Text>
      <View className="bg-background rounded-lg px-4 py-2 flex justify-center items-start">
        {selectedDateTime ? (
          <Text className=" font-base text-blue-600">{formattedDateTime}</Text>
        ) : (
          <Text className=" text-gray-600">Please select a date and time.</Text>
        )}
      </View>
      {/* Calendar for Dates */}
      <Calendar
        markedDates={markedDates}
        onDayPress={(day) => setSelectedDate(day.dateString)}
      />

      {/* Time Selector */}
      {selectedDate && (
        <View>
          <Text className="font-semibold mb-2">
            {TimeSliderHeading ?? "Available Times"}
          </Text>
          <ScrollView horizontal>
            {timesForSelectedDate.map((iso) => {
              const time = format(new Date(iso), "h:mm a"); // Extract time
              return (
                <TouchableOpacity
                  key={iso}
                  onPress={() => setSelectedDateTime(iso)}
                  className={`p-4 m-2 border rounded-xl ${
                    selectedDateTime === iso
                      ? "bg-background border-blue-700"
                      : "border-gray-500"
                  }`}
                >
                  <Text
                    className={`${
                      selectedDateTime === iso
                        ? "text-blue-700"
                        : "text-gray-500"
                    }`}
                  >
                    {time}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}
    </View>
  );
}
