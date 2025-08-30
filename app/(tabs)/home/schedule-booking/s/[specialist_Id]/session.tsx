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
import { currencyFormatter } from "@/utils/currencyFormatter.utils";

import { useTranslation } from "react-i18next";

export default function SessionConsultPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const userId = user?.publicMetadata.dbPatientId as string;
  const { specialist_Id, doctorFees } = useLocalSearchParams();
  const [selectedDateTime, setSelectedDateTime] = useState("");
  const [doctorSchedule, setDoctorSchedule] = useState("");
  const [isForFamilyMember, setIsForFamilyMember] = useState(false);
  const [userFamily, setUserFamily] = useState([]);
  const { t } = useTranslation();

  const baseFee = parseFloat(doctorFees as string) || 0;
  console.log("userFamily", userFamily);

  const SchedulePickerRef = useRef(null);
  console.log("doctorFees", doctorFees);
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

  const getUserFamilyById = async (userId) => {
    try {
      const response = await fetch(`${ApiUrl}/api/users/getUser/${userId}`);
      const data = await response.json();
      setUserFamily(data.family);
    } catch (error) {
      console.error("Failed to fetch user:", error);
    }
  };

  const numberOfSessionsOptions = [
    { label: `1 ${t("session")}`, value: 1 },
    { label: `2 ${t("sessions")}`, value: 2 },
    { label: `3 ${t("sessions")}`, value: 3 },
  ];
  const sessionDurations = [
    { label: `30 ${t("minutes")}`, value: "30 minutes" },
    { label: `45 ${t("minutes")}`, value: "45 minutes" },
    { label: `60 ${t("minutes")}`, value: "60 minutes" },
  ];

  useEffect(() => {
    if (clerk_Id || userId) {
      getUserById(clerk_Id);
      getUserFamilyById(userId);
    }
  }, [clerk_Id, userId]);

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
    },
  });

  const numberOfSessionsValue = watch("numberOfSessions");
  const sessionDurationValue = watch("sessionDuration");

  useEffect(() => {
    if (!isForFamilyMember) {
      reset({
        familyMemberName: "",
      });
    }
  }, [isForFamilyMember]);

  const { mutate: bookSession, isPending: isSubmitting } = useMutation({
    mutationFn: async (data: any) => {
      const doctorId = specialist_Id as string;

      // Validation
      if (!selectedDateTime) {
        throw new Error(t("Please Select Date time"));
      }

      // 1. Create Booking now
      const bookingPayload = {
        userId: userId,
        doctorId: doctorId,
        selectedSlots: selectedDateTime,
        duration: data.sessionDuration,
        numberOfSessions: data.numberOfSessions,
        language: data.language,
        gender: data.gender, // Added gender field
        totalFee: baseFee * data.numberOfSessions,
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
        amount: baseFee * data.numberOfSessions,
        currency: t("SAR"),
        description: t("consultation"), // Fixed: removed undefined reference
        status: "initiated",
        bookingType: "Scheduled",
      };

      // 2. Create Payment record
      const paymentResponse = await fetch(`${ApiUrl}/api/payments/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(paymentPayload),
      });

      const paymentResult = await paymentResponse.json();
      if (!paymentResponse.ok)
        throw new Error(paymentResult?.message || "Payment creation failed.");

      const paymentId = paymentResult?.payment?.internalPaymentId;
      if (!paymentId) throw new Error("Payment ID missing.");

      // ✅ Now call processPayment to get redirectUrl
      const processResponse = await fetch(
        `${ApiUrl}/api/payments/${paymentId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const processResult = await processResponse.json();
      if (!processResponse.ok)
        throw new Error(processResult?.error || "Payment processing failed.");

      // ✅ Now you can return redirectUrl
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
        redirectUrl: processResult?.redirectUrl,
      };
    },
    onSuccess: ({ paymentId, bookingId, bookingData, redirectUrl }) => {
      toast.success("Booking created successfully!");
      if (redirectUrl) {
        const queryParams = new URLSearchParams({
          userId: bookingData.userId,
          doctorId: bookingData.doctorId,
          selectedDateTime: bookingData.selectedDateTime,
          sessionDuration: bookingData.sessionDuration.toString(),
          numberOfSessions: bookingData.numberOfSessions.toString(),
          totalFee: totalFee.toString(),
          bookingId: bookingId || "",
          redirectUrl, 
           bookingType: "schedule",
        }).toString();
        router.push(`/(stacks)/fatoorah/MyFatoorahWebView?${queryParams}`);
      } else {
        toast.error("Redirect URL not found.");
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

  const totalFee = useMemo(() => {
    const sessions = numberOfSessionsValue || 1;
    return baseFee * sessions;
  }, [baseFee, numberOfSessionsValue]);

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text>{t("Loading")}</Text>
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

  if (!isLoaded) return null;

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
          {/* Number of sessions*/}
          <View>
            <Text className="font-semibold mb-2">
              {t("Number of sessions")}
            </Text>
            <View className="flex-row gap-2">
              {numberOfSessionsOptions.map(({ label, value }) => (
                <Controller
                  key={value}
                  control={control}
                  name="numberOfSessions"
                  rules={{ required: t("numberOfSessionsRequired") }}
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
          {/* Number of duration*/}
          <View>
            <Text className="font-semibold mb-2">{t("Duration")}</Text>
            <View className="flex-row gap-2">
              {sessionDurations.map(({ label, value }) => (
                <Controller
                  key={value}
                  control={control}
                  name="sessionDuration"
                  rules={{ required: t("Duration is required") }}
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
            <Text className="font-semibold mb-2">{t("Gender")}</Text>
            <View className="flex-row gap-2">
              {["Male", "Female", "Rather not say"].map((gender) => (
                <Controller
                  key={gender}
                  control={control}
                  rules={{ required: t("genderRequired") }}
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
                        {t(gender)}
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
                                index !== userFamily?.length - 1
                                  ? "border-b border-gray-200"
                                  : ""
                              } ${
                                value === member.name
                                  ? "bg-blue-50"
                                  : "bg-white"
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
          {/* fee Calculation */}
          {numberOfSessionsValue && (
            <View className="bg-[#8A00FA] p-4 rounded-lg mb-4">
              <Text className="font-semibold text-lg mb-2 text-white">
                {t("Fee Calculation")}
              </Text>
              <Text className="text-white">
                {t("Base Fee")}: {currencyFormatter(baseFee)}
              </Text>
              <Text className="text-white">
                {t("Selected Sessions")}: {numberOfSessionsValue}
              </Text>
              <Text className="font-bold text-lg text-white">
                {t("Total")}: {currencyFormatter(totalFee)}
              </Text>
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
              {isSubmitting ? t("Submitting...") : t("Submit")}
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
        time={sessionDurationValue}
        ref={SchedulePickerRef}
      />
    </>
  );
}
