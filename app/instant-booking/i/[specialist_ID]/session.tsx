import { View, ScrollView, Pressable } from "react-native";
import React, { useEffect, useMemo, useState } from "react";
import { ApiUrl } from "@/const";
import { toast } from "sonner-native";
import { Controller, useForm } from "react-hook-form";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useUser } from "@clerk/clerk-expo";
import { Switch } from "@/components/ui/Switch";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Text } from "@/components/ui/Text";
import { Textarea } from "@/components/ui/Textarea";
import { useMutation, useQuery } from "@tanstack/react-query";
import { format, isBefore, addMinutes, parse, isSameDay } from "date-fns";
import { currencyFormatter } from "@/utils/currencyFormatter.utils";
import { useTranslation } from "react-i18next";

const InstantBookingContent = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const contentInsets = {
    top: insets.top,
    bottom: insets.bottom,
    left: 12,
    right: 12,
  };
  const { t } = useTranslation();

  const { specialist_ID, todaySchedule, doctorFees } = useLocalSearchParams();
  const { user } = useUser();
  // const { freshUser: user, refreshUser, loading } = useFreshUser();
  const userId = user?.publicMetadata?.dbPatientId as string;
  const doctorId = specialist_ID as string;
  const [doctorSchedule, setDoctorSchedule] = useState(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [selectedNumberOfSessions, setSelectedNumberOfSessions] = useState(1);
  const [selectedDuration, setSelectedDuration] = useState(30);
  const [isForFamilyMember, setIsForFamilyMember] = useState(false);
  const [userFamily, setUserFamily] = useState();

  const baseFee = parseFloat(doctorFees as string) || 0;
  const totalFee = baseFee * selectedSlots.length;
  const getUserFamilyById = async (userId) => {
    try {
      const response = await fetch(`${ApiUrl}/api/users/getUser/${userId}`);
      const data = await response.json();
      setUserFamily(data.family);
    } catch (error) {
      console.error("Failed to fetch user:", error);
    }
  };

  useEffect(() => {
    const now = new Date();
    setSelectedDate(now);
    if (userId) {
      getUserFamilyById(userId);
    }
  }, [userId]);

  // Fetch booked slots for the selected date
  const { data: bookedSlotsData } = useQuery({
    queryKey: ["bookedSlots", doctorId, selectedDate],
    queryFn: async () => {
      if (!selectedDate || !doctorId) return [];

      const dateStr = format(selectedDate, "yyyy-MM-dd");
      const response = await fetch(
        `${ApiUrl}/api/instantbookings/doctor/${doctorId}?date=${dateStr}`
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

    const blockedSlots = [];
    bookedSlots.forEach((booking) => {
      booking.selectedSlots?.forEach((slot) => {
        const slotStart = new Date(slot);
        // Extract duration number from string like "30 minutes"
        const durationStr = booking.duration || "30 minutes";
        const duration = parseInt(durationStr.split(" ")[0]) || 30;

        // Block all slots within the duration
        for (let i = 0; i < duration; i += 30) {
          const blockedSlot = addMinutes(slotStart, i);
          blockedSlots.push({
            iso: blockedSlot.toISOString(),
            duration: duration,
            originalDuration: duration,
          });
        }
      });
    });

    return blockedSlots;
  }, [bookedSlots]);

  console.log("bookedSlots", bookedSlots);
  console.log("selectedSlots", selectedSlots);

  useEffect(() => {
    try {
      if (todaySchedule) {
        // Check if todaySchedule is already an object or a string
        let parsed;
        if (typeof todaySchedule === "string") {
          parsed = JSON.parse(todaySchedule);
        } else {
          parsed = todaySchedule;
        }

        console.log("doctorScheduleeee", parsed);
        console.log("Start time:", parsed.start); // Direct access to start time
        console.log("End time:", parsed.end); // Direct access to end time
        setDoctorSchedule(JSON.parse(parsed));
      }
    } catch (err) {
      console.error("Failed to parse todaySchedule", err);
      // If parsing fails, try to use todaySchedule directly
      if (todaySchedule && typeof todaySchedule === "object") {
        console.log("Using todaySchedule directly as object");
        setDoctorSchedule(todaySchedule);
      }
    }
  }, [todaySchedule]);

  const numberOfSessionsOptions = [
    { label: `1 ${t("session")}`, value: 1 },
    { label: `2 ${t("sessions")}`, value: 2 },
    { label: `3 ${t("sessions")}`, value: 3 },
  ];
  const isSlotAvailable = (slotTime, duration) => {
    if (!selectedDate || !doctorSchedule) return false;

    const { isHoliday, start, end } = doctorSchedule;
    if (isHoliday) return false;

    const endDate = new Date(end);
    const slotEndTime = addMinutes(slotTime, duration);

    // Check if slot + duration fits within doctor's schedule
    if (slotEndTime > endDate) return false;

    // Check for overlap with any existing booking
    for (const booking of bookedSlots) {
      if (!booking.selectedSlots || booking.selectedSlots.length === 0)
        continue;

      for (const bookedSlot of booking.selectedSlots) {
        const bookedStart = new Date(bookedSlot);
        const bookedDuration = booking.duration || 30;
        const bookedEnd = addMinutes(bookedStart, bookedDuration);

        // Check if there's any overlap between new slot and existing booking
        // Two time ranges overlap if: start1 < end2 && start2 < end1
        if (slotTime < bookedEnd && slotEndTime > bookedStart) {
          return false; // There's an overlap
        }
      }
    }

    return true;
  };

  const { availableSlots, bookedSlotsForDate } = useMemo(() => {
    if (!selectedDate || !doctorSchedule) {
      console.log("No selected date or doctor schedule");
      return { availableSlots: [], bookedSlotsForDate: [] };
    }

    const { isHoliday, start, end } = doctorSchedule;

    if (isHoliday || !start || !end) {
      console.log("Holiday or missing start/end times");
      return { availableSlots: [], bookedSlotsForDate: [] };
    }

    try {
      // Parse start and end times
      const startDate = new Date(start);
      const endDate = new Date(end);

      console.log("Original start:", start);
      console.log("Original end:", end);
      console.log("Parsed start:", startDate);
      console.log("Parsed end:", endDate);

      // Validate dates
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        console.error("Invalid start or end date");
        return { availableSlots: [], bookedSlotsForDate: [] };
      }

      const available = [];
      const booked = [];
      const now = new Date();

      // Check if selected date is today
      const isToday = isSameDay(selectedDate, now);

      console.log("Is today?", isToday);
      console.log("Current time:", now.toISOString());

      // Helper function to check if two time slots overlap
      const doSlotsOverlap = (
        slot1Start,
        slot1Duration,
        slot2Start,
        slot2Duration
      ) => {
        const slot1End = addMinutes(new Date(slot1Start), slot1Duration);
        const slot2End = addMinutes(new Date(slot2Start), slot2Duration);

        return (
          new Date(slot1Start) < slot2End && slot1End > new Date(slot2Start)
        );
      };

      // STEP 1: Process booked slots for the selected date (with their original duration)
      const bookedSlotsForSelectedDate = flatBookedSlotIsos.filter(
        (bookedSlot) => {
          const bookedDate = new Date(
            typeof bookedSlot === "object" && bookedSlot.iso
              ? bookedSlot.iso
              : bookedSlot
          );
          return isSameDay(bookedDate, selectedDate);
        }
      );

      console.log("Booked slots for date:", bookedSlotsForSelectedDate);

      // Process booked slots and create display objects with their ORIGINAL duration
      const processedBookedSlots = [];

      bookedSlotsForSelectedDate.forEach((bookedSlot) => {
        let slotTime, originalDuration;

        if (typeof bookedSlot === "object" && bookedSlot.iso) {
          // If booked slot has duration information
          slotTime = new Date(bookedSlot.iso);
          originalDuration =
            bookedSlot.duration || bookedSlot.originalDuration || 30;
        } else {
          // If it's just an ISO string, assume default duration
          slotTime = new Date(bookedSlot);
          originalDuration = 30; // You might want to store this information in your booking data
        }

        if (!isNaN(slotTime.getTime())) {
          const slotEndTime = addMinutes(slotTime, originalDuration);

          const bookedSlotData = {
            iso: slotTime.toISOString(),
            isBooked: true,
            startTime: format(slotTime, "h:mm a"),
            endTime: format(slotEndTime, "h:mm a"),
            duration: originalDuration, // Keep original duration
            displayText: `${format(slotTime, "h:mm a")} - ${format(
              slotEndTime,
              "h:mm a"
            )} (${originalDuration} min)`,
            formattedTime: format(slotTime, "h:mm a"),
            startDateTime: slotTime,
          };

          booked.push(bookedSlotData);
          processedBookedSlots.push({
            startTime: slotTime,
            duration: originalDuration,
            iso: slotTime.toISOString(),
          });
        }
      });

      // STEP 2: Generate available slots using the SELECTED duration
      let current = new Date(startDate);

      while (isBefore(current, endDate)) {
        const slotTime = new Date(current);
        const slotEndTime = addMinutes(slotTime, selectedDuration);

        // For today, only show future slots
        if (isToday && slotTime < now) {
          current = addMinutes(current, selectedDuration);
          continue;
        }

        // Check if this slot + duration fits within the schedule
        if (slotEndTime > endDate) {
          current = addMinutes(current, selectedDuration);
          continue;
        }

        // Check if this new slot would overlap with any existing booked slot
        const hasOverlap = processedBookedSlots.some((bookedSlot) => {
          return doSlotsOverlap(
            slotTime,
            selectedDuration,
            bookedSlot.startTime,
            bookedSlot.duration
          );
        });

        if (!hasOverlap) {
          const slotIso = slotTime.toISOString();
          const slotData = {
            iso: slotIso,
            isBooked: false,
            startTime: format(slotTime, "h:mm a"),
            endTime: format(slotEndTime, "h:mm a"),
            duration: selectedDuration, // Use selected duration for new bookings
            displayText: `${format(slotTime, "h:mm a")} - ${format(
              slotEndTime,
              "h:mm a"
            )} (${selectedDuration} min)`,
            formattedTime: format(slotTime, "h:mm a"),
          };

          available.push(slotData);
        }

        current = addMinutes(current, selectedDuration);
      }

      console.log("Available slots:", available.length);
      console.log("Booked slots:", booked.length);

      return { availableSlots: available, bookedSlotsForDate: booked };
    } catch (error) {
      console.error("Error generating time slots:", error);
      return { availableSlots: [], bookedSlotsForDate: [] };
    }
  }, [selectedDate, doctorSchedule, flatBookedSlotIsos, selectedDuration]);

  const handleSlotSelection = (slotIso) => {
    const slot = availableSlots.find((s) => s.iso === slotIso);
    console.log("Selecting slot:", slotIso);
    console.log("Display time:", slot?.displayText);

    const isCurrentlySelected = selectedSlots.includes(slotIso);

    if (isCurrentlySelected) {
      setSelectedSlots((prev) => prev.filter((slot) => slot !== slotIso));
    } else {
      if (selectedSlots.length < selectedNumberOfSessions) {
        setSelectedSlots((prev) => [...prev, slotIso]);
      } else {
        toast.error(`You can only select ${selectedNumberOfSessions} slot(s)`);
      }
    }
  };
  // Handle duration change
  const handleDurationChange = (duration) => {
    const numericDuration = parseInt(duration.split(" ")[0]); // Extract number from "30 minutes"
    setSelectedDuration(numericDuration);
    setSelectedSlots([]); // Clear selected slots when duration changes
    setValue("duration", duration); // Update form value
  };

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm({
    defaultValues: {
      language: "",
      numberOfSessions: "",
      duration: "",
      overview: "",
      closestAppointment: false,
      familyMemberName: "",
    },
  });

  useEffect(() => {
    if (!isForFamilyMember) {
      reset({
        familyMemberName: "",
      });
    }
  }, [isForFamilyMember]);

  const { mutate: createVideoCall } = useMutation({
    mutationFn: async ({ bookingId, duration, slots }) => {
      const responses = [];

      for (const slot of slots) {
        const videoCallPayload = {
          bookingId: bookingId,
          patientId: userId,
          doctorId: doctorId,
          type: "video",
          scheduledAt: slot,
          duration: duration,
          instant: true,
        };
        const response = await fetch(`${ApiUrl}/api/room/create-room`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(videoCallPayload),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to create video call");
        }

        const result = await response.json();
        responses.push(result);
      }

      return responses; // Return all created room data
    },
    onSuccess: (data) => {
      console.log("Video call created successfully:", data);
      toast.success("Video call scheduled successfully!");
    },
    onError: (error) => {
      console.error("Failed to create video call:", error);
      toast.error("Failed to schedule video call: " + error.message);
    },
  });

  const { mutate: bookInstantSession, isPending: isSubmitting } = useMutation({
    mutationFn: async (data: any) => {
      // Add the selected slots to the booking data
      const bookingData = {
        ...data,
      };

      // Create Instant Booking
      const instantBookingPayload = {
        ...bookingData,
        patientId: userId,
        doctorId: doctorId,
        numberOfSessions: selectedNumberOfSessions,
        selectedSlots: selectedSlots, // All selected slots
        paymentStatus: "pending",
        totalFee: totalFee,
        ...(isForFamilyMember && {
          isForFamilyMember: true,
          familyMemberDetails: {
            name: data.familyMemberName,
            age: data.familyMemberAge,
            relationship: data.relationship,
          },
        }),
      };

      const bookingResponse = await fetch(
        `${ApiUrl}/api/instantbookings/create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(instantBookingPayload),
        }
      );

      const bookingResult = await bookingResponse.json();
      if (!bookingResponse.ok)
        throw new Error(
          bookingResult?.message || "Instant booking creation failed."
        );

      return { bookingResult };
    },
    onSuccess: ({ bookingResult }) => {
      toast.success("Instant booking created successfully!");
      // Create video call room after successful booking
      if (bookingResult?.booking?._id) {
        createVideoCall({
          bookingId: bookingResult?.booking?._id,
          duration: bookingResult?.booking?.duration,
          slots: bookingResult?.booking?.selectedSlots,
        });
      }
      reset();
      setSelectedSlots([]);
      router.push("/instant-booking");
    },
    onError: (err: any) => {
      toast.error(err.message || "Something went wrong. Please try again.");
      console.log("Error booking instant session:", err);
    },
  });

  const onSubmit = (data: any) => {
    if (selectedSlots.length === 0) {
      toast.error("Please select at least one time slot.");
      return;
    }

    if (selectedSlots.length !== selectedNumberOfSessions) {
      toast.error(
        `Please select exactly ${selectedNumberOfSessions} time slot(s).`
      );
      return;
    }

    bookInstantSession(data);
  };

  return (
    <View className="relative w-full flex-1 bg-white">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, gap: 16 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Language Selection */}
        <View>
          <Text className="font-semibold mb-2">{t("Language")}</Text>
          <View className="flex-row gap-2">
            {["Arabic", "English", "French"].map((language) => (
              <Controller
                key={language}
                control={control}
                rules={{ required: t("languageRequired") }}
                name="language"
                render={({ field: { onChange, value } }) => (
                  <Button
                    className="flex-1"
                    variant={value === language ? "default" : "outline"}
                    onPress={() => onChange(language)}
                  >
                    <Text
                      className={
                        value === language ? "text-white" : "text-gray-800"
                      }
                    >
                      {t(language)}
                    </Text>
                  </Button>
                )}
              />
            ))}
          </View>
          {errors.language && (
            <Text className="text-red-500 text-sm mt-1">
              {errors.language.message}
            </Text>
          )}
        </View>

        {/* Number of sessions */}
        <View>
          <Text className="text-lg font-medium mb-1">
            {t("Number of sessions")}
          </Text>
          <View className="flex-row gap-2 mb-4">
            {numberOfSessionsOptions.map(({ label, value }) => (
              <Controller
                key={value}
                control={control}
                name="numberOfSessions"
                rules={{ required: t("numberOfSessionsRequired") }}
                render={({ field: { onChange, value: selectedValue } }) => (
                  <Button
                    className="flex-1"
                    variant={selectedValue === value ? "default" : "outline"}
                    onPress={() => {
                      onChange(value);
                      setSelectedNumberOfSessions(value);
                      // Clear selected slots when changing number of sessions
                      setSelectedSlots([]);
                    }}
                  >
                    <Text
                      className={
                        selectedValue === value
                          ? "text-white"
                          : "text-neutral-800"
                      }
                    >
                      {label}
                    </Text>
                  </Button>
                )}
              />
            ))}
          </View>
          {errors.numberOfSessions && (
            <Text className="text-red-500">
              {errors.numberOfSessions.message}
            </Text>
          )}
        </View>

        {/* Duration Selection */}
        <View>
          <Text className="font-semibold mb-2">{t("Duration")}</Text>
          <View className="flex-row gap-2">
            {[
              { key: "30 minutes", label: `30 ${t("minutes")}` },
              { key: "45 minutes", label: `45 ${t("minutes")}` },
              { key: "60 minutes", label: `60 ${t("minutes")}` },
            ].map((duration) => (
              <Controller
                key={duration.key}
                control={control}
                rules={{ required: t("Duration is required") }}
                name="duration"
                render={({ field: { onChange, value } }) => (
                  <Button
                    className="flex-1"
                    variant={value === duration.key ? "default" : "outline"}
                    onPress={() => {
                      onChange(duration.key); // Update form
                      handleDurationChange(duration.key); // Update slots
                    }}
                  >
                    <Text
                      className={
                        value === duration.key ? "text-white" : "text-gray-800"
                      }
                    >
                      {duration.label}
                    </Text>
                  </Button>
                )}
              />
            ))}
          </View>
          {errors.duration && (
            <Text className="text-red-500 text-sm mt-1">
              {errors.duration.message}
            </Text>
          )}
        </View>

        {/* Time Slots */}
        {selectedDate && (
          <View>
            <Text className="font-semibold mb-2">
              {t("Available time")}
              {selectedNumberOfSessions > 1 && (
                <Text className="text-sm text-gray-600">
                  {" "}
                  ({t("Select",{count:selectedNumberOfSessions})})
                </Text>
              )}
            </Text>
            <Text className="text-sm text-gray-600 mb-2">
              {t("Selected")}: {selectedSlots.length}/{selectedNumberOfSessions}
            </Text>

            {/* Available Slots Section */}
            {availableSlots.length > 0 ? (
              <View className="mb-4">
                <Text className="text-sm text-green-600 font-medium mb-2">
                  {t("Available Slots")} ({availableSlots.length})
                </Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingHorizontal: 4 }}
                >
                  <View className="flex-row gap-2 flex-wrap">
                    {availableSlots.map((slot) => {
                      const isSelected = selectedSlots.includes(slot.iso);
                      const canSelect =
                        selectedSlots.length < selectedNumberOfSessions ||
                        isSelected;

                      return (
                        <Button
                          key={slot.iso}
                          onPress={() => handleSlotSelection(slot.iso)}
                          className="mx-1 mb-2"
                          variant={isSelected ? "default" : "outline"}
                          disabled={
                            !isSelected &&
                            selectedSlots.length >= selectedNumberOfSessions
                          }
                        >
                          <Text
                            className={`font-medium ${
                              isSelected
                                ? "bg-[#005153] border-[#005153]"
                                : !canSelect &&
                                  selectedSlots.length >=
                                    selectedNumberOfSessions
                                ? "text-gray-400"
                                : "text-gray-700"
                            }`}
                          >
                             {`${slot.startTime} - ${slot.endTime}`}
                          </Text>
                        </Button>
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
            {bookedSlotsForDate.length > 0 && (
              <View className="mt-4">
                <Text className="text-sm text-red-600 font-medium mb-2">
                  {t("Booked Slots")} ({bookedSlotsForDate.length})
                </Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingHorizontal: 4 }}
                >
                  <View className="flex-row gap-2 flex-wrap">
                    {bookedSlotsForDate.map((slot) => (
                      <View
                        key={slot.iso}
                        className="bg-red-50 border border-red-200 px-3 py-2 rounded-md mx-1 mb-2"
                        style={{ minWidth: 90 }}
                      >
                        <Text className="text-red-600 font-medium text-center text-sm">
                           {`${slot.startTime} - ${slot.endTime}`}
                        </Text>
                      </View>
                    ))}
                  </View>
                </ScrollView>
              </View>
            )}
          </View>
        )}

        {/* Fee Calculation */}
        {selectedSlots.length > 0 && (
          <View className="bg-gray-400 p-4 rounded-lg">
            <Text className="font-semibold text-lg mb-2 text-white">
              {t("Fee Calculation")}
            </Text>
            <Text className="text-white">
              {t("Base Fee")}: {currencyFormatter(baseFee)}
            </Text>
            <Text className="text-white">
              {t("Selected Sessions")}: {selectedSlots.length}
            </Text>
            <Text className="font-bold text-lg text-white">
              {t("Total")}: {currencyFormatter(totalFee)}
            </Text>
          </View>
        )}

        {/* Overview of the Consultation */}
        <View>
          <Text className="font-semibold mb-2">
            {t("Overview of the Consultation")}
          </Text>
          <Controller
            control={control}
            name="overview"
            rules={{ required: "Overview is required." }}
            render={({ field: { onChange, value } }) => (
              <Textarea
                placeholder={t("consultationOverviewHint")}
                value={value}
                onChangeText={onChange}
              />
            )}
          />
          {errors.overview && (
            <Text className="text-red-500 text-sm mt-1">
              {errors.overview.message}
            </Text>
          )}
        </View>

        {/* Closest Appointment */}
        {/* <View className="flex-row items-center justify-between">
          <Text className="font-semibold">Closest Appointment</Text>
          <Controller
            control={control}
            name="closestAppointment"
            render={({ field: { onChange, value } }) => (
              <Switch checked={value} onCheckedChange={onChange} />
            )}
          />
        </View> */}

        <View className="mb-6 mt-6">
          <Pressable
            onPress={() => setIsForFamilyMember(!isForFamilyMember)}
            className="flex-row items-center gap-3"
          >
            <View
              className={`w-5 h-5 border-2 rounded ${
                isForFamilyMember
                  ? "bg-blue-500 border-blue-500"
                  : "border-gray-400"
              } justify-center items-center`}
            >
              {isForFamilyMember && (
                <Text className="text-white text-xs">✓</Text>
              )}
            </View>
            <Text className="text-base font-medium">
              {t("Booking for a family member")}
            </Text>
          </Pressable>
        </View>

        {/* Family Member Details - Show only when checkbox is checked */}
        {isForFamilyMember && (
          <View className="bg-white p-4 rounded-lg border border-gray-200 mb-4">
            <Text className="text-lg font-semibold mb-4 text-blue-600">
              {t("Select Family Member")}
            </Text>

            <Controller
              control={control}
              name="familyMemberName"
              rules={{
                required: t("select a family member"),
              }}
              render={({ field: { onChange, value } }) => {
                const [isDropdownOpen, setIsDropdownOpen] = useState(false);

                return (
                  <View className="relative">
                    {/* Dropdown Button */}
                    <Pressable
                      onPress={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="border border-gray-300 rounded-lg px-3 py-3 bg-white flex-row justify-between items-center"
                    >
                      <Text
                        className={`text-base ${
                          !value ? "text-gray-500" : "text-gray-900"
                        }`}
                      >
                        {value || t("selectFamilyMember")}
                      </Text>
                      <Text
                        className={`text-gray-500 transform ${
                          isDropdownOpen ? "rotate-180" : ""
                        }`}
                      >
                        ▼
                      </Text>
                    </Pressable>

                    {/* Dropdown Options */}
                    {isDropdownOpen && (
                      <View className="absolute top-full left-0 right-0 z-10 bg-white border border-gray-300 rounded-lg mt-1 shadow-lg">
                        {userFamily?.map((member, index) => (
                          <Pressable
                            key={member._id}
                            onPress={() => {
                              onChange(member.name);
                              setIsDropdownOpen(false);
                            }}
                            className={`px-3 py-3 ${
                              index !== userFamily.length - 1
                                ? "border-b border-gray-200"
                                : ""
                            } ${
                              value === member.name ? "bg-blue-50" : "bg-white"
                            } hover:bg-gray-50`}
                          >
                            <Text
                              className={`text-base ${
                                value === member.name
                                  ? "text-blue-700 font-semibold"
                                  : "text-gray-900"
                              }`}
                            >
                              {member.name}
                            </Text>
                          </Pressable>
                        ))}
                      </View>
                    )}
                  </View>
                );
              }}
            />

            {errors.familyMemberName && (
              <Text className="text-red-500 text-sm mt-1">
                {errors.familyMemberName.message}
              </Text>
            )}
          </View>
        )}

        {/* Submit Button */}
        <Button
          onPress={handleSubmit(onSubmit)}
          disabled={isSubmitting || selectedSlots.length === 0}
          className="mb-4"
        >
          <Text className="text-white font-semibold">
            {isSubmitting
              ? t("Processing...")
              : `${t("Book now")} ${
                  totalFee > 0 ? currencyFormatter(totalFee) : ""
                }`}
          </Text>
        </Button>
      </ScrollView>
    </View>
  );
};

export default InstantBookingContent;
