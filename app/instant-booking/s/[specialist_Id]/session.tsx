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
// import useFreshUser from "@/hooks/useFreshUser";

const InstantBookingContent = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const contentInsets = {
    top: insets.top,
    bottom: insets.bottom,
    left: 12,
    right: 12,
  };

  const { specialist_Id, todaySchedule, doctorFees } = useLocalSearchParams();
  const { user } = useUser();
  // const { freshUser: user, refreshUser, loading } = useFreshUser();
  const userId = user?.publicMetadata?.dbPatientId as string;
  const doctorId = specialist_Id as string;
  const [doctorSchedule, setDoctorSchedule] = useState(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [selectedNumberOfSessions, setSelectedNumberOfSessions] = useState(1);
  const [isForFamilyMember, setIsForFamilyMember] = useState(false);

  const baseFee = parseFloat(doctorFees as string) || 0;
  const totalFee = baseFee * selectedSlots.length;

  useEffect(() => {
    const now = new Date();
    setSelectedDate(now);
  }, []);

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
    return bookedSlots.flatMap((booking) => booking?.selectedSlots);
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
    { label: "1 session", value: 1 },
    { label: "2 sessions", value: 2 },
    { label: "3 sessions", value: 3 },
  ];
  const relationshipOptions = [
    "Spouse",
    "Child",
    "Parent",
    "Sibling",
    "Grandparent",
    "Grandchild",
    "Other",
  ];
  const timesForSelectedDate = useMemo(() => {
    if (!selectedDate || !doctorSchedule) {
      console.log("No selected date or doctor schedule");
      return [];
    }

    const { isHoliday, start, end } = doctorSchedule;

    if (isHoliday || !start || !end) {
      console.log("Holiday or missing start/end times");
      return [];
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
        return [];
      }

      const slots = [];
      const now = new Date();

      // Check if selected date is today
      const isToday = isSameDay(selectedDate, now);

      console.log("Is today?", isToday);
      console.log("Current time:", now.toISOString());

      // Create slots based on the date and time range
      let current = new Date(startDate);

      while (isBefore(current, endDate)) {
        const slotTime = new Date(current);

        // For today, only show future slots with 5-minute buffer
        if (isToday) {
          if (slotTime < now) {
            current = addMinutes(current, 30);
            continue;
          }
        }

        const slotIso = slotTime.toISOString();
        console.log(
          "Generated slot:",
          slotIso,
          "Display time:",
          format(slotTime, "h:mm a")
        );

        slots.push({
          iso: slotIso,
          isBooked: flatBookedSlotIsos.includes(slotIso),
          // display: format(slotTime, "h:mm a"),
        });

        current = addMinutes(current, 30);
      }

      console.log("Total generated slots:", slots.length);
      return slots;
    } catch (error) {
      console.error("Error generating time slots:", error);
      return [];
    }
  }, [selectedDate, doctorSchedule, flatBookedSlotIsos]);

  const handleSlotSelection = (slotIso) => {
    console.log("Selecting slot:", slotIso);
    console.log("Display time:", format(new Date(slotIso), "h:mm a"));

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
      familyMemberAge: "",
      relationship: "",
    },
  });

  useEffect(() => {
    if (!isForFamilyMember) {
      reset({
        familyMemberName: "",
        familyMemberAge: "",
        relationship: "",
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
          <Text className="font-semibold mb-2">Language</Text>
          <View className="flex-row gap-2">
            {["Arabic", "English", "French"].map((language) => (
              <Controller
                key={language}
                control={control}
                rules={{ required: "Language is required." }}
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
                      {language}
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
          <Text className="text-lg font-medium mb-1">Number of sessions</Text>
          <View className="flex-row gap-2 mb-4">
            {numberOfSessionsOptions.map(({ label, value }) => (
              <Controller
                key={value}
                control={control}
                name="numberOfSessions"
                rules={{ required: "Number of sessions is required" }}
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
          <Text className="font-semibold mb-2">Duration</Text>
          <View className="flex-row gap-2">
            {["30 minutes", "45 minutes", "60 minutes"].map((duration) => (
              <Controller
                key={duration}
                control={control}
                rules={{ required: "Duration is required." }}
                name="duration"
                render={({ field: { onChange, value } }) => (
                  <Button
                    className="flex-1"
                    variant={value === duration ? "default" : "outline"}
                    onPress={() => onChange(duration)}
                  >
                    <Text
                      className={
                        value === duration ? "text-white" : "text-gray-800"
                      }
                    >
                      {duration}
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
              Available Times
              {selectedNumberOfSessions > 1 && (
                <Text className="text-sm text-gray-600">
                  {" "}
                  (Select {selectedNumberOfSessions} slots)
                </Text>
              )}
            </Text>
            <Text className="text-sm text-gray-600 mb-2">
              Selected: {selectedSlots.length}/{selectedNumberOfSessions}
            </Text>

            {timesForSelectedDate.length > 0 ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 4 }}
              >
                <View className="flex-row gap-2 flex-wrap">
                  {timesForSelectedDate.map(({ iso, isBooked }) => {
                    const time = format(new Date(iso), "h:mm a");
                    const isSelected = selectedSlots.includes(iso);

                    return (
                      <Button
                        key={iso}
                        onPress={() => !isBooked && handleSlotSelection(iso)}
                        className="mx-1 mb-2"
                        variant={
                          isBooked
                            ? "destructive"
                            : isSelected
                            ? "default"
                            : "outline"
                        }
                        disabled={isBooked}
                      >
                        <Text
                          className={`font-medium ${
                            isBooked
                              ? "text-white"
                              : isSelected
                              ? "text-white"
                              : "text-gray-700"
                          }`}
                        >
                          {time}
                          {isBooked && " (Booked)"}
                        </Text>
                      </Button>
                    );
                  })}
                </View>
              </ScrollView>
            ) : (
              <Text className="text-gray-500 text-center py-4">
                No available time slots for this date
              </Text>
            )}
          </View>
        )}

        {/* Fee Calculation */}
        {selectedSlots.length > 0 && (
          <View className="bg-blue-50 p-4 rounded-lg">
            <Text className="font-semibold text-lg mb-2">Fee Calculation</Text>
            <Text className="text-gray-700">
              Base Fee: {currencyFormatter(baseFee)}
            </Text>
            <Text className="text-gray-700">
              Selected Sessions: {selectedSlots.length}
            </Text>
            <Text className="font-bold text-lg text-blue-600">
              Total: {currencyFormatter(totalFee)}
            </Text>
          </View>
        )}

        {/* Overview of the Consultation */}
        <View>
          <Text className="font-semibold mb-2">
            Overview of the Consultation
          </Text>
          <Controller
            control={control}
            name="overview"
            rules={{ required: "Overview is required." }}
            render={({ field: { onChange, value } }) => (
              <Textarea
                placeholder="Write a brief overview for the specialist about the consultation"
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
        <View className="flex-row items-center justify-between">
          <Text className="font-semibold">Closest Appointment</Text>
          <Controller
            control={control}
            name="closestAppointment"
            render={({ field: { onChange, value } }) => (
              <Switch checked={value} onCheckedChange={onChange} />
            )}
          />
        </View>

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
              Booking for a family member
            </Text>
          </Pressable>
        </View>

        {/* Family Member Details - Show only when checkbox is checked */}
        {isForFamilyMember && (
          <View className="bg-white p-4 rounded-lg border border-gray-200 mb-4">
            <Text className="text-lg font-semibold mb-4 text-blue-600">
              Family Member Details
            </Text>

            {/* Family Member Name */}
            <View className="mb-4">
              <Text className="font-semibold mb-2">Full Name *</Text>
              <Controller
                control={control}
                name="familyMemberName"
                rules={{
                  required: isForFamilyMember
                    ? "Family member name is required"
                    : false,
                }}
                render={({ field: { onChange, value } }) => (
                  <Input
                    placeholder="Enter family member's full name"
                    value={value}
                    onChangeText={onChange}
                    className="border border-gray-300 rounded-lg px-3 py-3"
                  />
                )}
              />
              {errors.familyMemberName && (
                <Text className="text-red-500 text-sm mt-1">
                  {errors.familyMemberName.message}
                </Text>
              )}
            </View>

            {/* Age and Gender Row */}
            <View className="flex-row gap-4 mb-4">
              {/* Age */}
              <View className="flex-1">
                <Text className="font-semibold mb-2">Age *</Text>
                <Controller
                  control={control}
                  name="familyMemberAge"
                  rules={{
                    required: isForFamilyMember ? "Age is required" : false,
                    pattern: {
                      value: /^[0-9]+$/,
                      message: "Please enter a valid age",
                    },
                  }}
                  render={({ field: { onChange, value } }) => (
                    <Input
                      placeholder="Age"
                      value={value}
                      onChangeText={onChange}
                      keyboardType="numeric"
                      className="border border-gray-300 rounded-lg px-3 py-3"
                    />
                  )}
                />
                {errors.familyMemberAge && (
                  <Text className="text-red-500 text-sm mt-1">
                    {errors.familyMemberAge.message}
                  </Text>
                )}
              </View>
            </View>

            {/* Relationship */}
            <View className="mb-4">
              <Text className="font-semibold mb-2">Relationship to you *</Text>
              <View className="flex-row flex-wrap gap-2">
                {relationshipOptions.map((relationship) => (
                  <Controller
                    key={relationship}
                    control={control}
                    rules={{
                      required: isForFamilyMember
                        ? "Relationship is required"
                        : false,
                    }}
                    name="relationship"
                    render={({ field: { onChange, value } }) => (
                      <Button
                        className="mb-2"
                        variant={value === relationship ? "default" : "outline"}
                        onPress={() => onChange(relationship)}
                      >
                        <Text
                          className={
                            value === relationship
                              ? "text-white text-xs"
                              : "text-gray-800 text-xs"
                          }
                        >
                          {relationship}
                        </Text>
                      </Button>
                    )}
                  />
                ))}
              </View>
              {errors.relationship && (
                <Text className="text-red-500 text-sm mt-1">
                  {errors.relationship.message}
                </Text>
              )}
            </View>
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
              ? "Processing..."
              : `Book now ${totalFee > 0 ? currencyFormatter(totalFee) : ""}`}
          </Text>
        </Button>
      </ScrollView>
    </View>
  );
};

export default InstantBookingContent;
