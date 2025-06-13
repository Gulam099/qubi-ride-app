import { View, Text, ScrollView, Pressable, Platform } from "react-native";
import React, { useEffect, useMemo, useRef, useState } from "react";
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
import { apiBaseUrl } from "@/features/Home/constHome";
import {
  SchedulePickerButton,
  SchedulePickerSheet,
} from "@/features/Home/Components/SchedulePicker";
import { InfoCircle, Status } from "iconsax-react-native";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function SessionConsultPage() {
  const { user } = useUser();
  const router = useRouter();
  const { specialist_Id } = useLocalSearchParams();
  const [selectedDateTime, setSelectedDateTime] = useState("");
  const [doctorSchedule, setDoctorSchedule] = useState("");
  const [isForFamilyMember, setIsForFamilyMember] = useState(false);

  const SchedulePickerRef = useRef(null);

  const fetchSpecialistData = async () => {
    if (!specialist_Id) throw new Error("Specialist ID is missing.");
    const response = await fetch(
      `${ApiUrl}/api/doctors/doctor/${specialist_Id}`
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

  const clerk_Id = specialistData?.data?.clerkId;
  const getUserById = async (clerk_Id) => {
    try {
      const response = await fetch(`${ApiUrl}/user/${clerk_Id}`);
      const data = await response.json();
      setDoctorSchedule(data);
    } catch (error) {
      console.error("Failed to fetch user:", error);
    }
  };

  const numberOfSessionsOptions = [
    { label: "1 session", value: 1 },
    { label: "2 sessions", value: 2 },
    { label: "3 sessions", value: 3 },
  ];
  const sessionDurations = [
    { label: "30 min", value: 30 },
    { label: "45 min", value: 45 },
    { label: "60 min", value: 60 },
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

  useEffect(() => {
    if (clerk_Id) {
      getUserById(clerk_Id);
    }
  }, [clerk_Id]);

  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      language: "",
      numberOfSessions: "",
      sessionDuration: "",
      gender: "",
      familyMemberName: "",
      familyMemberAge: "",
      relationship: "",
    },
  });

  const numberOfSessionsValue = watch("numberOfSessions");

  useEffect(() => {
    if (!isForFamilyMember) {
      reset({
        familyMemberName: "",
        familyMemberAge: "",
        relationship: "",
      });
    }
  }, [isForFamilyMember]);

  const { mutate: bookSession, isPending: isSubmitting } = useMutation({
    mutationFn: async (data: any) => {
      const userId = user?.publicMetadata.dbPatientId as string;
      const doctorId = specialist_Id as string;

      // Validation
      if (!selectedDateTime) {
        throw new Error("Please select a date and time");
      }

      // 1. Create Booking now
      const bookingPayload = {
        userId: userId,
        doctorId: doctorId,
        date: selectedDateTime,
        duration: data.sessionDuration,
        sessionCount: data.numberOfSessions,
        language: data.language,
        gender: data.gender, // Added gender field
        paymentStatus: "pending",
        ...(isForFamilyMember && {
          isForFamilyMember: true,
          familyMemberDetails: {
            name: data.familyMemberName,
            age: data.familyMemberAge,
            relationship: data.relationship,
          },
        }),
      };

      const bookingResponse = await fetch(`${ApiUrl}/api/bookings/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingPayload),
      });

      const bookingResult = await bookingResponse.json();
      if (!bookingResponse.ok)
        throw new Error(bookingResult?.message || "Booking creation failed.");

      // 2. Create Payment first
      const paymentPayload = {
        userId: userId,
        doctorId: doctorId,
        bookingId: bookingResult?.booking?._id,
        amount: 1000,
        currency: "SAR",
        description: "Medical consultation session", // Fixed: removed undefined reference
        status: "initiated",
        bookingType: "schedule",
      };

      const paymentResponse = await fetch(`${ApiUrl}/api/payments/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.EXPO_MOYASAR_TEST_SECRET_KEY}`,
        },
        body: JSON.stringify(paymentPayload),
      });

      const paymentResult = await paymentResponse.json();
      if (!paymentResponse.ok)
        throw new Error(paymentResult?.message || "Payment creation failed.");

      const paymentId = paymentResult?.payment?.internalPaymentId;
      if (!paymentId) throw new Error("Payment ID missing.");

      return {
        paymentId,
        bookingId: bookingResult?.booking?._id,
        bookingData: {
          userId,
          doctorId,
          selectedDateTime,
          sessionDuration: data.sessionDuration,
          numberOfSessions: data.numberOfSessions,
        },
      };
    },
    onSuccess: ({ paymentId, bookingId, bookingData }) => {
      toast.success("Booking created successfully!");
      if (paymentId) {
        const queryParams = new URLSearchParams({
          userId: bookingData.userId,
          doctorId: bookingData.doctorId,
          selectedDateTime: bookingData.selectedDateTime,
          sessionDuration: bookingData.sessionDuration.toString(),
          numberOfSessions: bookingData.numberOfSessions. toString(),
          bookingId: bookingId || "",
        }).toString();
        router.push(`/(stacks)/paymentpage/${paymentId}?${queryParams}`);
      } else {
        toast.error("Payment ID not found.");
      }
    },
    onError: (err: any) => {
      toast.error(err.message || "Something went wrong. Please try again.");
      console.log("Error booking session:", err);
    },
  });

  const onSubmit = (data: any) => {
    console.log("Form data:", data); // Debug log
    console.log("Selected DateTime:", selectedDateTime); // Debug log
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
    <>
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

          <View>
            <Text className="text-lg font-medium mb-4">Number of sessions</Text>
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
          </View>

          <View>
            <Text className="text-lg font-medium mb-4">Duration sessions</Text>
            <View className="flex-row gap-2 mb-4">
              {sessionDurations.map(({ label, value }) => (
                <Controller
                  key={value}
                  control={control}
                  name="sessionDuration"
                  rules={{ required: "Session duration is required" }}
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
            {errors.sessionDuration && (
              <Text className="text-red-500">
                {errors.sessionDuration.message}
              </Text>
            )}
          </View>

          {/* gender Selection */}
          <View>
            <Text className="font-semibold mb-2">Gender</Text>
            <View className="flex-row gap-2">
              {["Male", "Female", "Rather not say"].map((gender) => (
                <Controller
                  key={gender}
                  control={control}
                  rules={{ required: "Gender is required." }}
                  name="gender"
                  render={({ field: { onChange, value } }) => (
                    <Button
                      className="flex-1"
                      variant={value === gender ? "default" : "outline"}
                      onPress={() => onChange(gender)}
                    >
                      <Text
                        className={
                          value === gender ? "text-white" : "text-gray-800"
                        }
                      >
                        {gender}
                      </Text>
                    </Button>
                  )}
                />
              ))}
            </View>
            {errors.gender && (
              <Text className="text-red-500 text-sm mt-1">
                {errors.gender.message}
              </Text>
            )}
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
                <Text className="font-semibold mb-2">
                  Relationship to you *
                </Text>
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
                          variant={
                            value === relationship ? "default" : "outline"
                          }
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

          <SchedulePickerButton
            selectedDateTime={selectedDateTime}
            setSelectedDateTime={setSelectedDateTime}
            sheetRef={SchedulePickerRef}
          />

          <Button
            onPress={handleSubmit(onSubmit)}
            disabled={isSubmitting}
            className="mt-4 mb-4"
          >
            <Text className="text-white font-medium">
              {isSubmitting ? "Submitting..." : "Submit"}
            </Text>
          </Button>
        </ScrollView>
      </View>

      <SchedulePickerSheet
        selectedDateTime={selectedDateTime}
        setSelectedDateTime={setSelectedDateTime}
        doctorSchedule={doctorSchedule}
        doctorId={specialist_Id}
        numberOfSessions={numberOfSessionsValue}
        ref={SchedulePickerRef}
      />
    </>
  );
}
