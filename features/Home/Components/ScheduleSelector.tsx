import React, { useMemo, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Calendar } from "@/components/ui/Calendar";
import { addMinutes, format, isAfter, isBefore, parseISO } from "date-fns";
import { useTranslation } from "react-i18next";
import i18n from "@/lib/i18n";
import { Button } from "@/components/ui/Button";

interface ScheduleSelectorProps {
  selectedDateTime: string;
  setSelectedDateTime: (value: string) => void;
  doctorSchedule: Record<
    string,
    {
      start: string;
      end: string;
      isHoliday: boolean;
      weekDay?: string;
    }
  >;
  CalenderHeading?: string;
  TimeSliderHeading?: string;
  time?: string; // Added time prop like in SchedulePickerSheet
}

export default function ScheduleSelector({
  selectedDateTime,
  setSelectedDateTime,
  doctorSchedule,
  CalenderHeading,
  TimeSliderHeading,
  time,
}: ScheduleSelectorProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(
    selectedDateTime ? format(new Date(selectedDateTime), "yyyy-MM-dd") : null
  );
  const { t } = useTranslation();

  // Localize AM/PM function (same as SchedulePickerSheet)
  const localizeAMPM = (timeString: string) => {
    if (!timeString) return "";

    if (i18n.language === "ar") {
      return timeString.replace("AM", "ص").replace("PM", "م");
    }

    return timeString;
  };

  // Calculate min and max dates from available schedule (same as SchedulePickerSheet)
  const { minDate, maxDate } = useMemo(() => {
    if (!doctorSchedule || Object.keys(doctorSchedule).length === 0) {
      const today = new Date();
      return {
        minDate: format(today, "yyyy-MM-dd"),
        maxDate: format(
          new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000),
          "yyyy-MM-dd"
        ),
      };
    }

    const availableDates = Object.keys(doctorSchedule)
      .filter((date) => !doctorSchedule[date].isHoliday)
      .sort();

    const today = new Date();
    const todayStr = format(today, "yyyy-MM-dd");

    return {
      minDate: availableDates[0] > todayStr ? availableDates[0] : todayStr,
      maxDate:
        availableDates[availableDates.length - 1] ||
        format(
          new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000),
          "yyyy-MM-dd"
        ),
    };
  }, [doctorSchedule]);

  // Mark available dates (same logic as SchedulePickerSheet)
  const markedDates = useMemo(() => {
    const marks: Record<string, any> = {};

    if (!doctorSchedule) return marks;

    Object.keys(doctorSchedule).forEach((dateKey) => {
      if (!doctorSchedule[dateKey].isHoliday) {
        marks[dateKey] = {
          marked: true,
          selected: dateKey === selectedDate,
          selectedColor: dateKey === selectedDate ? "#8A00FA" : "#10B981",
          dotColor: dateKey === selectedDate ? "#8A00FA" : "#10B981",
        };
      }
    });

    return marks;
  }, [selectedDate, doctorSchedule]);

  // Check if a day is disabled (same as SchedulePickerSheet)
  const isDayDisabled = (date: Date) => {
    const dateKey = format(date, "yyyy-MM-dd");
    return (
      !doctorSchedule ||
      !(dateKey in doctorSchedule) ||
      doctorSchedule[dateKey].isHoliday ||
      !doctorSchedule[dateKey].start ||
      !doctorSchedule[dateKey].end
    );
  };

  // Generate time slots for selected date (similar to SchedulePickerSheet)
  const availableSlots = useMemo(() => {
    if (!selectedDate || !doctorSchedule || !(selectedDate in doctorSchedule)) {
      return [];
    }

    const { isHoliday, start, end } = doctorSchedule[selectedDate];

    if (isHoliday || !start || !end) {
      return [];
    }

    try {
      // Create start and end date using selected date
      const startDate = new Date(selectedDate + "T" + start.split("T")[1]);
      const endDate = new Date(selectedDate + "T" + end.split("T")[1]);

      let current = new Date(startDate);
      const slots = [];
      const now = new Date();
      const isToday = format(now, "yyyy-MM-dd") === selectedDate;
      const slotDuration = parseInt(time?.split(" ")[0]) || 30;

      while (isBefore(current, endDate)) {
        if (!isToday || current > now) {
          const slotEnd = addMinutes(current, slotDuration);
          
          const slotData = {
            iso: new Date(current).toISOString(),
            startTime: format(current, "h:mm a"),
            endTime: format(slotEnd, "h:mm a"),
            duration: slotDuration,
            displayText: `${format(current, "h:mm a")} - ${format(slotEnd, "h:mm a")}`,
          };

          slots.push(slotData);
        }

        current = addMinutes(current, slotDuration);
      }

      return slots;
    } catch (error) {
      console.error("Error generating time slots:", error);
      return [];
    }
  }, [selectedDate, doctorSchedule, time]);

  // Format selected date time for display (with Arabic localization)
  const formattedDateTime = selectedDateTime
    ? i18n.language === "ar"
      ? format(new Date(selectedDateTime), "EEEE، dd MMMM yyyy، h:mm a").replace(/AM|PM/, (match) => match === "AM" ? "ص" : "م")
      : format(new Date(selectedDateTime), "EEEE, dd MMMM yyyy, h:mm a")
    : "";

  return (
    <View className="gap-4">
      <Text className="text-lg font-medium">
        {CalenderHeading ?? t("available_dates")}
      </Text>
      
      {/* Display selected date time */}
      <View className="bg-background rounded-lg py-2 flex justify-center items-start">
        {selectedDateTime ? (
          <Text className="text-xl bg-neutral-100 text-primary-600 p-4 rounded-xl text-center w-full">
            {formattedDateTime}
          </Text>
        ) : (
          <Text className="text-gray-600 text-xl bg-neutral-100 p-4 rounded-xl text-center w-full">
            {t("Please select a date and time")}.
          </Text>
        )}
      </View>

      {/* Calendar */}
      <Calendar
        minDate={minDate}
        maxDate={maxDate}
        markedDates={markedDates}
        disableAllTouchEventsForDisabledDays={true}
        onDayPress={(day) => {
          const date = new Date(day.dateString);
          if (!isDayDisabled(date)) {
            setSelectedDate(day.dateString);
            // Clear selected time when date changes
            setSelectedDateTime("");
          }
        }}
        dayComponent={({ date, state }) => {
          const dateObj = new Date(date.dateString);
          const isDisabled = isDayDisabled(dateObj);
          const isSelected = selectedDate === date.dateString;
          const isAvailable = markedDates?.[date.dateString];

          const isBeforeMin = minDate && dateObj < new Date(minDate);
          const isAfterMax = maxDate && dateObj > new Date(maxDate);
          const isOutOfRange = isBeforeMin || isAfterMax;

          const finalDisabled = isDisabled || isOutOfRange;

          return (
            <Button
              disabled={finalDisabled}
              size="icon"
              onPress={() => {
                if (!finalDisabled) {
                  setSelectedDate(date.dateString);
                  setSelectedDateTime("");
                }
              }}
              className={`w-10 h-10 rounded-full items-center justify-center ${
                isSelected ? "bg-[#8A00FA]" : "bg-transparent"
              }`}
            >
              <Text
                className={`${
                  finalDisabled || state === "disabled"
                    ? "text-gray-300"
                    : isSelected
                    ? "text-white"
                    : isAvailable
                    ? "text-green-600 font-semibold"
                    : "text-gray-400"
                }`}
              >
                {date.day}
              </Text>
            </Button>
          );
        }}
      />

      {/* Time Slots */}
      {selectedDate && (
        <View>
          <Text className="font-semibold mb-2">
            {TimeSliderHeading ?? t("Available time")}
          </Text>

          {/* Available Slots Section */}
          {availableSlots.length > 0 ? (
            <View className="mb-4">
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View className="flex-row gap-2 px-1">
                  {availableSlots.map((slot) => {
                    const isSelected = selectedDateTime === slot.iso;

                    return (
                      <TouchableOpacity
                        key={slot.iso}
                        onPress={() => {
                          setSelectedDateTime(slot.iso);
                        }}
                        className={`p-3 border rounded-xl min-w-[90px] ${
                          isSelected
                            ? "bg-[#8A00FA] border-[#8A00FA]"
                            : "border-gray-300 bg-white"
                        }`}
                        style={{ marginRight: 8 }}
                      >
                        <Text
                          className={`font-medium text-center ${
                            isSelected ? "text-white" : "text-gray-700"
                          }`}
                        >
                          {`${localizeAMPM(slot.startTime)} - ${localizeAMPM(slot.endTime)}`}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </ScrollView>
            </View>
          ) : (
            <Text className="text-gray-500 text-center py-4">
              {t("No available time slots for this date")}
            </Text>
          )}
        </View>
      )}
    </View>
  );
}