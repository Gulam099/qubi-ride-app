import { View, Text, ScrollView } from "react-native";
import React, { useMemo, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/Accordion";
import ScheduleSelector from "@/features/Home/Components/ScheduleSelector";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ApiUrl, apiNewUrl } from "@/const";
import { toast } from "sonner-native";
import { useUser } from "@clerk/clerk-expo";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";

export default function SessionConsultPage() {
  const { user } = useUser();
  const router = useRouter();
  const { specialist_Id } = useLocalSearchParams();
  const [selectedDateTime, setSelectedDateTime] = useState("");

  const fetchSpecialistData = async () => {
    if (!specialist_Id) throw new Error("Specialist ID is missing.");

    const response = await fetch(`${ApiUrl}/api/doctor/get-doctor/${specialist_Id}`);
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

  const availableTimes = useMemo(() => {
    const scheduleMeta = specialistData?.user?.unsafeMetadata?.schedules || {};
    const holidays = specialistData?.user?.unsafeMetadata?.holidays || {};
    const slots: string[] = [];

    Object.entries(scheduleMeta).forEach(([date, { startTime, endTime }]: any) => {
      if (holidays[date]?.isHoliday) return;

      const start = dayjs(`${date}T${startTime}`);
      const end = dayjs(`${date}T${endTime}`);

      let current = start;
      while (current.isBefore(end)) {
        slots.push(current.toISOString());
        current = current.add(30, "minute");
      }
    });

    return slots;
  }, [specialistData]);

  const onSubmit = async (data: any) => {
    if (!selectedDateTime) {
      alert("Please select a date and time.");
      return;
    }

    const payload = {
      ...data,
      availableDate: selectedDateTime,
      userId: user?.publicMetadata.dbPatientId as string,
      specialistId: specialist_Id,
      phoneNumber: user?.phoneNumbers[0]?.phoneNumber,
    };

    try {
      const response = await fetch(`${apiNewUrl}/booking/session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (result.success) {
        toast.success("Appointment booked successfully!");
        router.push("/(stacks)/payment/1234");
      } else {
        throw new Error(result.message || "Booking failed.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error submitting booking. Please try again.");
    }
  };

  if (isLoading) {
    return <View className="flex-1 justify-center items-center"><Text>Loading...</Text></View>;
  }

  if (error || !specialistData) {
    return <View className="flex-1 justify-center items-center"><Text className="text-red-500">{error?.message || "Specialist not found."}</Text></View>;
  }

  return (
    <ScrollView className="flex-1 bg-blue-50/10">
      <View className="px-4 py-8 gap-2">
        {/* Sessions Selection */}
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
                  className={`flex-1 ${selectedValue === value ? "bg-blue-500" : "bg-gray-200"}`}
                  onPress={() => onChange(value)}
                >
                  <Text className={selectedValue === value ? "text-white" : "text-gray-800"}>
                    {label}
                  </Text>
                </Button>
              )}
            />
          ))}
        </View>
        {errors.numberOfSessions && <Text className="text-red-500">{errors.numberOfSessions.message}</Text>}

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
                  className={`flex-1 ${selectedValue === value ? "bg-blue-500" : "bg-gray-200"}`}
                  onPress={() => onChange(value)}
                >
                  <Text className={selectedValue === value ? "text-white" : "text-gray-800"}>
                    {label}
                  </Text>
                </Button>
              )}
            />
          ))}
        </View>
        {errors.sessionDuration && <Text className="text-red-500">{errors.sessionDuration.message}</Text>}

        {/* Accordion Sections */}
        <Accordion type="multiple" className="mb-4">
          {/* Personal Info */}
          <AccordionItem value="personalInformation">
            <AccordionTrigger><Text className="text-lg font-bold">Personal Information</Text></AccordionTrigger>
            <AccordionContent>
              <Controller
                control={control}
                name="personalInformation.name"
                rules={{ required: "Name is required" }}
                render={({ field: { onChange, value } }) => (
                  <Input className="mb-4" placeholder="Name" value={value} onChangeText={onChange} />
                )}
              />
              <Controller
                control={control}
                name="personalInformation.age"
                rules={{ required: "Age is required" }}
                render={({ field: { onChange, value } }) => (
                  <Input className="mb-4" placeholder="Age" keyboardType="numeric" value={value} onChangeText={onChange} />
                )}
              />
            </AccordionContent>
          </AccordionItem>

          {/* Family Composition */}
          <AccordionItem value="familyComposition">
            <AccordionTrigger><Text className="text-lg font-bold">Family Composition</Text></AccordionTrigger>
            <AccordionContent>
              <Controller
                control={control}
                name="familyComposition.members"
                rules={{ required: "Number of family members is required" }}
                render={({ field: { onChange, value } }) => (
                  <Input className="mb-4" placeholder="Number of family members" value={value} onChangeText={onChange} />
                )}
              />
            </AccordionContent>
          </AccordionItem>

          {/* History */}
          <AccordionItem value="history">
            <AccordionTrigger><Text className="text-lg font-bold">The History is Healthy</Text></AccordionTrigger>
            <AccordionContent>
              <Controller
                control={control}
                name="history.healthConditions"
                rules={{ required: "Health conditions are required" }}
                render={({ field: { onChange, value } }) => (
                  <Input className="mb-4" placeholder="Health conditions" value={value} onChangeText={onChange} />
                )}
              />
            </AccordionContent>
          </AccordionItem>

          {/* Complaint */}
          <AccordionItem value="natureOfComplaint">
            <AccordionTrigger><Text className="text-lg font-bold">The Nature of the Complaint</Text></AccordionTrigger>
            <AccordionContent>
              <Controller
                control={control}
                name="natureOfComplaint.description"
                rules={{ required: "Complaint description is required" }}
                render={({ field: { onChange, value } }) => (
                  <Input className="mb-4" placeholder="Complaint description" value={value} onChangeText={onChange} />
                )}
              />
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* 🗓 Schedule Selector */}
        <ScheduleSelector
          selectedDateTime={selectedDateTime}
          setSelectedDateTime={setSelectedDateTime}
          availableTimes={availableTimes}
          CalenderHeading="Available Dates"
          TimeSliderHeading="Available Times"
        />
        {!selectedDateTime && <Text className="text-red-500">Please select a date and time.</Text>}

        <Button onPress={handleSubmit(onSubmit)} className="mt-4">
          <Text className="text-white font-medium">Submit</Text>
        </Button>
      </View>
    </ScrollView>
  );
}
