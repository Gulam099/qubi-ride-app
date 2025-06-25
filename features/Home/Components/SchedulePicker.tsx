import React, {
  useState,
  useMemo,
  useRef,
  useImperativeHandle,
  forwardRef,
  useEffect,
} from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Calendar } from "@/components/ui/Calendar";
import { format, addMinutes, isBefore, set, parse } from "date-fns";
import { Button } from "@/components/ui/Button";
import BottomSheet, {
  BottomSheetView,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { useQuery } from "@tanstack/react-query";
import { ApiUrl } from "@/const";

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
  doctorId?: string;
  CalenderHeading?: string;
  TimeSliderHeading?: string;
  numberOfSessions?: number;
  time?: number;
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
  const parseSelectedSlots = (dateTimeStr: string) => {
    if (!dateTimeStr) return [];
    try {
      return JSON.parse(dateTimeStr);
    } catch {
      return [dateTimeStr];
    }
  };

  const selectedSlots = parseSelectedSlots(selectedDateTime);

  // Convert UTC to local time for display
  const formatLocalDate = (utcDate: string) => {
    const date = new Date(utcDate);
    // Add the timezone offset to convert to local time
    const localDate = new Date(
      date.getTime() + date.getTimezoneOffset() * 60000
    );
    return format(localDate, "EEEE  , dd MMMM yyyy , hh : mm a");
  };

  return (
    <Button
      onPress={() => sheetRef.current?.open()}
      variant={"outline"}
      className="w-full my-2"
    >
      <Text className="text-neutral-600">
        {selectedSlots.length === 0
          ? "Please Select Date time"
          : selectedSlots.length === 1
          ? formatLocalDate(selectedSlots[0])
          : `${selectedSlots.length} slots selected on ${format(
              new Date(selectedSlots[0]),
              "EEEE  , dd MMMM yyyy"
            )}`}
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
      doctorId,
      CalenderHeading,
      TimeSliderHeading,
      numberOfSessions = 1,
      time,
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
    const [bookedSlots, setBookedSlots] = useState<string[]>([]);
    const [selectedDate, setSelectedDate] = useState<string | null>(
      selectedDateTime ?? null
    );

    console.log("bookedSlots", bookedSlots);
    // Parse and manage multiple selected slots
    const [selectedSlots, setSelectedSlots] = useState<string[]>(() => {
      if (!selectedDateTime) return [];
      try {
        return JSON.parse(selectedDateTime);
      } catch {
        // Backward compatibility - if it's a single slot
        return [selectedDateTime];
      }
    });

    console.log("bookedSlots", bookedSlots);

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

    const formattedDateTime =
      selectedSlots.length > 0
        ? selectedSlots.length === 1
          ? format(
              new Date(selectedSlots[0]),
              "EEEE  , dd MMMM yyyy , hh : mm a"
            )
          : `${selectedSlots.length} slots selected on ${format(
              new Date(selectedSlots[0]),
              "EEEE  , dd MMMM yyyy"
            )}`
        : "";

    console.log(
      "formattedDateTime",
      formattedDateTime,
      "selectedDate",
      selectedDate,
      "selectedSlots",
      selectedSlots
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

    const { data: bookedSlotsData } = useQuery({
      queryKey: ["bookedSlots", doctorId, selectedDate],
      queryFn: async () => {
        if (!selectedDate || !doctorId) return [];

        const dateStr = format(new Date(selectedDate), "yyyy-MM-dd");
        const response = await fetch(
          `${ApiUrl}/api/bookings/slots/${doctorId}?date=${dateStr}`,
          {
            headers: {
              "Cache-Control": "no-cache",
              Pragma: "no-cache",
              Expires: "0",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch booked slots");
        }

        const result = await response.json();
        return result.bookings || [];
      },
      enabled: !!doctorId && !!selectedDate,
    });

    useEffect(() => {
      if (bookedSlotsData) {
        setBookedSlots(bookedSlotsData);
      }
    }, [bookedSlotsData]);

    const flatBookedSlotIsos = useMemo(() => {
      if (!bookedSlots || bookedSlots.length === 0) return [];
      return bookedSlots.map((booking) => ({
        start: new Date(booking.date[0]), // or booking.startTime
        duration: booking.duration || 30, // fallback to 30 if not present
      }));
    }, [bookedSlots]);

    // ✅ Generate time slots for selected date
    const { availableSlots, bookedSlots: bookedSlotsForDate } = useMemo(() => {
      if (
        !selectedDate ||
        !doctorSchedule ||
        !(selectedDate in doctorSchedule)
      ) {
        console.log("No selected date or doctor schedule");
        return { availableSlots: [], bookedSlots: [] };
      }

      const { isHoliday, start, end } = doctorSchedule[selectedDate];

      if (isHoliday || !start || !end) {
        console.log("Holiday or missing start/end times");
        return { availableSlots: [], bookedSlots: [] };
      }

      try {
        // Create start and end date using selected date
        const startDate = new Date(selectedDate + "T" + start.split("T")[1]);
        const endDate = new Date(selectedDate + "T" + end.split("T")[1]);

        let current = new Date(startDate);
        const allSlots = [];
        const available = [];
        const booked = [];

        const now = new Date();
        const isToday = format(now, "yyyy-MM-dd") === selectedDate;
        while (isBefore(current, endDate)) {
          const slotEnd = addMinutes(current, time || 30);

          const overlappingBooking = flatBookedSlotIsos.find(
            ({ start, duration }) => {
              const bookedStart = new Date(start); // ensure it's Date object
              const bookedEnd = addMinutes(bookedStart, duration);

              // Overlap condition
              return current < bookedEnd && slotEnd > bookedStart;
            }
          );

          if (overlappingBooking) {
            // Skip to end of conflicting booking
            current = addMinutes(
              overlappingBooking.start,
              overlappingBooking.duration
            );
            continue;
          }

          const slotIso = current.toISOString();
          const slotData = {
            iso: slotIso,
            isBooked: false,
            startTime: format(current, "h:mm a"),
            endTime: format(slotEnd, "h:mm a"),
            duration: time || 30,
            displayText: `${format(current, "h:mm a")} - ${format(
              slotEnd,
              "h:mm a"
            )} (${time || 30} min)`,
            formattedTime: format(current, "h:mm a"),
          };

          available.push(slotData);
          allSlots.push(slotData);
          current = slotEnd;
        }

        allSlots.forEach((slot) => {
          if (slot.isBooked) {
            booked.push(slot);
          } else {
            available.push(slot);
          }
        });

        return {
          availableSlots: available,
          bookedSlots: booked,
        };
      } catch (error) {
        console.error("Error generating scheduled slots:", error);
        return { availableSlots: [], bookedSlots: [] };
      }
    }, [selectedDate, doctorSchedule, flatBookedSlotIsos, time]);

    return (
      <BottomSheet
        ref={internalSheetRef}
        index={-1}
        enableDynamicSizing={false}
        snapPoints={["100%"]}
      >
        <BottomSheetScrollView className="flex-1 bg-white">
          <View className="p-4 pb-8">
            <View className="gap-4">
              <Text className="text-lg font-medium">
                {CalenderHeading ?? "Available Dates"}
              </Text>
              <View className="bg-background rounded-lg py-2 flex justify-center items-start">
                {selectedSlots.length > 0 ? (
                  <View className="w-full">
                    <Text className="text-xl bg-neutral-100 text-primary-600 p-4 rounded-xl text-center w-full mb-2">
                      {formattedDateTime}
                    </Text>
                    {selectedSlots.length > 1 && (
                      <View className="flex-row flex-wrap gap-2 px-2">
                        {selectedSlots.map((slot, index) => (
                          <Text
                            key={index}
                            className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                          >
                            {format(new Date(slot), "h:mm a")}
                          </Text>
                        ))}
                      </View>
                    )}
                  </View>
                ) : (
                  <Text className="text-gray-600 text-xl bg-neutral-100 p-4 rounded-xl text-center w-full">
                    Please select {numberOfSessions} time slot
                    {numberOfSessions > 1 ? "s" : ""}.
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
                    // Reset selected slots when date changes
                    setSelectedSlots([]);
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
                          setSelectedSlots([]);
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
                    {numberOfSessions > 1 && (
                      <Text className="text-sm text-gray-600 font-normal">
                        {" "}
                        (Select {numberOfSessions} slots -{" "}
                        {selectedSlots.length}/{numberOfSessions} selected)
                      </Text>
                    )}
                  </Text>

                  {/* Available Slots Section */}
                  {availableSlots.length > 0 ? (
                    <View className="mb-4">
                      <Text className="text-sm text-green-600 font-medium mb-2">
                        Available Slots ({availableSlots.length})
                      </Text>
                      <View className="flex-row flex-wrap gap-2">
                        {availableSlots.map((slot) => {
                          const isSelected = selectedSlots.includes(slot.iso);
                          const canSelect =
                            selectedSlots.length < numberOfSessions ||
                            isSelected;
                          return (
                            <Button
                              key={slot.iso}
                              onPress={() => {
                                if (canSelect) {
                                  let newSelectedSlots;
                                  if (isSelected) {
                                    // Remove slot if already selected
                                    newSelectedSlots = selectedSlots.filter(
                                      (s) => s !== slot.time
                                    );
                                  } else {
                                    // Add slot if under the limit
                                    if (
                                      selectedSlots.length < numberOfSessions
                                    ) {
                                      newSelectedSlots = [
                                        ...selectedSlots,
                                        slot.iso,
                                      ].sort();
                                    } else {
                                      return;
                                    }
                                  }

                                  setSelectedSlots(newSelectedSlots);
                                  setSelectedDateTime(
                                    JSON.stringify(newSelectedSlots)
                                  );
                                }
                              }}
                              disabled={
                                !isSelected &&
                                selectedSlots.length >= numberOfSessions
                              }
                              className={`mb-2 ${
                                isSelected
                                  ? "bg-blue-600 border-blue-600"
                                  : !canSelect &&
                                    selectedSlots.length >= numberOfSessions
                                  ? "bg-gray-100 border-gray-200 opacity-50"
                                  : "border-gray-300"
                              }`}
                              variant={isSelected ? "default" : "outline"}
                              style={{
                                minWidth: 90,
                                marginRight: 8,
                                marginBottom: 8,
                              }}
                            >
                              <Text
                                className={`font-medium ${
                                  isSelected
                                    ? "text-white"
                                    : !canSelect &&
                                      selectedSlots.length >= numberOfSessions
                                    ? "text-gray-400"
                                    : "text-gray-700"
                                }`}
                              >
                                {slot.formattedTime}
                              </Text>
                            </Button>
                          );
                        })}
                      </View>
                    </View>
                  ) : (
                    <Text className="text-gray-500 text-center py-4">
                      No available time slots for this date
                    </Text>
                  )}
                  {bookedSlotsForDate.length > 0 && (
                    <View className="mt-4">
                      <Text className="text-sm text-red-600 font-medium mb-2">
                        Booked Slots ({bookedSlotsForDate.length})
                      </Text>
                      <View className="flex-row flex-wrap gap-2">
                        {bookedSlotsForDate.map((slot) => (
                          <View
                            key={slot.iso}
                            className="bg-red-50 border border-red-200 px-3 py-2 rounded-md"
                            style={{
                              minWidth: 90,
                              marginRight: 8,
                              marginBottom: 8,
                            }}
                          >
                            <Text className="text-red-600 font-medium text-center">
                              {slot.formattedTime}
                            </Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}
                </View>
              )}
            </View>

            {/* Done Button - Now inside the scrollable area */}
            <Button
              onPress={() => {
                internalSheetRef.current?.close();
              }}
              className="mt-4"
              disabled={selectedSlots.length !== numberOfSessions}
            >
              <Text className="text-white">
                Done{" "}
                {selectedSlots.length > 0 &&
                  `(${selectedSlots.length}/${numberOfSessions})`}
              </Text>
            </Button>
          </View>
        </BottomSheetScrollView>
      </BottomSheet>
    );
  }
);
