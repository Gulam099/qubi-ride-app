import React, {
  useState,
  useMemo,
  useRef,
  useImperativeHandle,
  forwardRef,
} from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Calendar } from "@/components/ui/Calendar";
import { format, addMinutes, isBefore, set, parse } from "date-fns";
import { Button } from "@/components/ui/Button";
import BottomSheet, {
  BottomSheetView,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";

type SchedulePickerSheetRef = {
  open: () => void;
  close: () => void;
};

interface SchedulePickerProps {
  selectedDateTime: string;
  setSelectedDateTime: (value: string) => void;
  doctorSchedule: Record<
    string,
    {
      start: string | null;
      end: string | null;
      isHoliday: boolean;
    }
  >;
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
      <Text className="text-neutral-600">
        {selectedDateTime === ""
          ? "Please Select Date time"
          : format(
              new Date(selectedDateTime),
              "EEEE  , dd MMMM yyyy , hh : mm a"
            )}
      </Text>
    </Button>
  );
};

export const SchedulePickerSheet = forwardRef<
  SchedulePickerSheetRef,
  Omit<SchedulePickerProps, "ref">
>(
  (
    {
      selectedDateTime,
      setSelectedDateTime,
      doctorSchedule,
      CalenderHeading,
      TimeSliderHeading,
    },
    ref
  ) => {
    const internalSheetRef = useRef<BottomSheet>(null);
    console.log("selected", selectedDateTime);

    // expose methods to parent
    useImperativeHandle(ref, () => ({
      open: () => internalSheetRef.current?.expand(),
      close: () => internalSheetRef.current?.close(),
    }));

    const [selectedDate, setSelectedDate] = useState<string | null>(
      selectedDateTime ?? null
    );

    // Calculate min and max dates from available schedule
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

    const formattedDateTime = selectedDateTime
      ? format(new Date(selectedDateTime), "EEEE  , dd MMMM yyyy , hh : mm a")
      : "";

    console.log(
      "formattedDateTime",
      formattedDateTime,
      "selectedDate",
      selectedDate
    );
    // ✅ Mark available dates (non-holiday dates)
    const markedDates = useMemo(() => {
      const marks: Record<string, any> = {};

      if (!doctorSchedule) return marks;

      Object.keys(doctorSchedule).forEach((dateKey) => {
        if (!doctorSchedule[dateKey].isHoliday) {
          marks[dateKey] = {
            marked: true,
            selected: dateKey === selectedDate,
            selectedColor: dateKey === selectedDate ? "#1E3A8A" : "#10B981",
            dotColor: dateKey === selectedDate ? "#1E3A8A" : "#10B981",
          };
        }
      });

      return marks;
    }, [selectedDate, doctorSchedule]);

    // Check if a day is disabled (holiday or not in schedule)
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

    // ✅ Generate time slots for selected date
    const timesForSelectedDate = useMemo(() => {
      if (
        !selectedDate ||
        !doctorSchedule ||
        !(selectedDate in doctorSchedule)
      ) {
        return [];
      }

      const { isHoliday, start, end } = doctorSchedule[selectedDate];

      if (isHoliday || !start || !end) {
        return [];
      }

      try {
        let current = new Date(start);
        const endDate = new Date(end);
        const slots = [];

        // Ensure we don't generate slots in the past
        const now = new Date();
        const selectedDateObj = new Date(selectedDate);
        const isToday =
          format(selectedDateObj, "yyyy-MM-dd") === format(now, "yyyy-MM-dd");

        while (isBefore(current, endDate)) {
          // If it's today, only show future time slots
          if (!isToday || current > now) {
            slots.push(current.toISOString());
          }
          current = addMinutes(current, 30);
        }

        return slots;
      } catch (error) {
        console.error("Error generating time slots:", error);
        return [];
      }
    }, [selectedDate, doctorSchedule]);

    return (
      <BottomSheet
        ref={internalSheetRef}
        index={-1}
        enableDynamicSizing={false}
        snapPoints={["100%"]}
      >
        <BottomSheetView className="w-full flex-1 bg-white p-4">
          <View className="gap-4">
            <Text className="text-lg font-medium">
              {CalenderHeading ?? "Available Dates"}
            </Text>

            <View className="bg-background rounded-lg py-2 flex justify-center items-start">
              {selectedDateTime ? (
                <Text className="text-xl bg-neutral-100 text-primary-600 p-4 rounded-xl text-center w-full">
                  {formattedDateTime}
                </Text>
              ) : (
                <Text className="text-gray-600 text-xl bg-neutral-100 p-4 rounded-xl text-center w-full">
                  Please select a date and time.
                </Text>
              )}
            </View>

            {/* Debug info - remove in production */}
            {/* {__DEV__ && (
              <View className="bg-yellow-100 p-2 rounded">
                <Text className="text-xs">
                  Available dates: {Object.keys(doctorSchedule || {}).filter(date => !doctorSchedule?.[date]?.isHoliday).join(", ")}
                </Text>
                <Text className="text-xs">
                  Selected date: {selectedDate || "None"}
                </Text>
                <Text className="text-xs">
                  Time slots: {timesForSelectedDate.length}
                </Text>
              </View>
            )} */}

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
                  // Reset selected time when date changes
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
                    className="items-center justify-center w-10 h-10 rounded-full"
                    variant={
                      isSelected
                        ? "default"
                        : isAvailable && !finalDisabled
                        ? "outline"
                        : "ghost"
                    }
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
                  {TimeSliderHeading ?? "Available Times"}
                </Text>
                {timesForSelectedDate.length > 0 ? (
                  <BottomSheetScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                  >
                    <View className="flex-row gap-2">
                      {timesForSelectedDate.map((iso) => {
                        const time = format(new Date(iso), "h:mm a");
                        return (
                          <Button
                            key={iso}
                            onPress={() => {
                              // Get just the time string (e.g. "11:30 AM")
                              const timeStr = format(new Date(iso), "h:mm a");

                              // Combine date and time into a single string (e.g. "2025-05-29 11:30 AM")
                              const combined = `${selectedDate} ${timeStr}`;

                              // Parse it into a JavaScript Date object
                              const combinedDate = parse(
                                combined,
                                "yyyy-MM-dd h:mm a",
                                new Date()
                              );

                              // Convert to ISO string (e.g. "2025-05-29T06:00:00.000Z")
                              const isoDateTime = combinedDate.toISOString();

                              setSelectedDateTime(isoDateTime);
                            }}
                            className="mx-1"
                            variant={
                              selectedDateTime === iso ? "default" : "outline"
                            }
                          >
                            <Text
                              className={`font-medium ${
                                selectedDateTime === iso
                                  ? "text-white"
                                  : "text-gray-700"
                              }`}
                            >
                              {format(new Date(iso), "h:mm a")}
                            </Text>
                          </Button>
                        );
                      })}
                    </View>
                  </BottomSheetScrollView>
                ) : (
                  <Text className="text-gray-500 text-center py-4">
                    No available time slots for this date
                  </Text>
                )}
              </View>
            )}
          </View>
          <Button
            onPress={() => {
              internalSheetRef.current?.close();
            }}
            className="mt-4"
            disabled={!selectedDateTime}
          >
            <Text className="text-white">Done</Text>
          </Button>
        </BottomSheetView>
      </BottomSheet>
    );
  }
);
