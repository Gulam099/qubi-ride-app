import { View, ScrollView } from "react-native";
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
import { useMutation } from "@tanstack/react-query";
import { format, isBefore, addMinutes, parse, isSameDay } from "date-fns";

const InstantBookingContent = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const contentInsets = {
    top: insets.top,
    bottom: insets.bottom,
    left: 12,
    right: 12,
  };

  const { specialist_Id, todaySchedule } = useLocalSearchParams();
  const { user } = useUser();
  const userId = user?.publicMetadata.dbPatientId as string;
  const doctorId = specialist_Id as string;
  const [doctorSchedule, setDoctorSchedule] = useState(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedDateTime, setSelectedDateTime] = useState("");

  console.log("");

  useEffect(() => {
    const now = new Date();
    setSelectedDate(now);
  }, []);

  console.log("selectedDateTime", selectedDateTime);

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

  const timesForSelectedDate = useMemo(() => {
    if (!selectedDate || !doctorSchedule) {
      console.log("No selected date or doctor schedule");
      return [];
    }

    // Check if doctorSchedule has the required properties directly
    const { isHoliday, start, end } = doctorSchedule;

    if (isHoliday || !start || !end) {
      console.log("Holiday or missing start/end times");
      return [];
    }

    try {
      let current = new Date(start);
      const endDate = new Date(end);
      const slots = [];
      const now = new Date();

      // Check if selected date is today
      const isToday = isSameDay(selectedDate, now);

      console.log("Generating slots from", current, "to", endDate);
      console.log("Is today?", isToday);

      while (isBefore(current, endDate)) {
        // If it's today, only show future time slots (add 5 minutes buffer)
        const slotTime = new Date(current);
        const bufferTime = new Date(now.getTime() + 5 * 60 * 1000); // 5 minutes from now

        if (!isToday || slotTime > bufferTime) {
          slots.push(slotTime.toISOString());
        }
        current = addMinutes(current, 30);
      }

      console.log("Generated slots:", slots);
      return slots;
    } catch (error) {
      console.error("Error generating time slots:", error);
      return [];
    }
  }, [selectedDate, doctorSchedule]);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm({
    defaultValues: {
      language: "",
      numberOfsessions:"",
      duration: "",
      overview: "",
      closestAppointment: false,
    },
  });

  const { mutate: createVideoCall } = useMutation({
    mutationFn: async ({ bookingId, duration }) => {
      const videoCallPayload = {
        bookingId: bookingId,
        patientId: userId,
        doctorId: doctorId,
        type: "video",
        scheduledAt: selectedDateTime,
        duration: duration,
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

      return await response.json();
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
      // Add the selected datetime to the booking data
      const bookingData = {
        ...data,
      };

      // 1. Create Payment first
      // const paymentPayload = {
      //   userId: userId,
      //   doctorId: doctorId,
      //   amount: 1000,
      //   currency: "SAR",
      //   description: data.overview || "Instant consultation booking",
      //   status: "initiated",
      // };

      // const paymentResponse = await fetch(`${ApiUrl}/api/payments/create`, {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //     Authorization: `Bearer ${process.env.EXPO_MOYASAR_TEST_SECRET_KEY}`,
      //   },
      //   body: JSON.stringify(paymentPayload),
      // });

      // const paymentResult = await paymentResponse.json();
      // if (!paymentResponse.ok)
      //   throw new Error(paymentResult?.message || "Payment creation failed.");

      // const paymentId = paymentResult?.payment?.internalPaymentId;
      // if (!paymentId) throw new Error("Payment ID missing.");

      // 2. Create Instant Booking with payment reference
      const instantBookingPayload = {
        ...bookingData,
        patientId: userId,
        doctorId: doctorId,
        // paymentId: paymentId,
        selectedDateTime: selectedDateTime,
        paymentStatus: "pending", // Because payment not completed yet
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

      console.log;

      return { bookingResult };
    },
    onSuccess: ({ bookingResult }) => {
      toast.success("Instant booking created successfully!");

      // Create video call room after successful booking
      if (bookingResult?.booking?._id) {
        createVideoCall({
          bookingId: bookingResult.booking._id,
          duration: bookingResult?.booking?.duration,
        });
      }
      reset();
      router.push("/instant-booking");
      console.log("Booking result:", bookingResult);
    },
    onError: (err: any) => {
      toast.error(err.message || "Something went wrong. Please try again.");
      console.log("Error booking instant session:", err);
    },
  });

  const onSubmit = (data: any) => {
    if (!selectedDateTime) {
      toast.error("Please select a time slot.");
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
            {[ "Arabic", "English", "French"].map((language) => (
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
                  className={`flex-1 `}
                  variant={selectedValue === value ? "default" : "outline"}
                  onPress={() => onChange(value)}
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

        {/* Duration Selection */}
        <View>
          <Text className="font-semibold mb-2">Duration</Text>
          <View className="flex-row gap-2">
            {["60 minutes", "45 minutes", "30 minutes"].map((duration) => (
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
            <Text className="font-semibold mb-2">Available Times</Text>
            {timesForSelectedDate.length > 0 ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 4 }}
              >
                <View className="flex-row gap-2">
                  {timesForSelectedDate.map((iso) => {
                    const time = format(new Date(iso), "h:mm a");
                    const isSelected = selectedDateTime === iso;

                    return (
                      <Button
                        key={iso}
                        onPress={() => {
                          setSelectedDateTime(iso);
                          setValue("selectedDateTime", iso);
                        }}
                        className="mx-1"
                        variant={isSelected ? "default" : "outline"}
                      >
                        <Text
                          className={`font-medium ${
                            isSelected ? "text-white" : "text-gray-700"
                          }`}
                        >
                          {time}
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

        {/* Submit Button */}
        <Button
          onPress={handleSubmit(onSubmit)}
          disabled={isSubmitting}
          className="mb-4"
        >
          <Text className="text-white font-semibold">
            {isSubmitting ? "Processing..." : "Book now"}
          </Text>
        </Button>
      </ScrollView>
    </View>
  );
};

export default InstantBookingContent;
