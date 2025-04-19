import { View, Text, ScrollView, Pressable, Platform } from "react-native";
import React, { useEffect, useMemo, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/Accordion";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ApiUrl, apiNewUrl } from "@/const";
import { toast } from "sonner-native";
import { useUser } from "@clerk/clerk-expo";
import { useMutation, useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import DateTimePicker from "@react-native-community/datetimepicker";

export default function SessionConsultPage() {
  const { user } = useUser();
  const router = useRouter();
  const { specialist_Id } = useLocalSearchParams();
  const [selectedDateTime, setSelectedDateTime] = useState("");

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [pickedDate, setPickedDate] = useState<Date | null>(null);
  const [pickedTime, setPickedTime] = useState<Date | null>(null);

  const fetchSpecialistData = async () => {
    if (!specialist_Id) throw new Error("Specialist ID is missing.");
    const response = await fetch(
      `${ApiUrl}/api/doctor/get-doctor/${specialist_Id}`
    );
    if (!response.ok) throw new Error("Failed to fetch specialist data");
    const result = await response.json();
    return result;
  };

  const {
    data: specialistData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["doctor", specialist_Id],
    queryFn: fetchSpecialistData,
    enabled: !!specialist_Id,
  });

  const numberOfSessionsOptions = [
    { label: "1 session", value: "1" },
    { label: "2 sessions", value: "2" },
    { label: "3 sessions", value: "3" },
  ];
  const sessionDurations = [
    { label: "30 min", value: "30" },
    { label: "45 min", value: "45" },
    { label: "60 min", value: "60" },
  ];

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      numberOfSessions: "",
      sessionDuration: "",
      personalInformation: {
        name: user?.fullName,
        age: "",
        academicLevel: "",
        employmentStatus: "",
      },
      familyComposition: {
        members: "",
        dynamics: "",
      },
      history: {
        healthConditions: "",
        medications: "",
      },
      natureOfComplaint: {
        description: "",
        severity: "",
      },
      additionalInfo: "",
      availableDate: "",
    },
  });

  const handleDateChange = (event: any, date?: Date) => {
    setShowDatePicker(false);
    if (date) setPickedDate(date);
  };

  const handleTimeChange = (event: any, time?: Date) => {
    setShowTimePicker(false);
    if (time) setPickedTime(time);
  };

  useEffect(() => {
    if (pickedDate && pickedTime) {
      const combined = new Date(
        pickedDate.getFullYear(),
        pickedDate.getMonth(),
        pickedDate.getDate(),
        pickedTime.getHours(),
        pickedTime.getMinutes()
      );
      setSelectedDateTime(combined.toISOString());
    }
  }, [pickedDate, pickedTime]);

  const { mutate: bookSession, isPending: isSubmitting } = useMutation({
    mutationFn: async (data: any) => {
      const dateFormatted = dayjs(pickedDate).format("YYYY-MM-DD");
      const timeFormatted = dayjs(pickedTime).format("hh:mm A");
      const userId = user?.publicMetadata.dbPatientId as string;
      const doctorId = specialist_Id as string;
      const bookingPayload = {
        userId,
        doctorId,
        date: dateFormatted,
        timeSlot: timeFormatted,
        duration: `${data.sessionDuration} min`,
        sessionCount: parseInt(data.numberOfSessions),
        complaint: data.natureOfComplaint.description || "Routine checkup",
      };

      const bookingResponse = await fetch(
        "https://monkfish-app-6ahnd.ondigitalocean.app/api/bookings/create",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(bookingPayload),
        }
      );

      const bookingResult = await bookingResponse.json();
      if (!bookingResponse.ok)
        throw new Error(bookingResult?.message || "Booking failed");

      // 2. Create room
      const roomPayload = {
        type: "video",
        doctorId,
        patientId: userId,
      };

      const roomResponse = await fetch(
        "https://monkfish-app-6ahnd.ondigitalocean.app/api/room/create-room",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(roomPayload),
        }
      );

      const roomResult = await roomResponse.json();
      if (!roomResponse.ok)
        throw new Error(roomResult?.message || "Room creation failed");

      // All done 🎉
      return { booking: bookingResult.booking, room: roomResult };
    },
    onSuccess: ({ booking }) => {
      toast.success("Booking & Room created successfully!");
      const bookingId = booking?._id;
      if (bookingId) {
        // router.push(`/account/appointment`);
        router.push(`/(stacks)/payment/${bookingId}`);
      } else {
        toast.error("Booking ID not found.");
      }
    },
    onError: (err: any) => {
      toast.error(err.message || "Something went wrong. Please try again.");
    },
  });

  const onSubmit = (data: any) => {
    if (!pickedDate || !pickedTime) {
      toast.error("Please select a date and time.");
      return;
    }

    bookSession(data);
  };

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text>Loading...</Text>
      </View>
    );
  }

  if (error || !specialistData) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-red-500">
          {error?.message || "Specialist not found."}
        </Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-blue-50/10">
      <View className="px-4 py-8 gap-2">
        <Text className="text-lg font-bold mb-4">Number of sessions</Text>
        <View className="flex-row gap-2 mb-4">
          {numberOfSessionsOptions.map(({ label, value }) => (
            <Controller
              key={value}
              control={control}
              name="numberOfSessions"
              rules={{ required: "Number of sessions is required" }}
              render={({ field: { onChange, value: selectedValue } }) => (
                <Button
                  className={`flex-1 ${
                    selectedValue === value ? "bg-blue-500" : "bg-gray-200"
                  }`}
                  onPress={() => onChange(value)}
                >
                  <Text
                    className={
                      selectedValue === value ? "text-white" : "text-gray-800"
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

        <Text className="text-lg font-bold mb-4">Duration sessions</Text>
        <View className="flex-row gap-2 mb-4">
          {sessionDurations.map(({ label, value }) => (
            <Controller
              key={value}
              control={control}
              name="sessionDuration"
              rules={{ required: "Session duration is required" }}
              render={({ field: { onChange, value: selectedValue } }) => (
                <Button
                  className={`flex-1 ${
                    selectedValue === value ? "bg-blue-500" : "bg-gray-200"
                  }`}
                  onPress={() => onChange(value)}
                >
                  <Text
                    className={
                      selectedValue === value ? "text-white" : "text-gray-800"
                    }
                  >
                    {label}
                  </Text>
                </Button>
              )}
            />
          ))}
        </View>
        {errors.sessionDuration && (
          <Text className="text-red-500">{errors.sessionDuration.message}</Text>
        )}

        <Accordion type="multiple" className="mb-4">
          <AccordionItem value="personalInformation">
            <AccordionTrigger>
              <Text className="text-lg font-bold">Personal Information</Text>
            </AccordionTrigger>
            <AccordionContent>
              <Controller
                control={control}
                name="personalInformation.name"
                rules={{ required: "Name is required" }}
                render={({ field: { onChange, value } }) => (
                  <Input
                    className="mb-4"
                    placeholder="Name"
                    value={value}
                    onChangeText={onChange}
                  />
                )}
              />
              <Controller
                control={control}
                name="personalInformation.age"
                rules={{ required: "Age is required" }}
                render={({ field: { onChange, value } }) => (
                  <Input
                    className="mb-4"
                    placeholder="Age"
                    keyboardType="numeric"
                    value={value}
                    onChangeText={onChange}
                  />
                )}
              />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="familyComposition">
            <AccordionTrigger>
              <Text className="text-lg font-bold">Family Composition</Text>
            </AccordionTrigger>
            <AccordionContent>
              <Controller
                control={control}
                name="familyComposition.members"
                rules={{ required: "Number of family members is required" }}
                render={({ field: { onChange, value } }) => (
                  <Input
                    className="mb-4"
                    placeholder="Number of family members"
                    value={value}
                    onChangeText={onChange}
                  />
                )}
              />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="history">
            <AccordionTrigger>
              <Text className="text-lg font-bold">The History is Healthy</Text>
            </AccordionTrigger>
            <AccordionContent>
              <Controller
                control={control}
                name="history.healthConditions"
                rules={{ required: "Health conditions are required" }}
                render={({ field: { onChange, value } }) => (
                  <Input
                    className="mb-4"
                    placeholder="Health conditions"
                    value={value}
                    onChangeText={onChange}
                  />
                )}
              />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="natureOfComplaint">
            <AccordionTrigger>
              <Text className="text-lg font-bold">
                The Nature of the Complaint
              </Text>
            </AccordionTrigger>
            <AccordionContent>
              <Controller
                control={control}
                name="natureOfComplaint.description"
                rules={{ required: "Complaint description is required" }}
                render={({ field: { onChange, value } }) => (
                  <Input
                    className="mb-4"
                    placeholder="Complaint description"
                    value={value}
                    onChangeText={onChange}
                  />
                )}
              />
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* Date and Time Picker UI */}
        <View className="mb-6">
          <Text className="text-lg font-bold mb-2">
            Select Appointment Date
          </Text>
          <Pressable
            onPress={() => setShowDatePicker(true)}
            className="bg-white p-3 rounded border mb-2"
          >
            <Text>
              {pickedDate ? pickedDate.toDateString() : "Choose a date"}
            </Text>
          </Pressable>
          {showDatePicker && (
            <DateTimePicker
              value={pickedDate || new Date()}
              mode="date"
              display={Platform.OS === "ios" ? "inline" : "default"}
              onChange={handleDateChange}
            />
          )}

          <Text className="text-lg font-bold mb-2">
            Select Appointment Time
          </Text>
          <Pressable
            onPress={() => setShowTimePicker(true)}
            className="bg-white p-3 rounded border"
          >
            <Text>
              {pickedTime
                ? dayjs(pickedTime).format("hh:mm A")
                : "Choose a time"}
            </Text>
          </Pressable>
          {showTimePicker && (
            <DateTimePicker
              value={pickedTime || new Date()}
              mode="time"
              is24Hour={false}
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={handleTimeChange}
            />
          )}
          {!selectedDateTime && (
            <Text className="text-red-500 mt-2">
              Please select a date and time.
            </Text>
          )}
        </View>

        <Button
          onPress={handleSubmit(onSubmit)}
          disabled={isSubmitting}
          className="mt-4"
        >
          <Text className="text-white font-medium">
            {isSubmitting ? "Submitting..." : "Submit"}
          </Text>
        </Button>
      </View>
    </ScrollView>
  );
}
