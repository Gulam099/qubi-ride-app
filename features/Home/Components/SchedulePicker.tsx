import React, { useState, useMemo, useRef, useImperativeHandle, forwardRef } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Calendar } from "@/components/ui/Calendar";
import { format, addMinutes, isBefore, set } from "date-fns";
import { Button } from "@/components/ui/Button";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";

type SchedulePickerSheetRef = {
  open: () => void;
  close: () => void;
};

interface SchedulePickerProps {
  selectedDateTime: string;
  setSelectedDateTime: (value: string) => void;
  effectiveFrom: string;
  effectiveTo: string;
  startTime: string; // "09:00"
  endTime: string; // "17:30"
  days_of_week: number[]; // [1, 2, 3, 4, 5] (Mon to Fri)
  timezone?: string;
  CalenderHeading?: string;
  TimeSliderHeading?: string;
}

export const SchedulePickerButton = ({
  sheetRef,
  selectedDateTime,
  setSelectedDateTime,
}: {
  sheetRef: React.RefObject<SchedulePickerSheetRef>;
  selectedDateTime: string;
  setSelectedDateTime: (value: string) => void;
}) => {
  return (
    <Button
      onPress={() => sheetRef.current?.open()}
      variant={"outline"}
      className="w-full my-2"
    >
      <Text className="text-neutral-600">{selectedDateTime === "" ? "Please Select Date time" :format(new Date(selectedDateTime) , "EEEE  , dd mmm yyyy , hh : mm a")}</Text>
    </Button>
  );
};

export const SchedulePickerSheet = forwardRef<SchedulePickerSheetRef, Omit<SchedulePickerProps, 'ref'>>(
    (
      {
        selectedDateTime,
        setSelectedDateTime,
        effectiveFrom,
        effectiveTo,
        startTime,
        endTime,
        timezone,
        days_of_week,
        CalenderHeading,
        TimeSliderHeading,
      },
      ref
    ) => {
  const internalSheetRef = useRef<BottomSheet>(null);

  // expose methods to parent
  useImperativeHandle(ref, () => ({
    open: () => internalSheetRef.current?.expand(),
    close: () => internalSheetRef.current?.close(),
  }));

  const [selectedDate, setSelectedDate] = useState<string | null>(
    selectedDateTime ? format(new Date(selectedDateTime), "yyyy-MM-dd") : null
  );

  const today = new Date();
  const effective = new Date(effectiveFrom);
  const minDate = format(effective < today ? today : effective, "yyyy-MM-dd");
  const maxDate = format(new Date(effectiveTo), "yyyy-MM-dd");

  const formattedDateTime = selectedDateTime
    ? format(new Date(selectedDateTime), "d MMMM yyyy | h:mm a")
    : "";

  // ✅ Mark selected date
  const markedDates = selectedDate
    ? {
        [selectedDate]: {
          selected: true,
          marked: true,
          selectedColor: "#1E3A8A",
        },
      }
    : {};

  const disabledDays = useMemo(() => {
    const daysOfWeekNums = days_of_week.map(Number);
    return Array.from({ length: 7 }, (_, i) => i).filter(
      (day) => !daysOfWeekNums.includes(day)
    );
  }, [days_of_week]);

  const isDayDisabled = (date: Date) => {
    const appDay = date.getDay() === 0 ? 7 : date.getDay();
    const daysOfWeekNums = days_of_week.map(Number);
    return !daysOfWeekNums.includes(appDay);
  };

  // ✅ Generate times between startTime and endTime for selected date
  const timesForSelectedDate = useMemo(() => {
    if (!selectedDate) return [];

    const [startHour, startMin] = startTime.split(":").map(Number);
    const [endHour, endMin] = endTime.split(":").map(Number);

    let current = set(new Date(selectedDate), {
      hours: startHour,
      minutes: startMin,
      seconds: 0,
      milliseconds: 0,
    });

    const end = set(new Date(selectedDate), {
      hours: endHour,
      minutes: endMin,
      seconds: 0,
      milliseconds: 0,
    });

    const slots = [];
    while (isBefore(current, end)) {
      slots.push(current.toISOString());
      current = addMinutes(current, 30); // 30-min interval
    }

    return slots;
  }, [selectedDate, startTime, endTime]);

  return (
    <BottomSheet ref={internalSheetRef} index={-1} enablePanDownToClose snapPoints={['%100']}>
      <BottomSheetView className="w-full flex-1 bg-white p-2">
        <View className="gap-4">
          <Text className="text-lg font-medium">
            {CalenderHeading ?? "Available Dates"}
          </Text>

          <View className="bg-background rounded-lg px-4 py-2 flex justify-center items-start">
            {selectedDateTime ? (
              <Text className=" font-xl text-blue-600">
                {formattedDateTime}
              </Text>
            ) : (
              <Text className=" text-gray-600">
                Please select a date and time.
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
              }
            }}
            dayComponent={({ date, state }) => {
              const dateObj = new Date(date.dateString);

              const isDisabled = isDayDisabled(dateObj);
              const isMarked = markedDates?.[date.dateString];
              const isSelected = selectedDate === date.dateString;

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
                    }
                  }}
                  className="items-center justify-center w-10 h-10 rounded-full"
                  variant={
                    isSelected ? "default" : finalDisabled ? "ghost" : "outline"
                  }
                >
                  <Text
                    className={`${
                      finalDisabled || state === "disabled"
                        ? "text-gray-300"
                        : isSelected
                        ? "text-white"
                        : "text-black"
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
                {TimeSliderHeading ?? "Available Times"}
              </Text>
              <ScrollView horizontal>
                {timesForSelectedDate.map((iso) => {
                  const time = format(new Date(iso), "h:mm a");
                  return (
                    <Button
                      key={iso}
                      onPress={() => setSelectedDateTime(iso)}
                      className={`m-2 `}
                      variant={selectedDateTime === iso ? "default" : "outline"}
                    >
                      <Text
                        className={`font-medium ${
                          selectedDateTime === iso
                            ? "text-background"
                            : "text-gray-500"
                        }`}
                      >
                        {time}
                      </Text>
                    </Button>
                  );
                })}
              </ScrollView>
            </View>
          )}
        </View>
      </BottomSheetView>
    </BottomSheet>
  );
});
