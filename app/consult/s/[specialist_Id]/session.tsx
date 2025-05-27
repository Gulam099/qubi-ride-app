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
import { Status } from "iconsax-react-native";

export default function SessionConsultPage() {
  const { user } = useUser();
  const router = useRouter();
  const { specialist_Id } = useLocalSearchParams();
  const [selectedDateTime, setSelectedDateTime] = useState("");
  const [doctorSchedule, setDoctorSchedule] = useState("");
  const SchedulePickerRef = useRef(null);

  console.log('selectedDateTime',selectedDateTime)

  const fetchSpecialistData = async () => {
    if (!specialist_Id) throw new Error("Specialist ID is missing.");
    const response = await fetch(
      `${ApiUrl}/api/doctors/doctors/${specialist_Id}`
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

  useEffect(() => {
    getUserById(clerk_Id);
  }, []);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      numberOfSessions: 1,
      sessionDuration: 30,
      personalInformation: {
        name: user?.fullName ?? "user",
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

  const { mutate: bookSession, isPending: isSubmitting } = useMutation({
    mutationFn: async (data: any) => {
      const userId = user?.publicMetadata.dbPatientId as string;
      const doctorId = specialist_Id as string;

      // 1. Create Payment first
      const paymentPayload = {
        userId: userId,
        doctorId: doctorId,
        amount: 1000,
        currency: "SAR",
        description: data.natureOfComplaint.description || "Routine checkup",
        status: "initiated",
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

      // 2. Create Booking now
      const bookingPayload = {
        userId: userId,
        doctorId: doctorId,
        date: selectedDateTime,
        duration: data.sessionDuration,
        sessionCount: data.numberOfSessions,
        complaint: data.natureOfComplaint.description || "Routine checkup",
        price: paymentId,
        paymentStatus: "pending", // Because payment not completed yet
        metadata: {
          personalInformation: data.personalInformation,
          familyComposition: data.familyComposition,
          history: data.history,
          additionalInfo: data.additionalInfo,
        },
      };

      const bookingResponse = await fetch(`${ApiUrl}/api/bookings/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingPayload),
      });

      const bookingResult = await bookingResponse.json();
      if (!bookingResponse.ok)
        throw new Error(bookingResult?.message || "Booking creation failed.");

      return {
        paymentId,
        bookingId: bookingResult?.booking?.id,
        bookingData: {
          userId,
          doctorId,
          selectedDateTime,
          sessionDuration: data.sessionDuration,
          numberOfSessions: data.numberOfSessions,
          complaint: data.natureOfComplaint.description || "Routine checkup",
        },
      };
    },
    onSuccess: ({ paymentId ,bookingId, bookingData }) => {
      toast.success("Booking created successfully!");
      if (paymentId) {
        const queryParams = new URLSearchParams({
          userId: bookingData.userId,
          doctorId: bookingData.doctorId,
          selectedDateTime: bookingData.selectedDateTime,
          sessionDuration: bookingData.sessionDuration.toString(),
          numberOfSessions: bookingData.numberOfSessions.toString(),
          complaint: bookingData.complaint,
          bookingId: bookingId || "",
        }).toString();
        router.push(`/(stacks)/paymentpage/${paymentId}?${queryParams}`);
        console.log("route", `/(stacks)/paymentpage/${paymentId}?${queryParams}`);
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

  // if (!doctorSchedule) {
  //   return (
  //     <View className="flex-1 justify-center items-center">
  //       <Text className="text-red-500">
  //         Schedule information is not available for this specialist.
  //       </Text>
  //     </View>
  //   );
  // }

  return (
    <>
      <ScrollView className="flex-1 bg-blue-50/10">
        <View className="px-4 py-8 gap-2 h-full flex-1">
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

          <Accordion type="multiple" className="mb-4">
            <AccordionItem value="personalInformation">
              <AccordionTrigger>
                <Text className="text-lg font-medium">
                  Personal Information
                </Text>
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
                <Text className="text-lg font-medium">Family Composition</Text>
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
                <Text className="text-lg font-medium">
                  The History is Healthy
                </Text>
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
                <Text className="text-lg font-medium">
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
          <SchedulePickerButton
            selectedDateTime={selectedDateTime}
            setSelectedDateTime={setSelectedDateTime}
            sheetRef={SchedulePickerRef}
          />
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
      <SchedulePickerSheet
        selectedDateTime={selectedDateTime}
        setSelectedDateTime={setSelectedDateTime}
        doctorSchedule={doctorSchedule}
        ref={SchedulePickerRef}
      />
    </>
  );
}
