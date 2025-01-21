import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import React, { useState } from "react";
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
import { Textarea } from "@/components/ui/Textarea";
import { useSelector } from "react-redux";
import { UserType } from "@/features/user/types/user.type";
import { useLocalSearchParams, useRouter } from "expo-router";

export default function SessionConsultPage() {
  const user: UserType = useSelector((state: any) => state.user);
  const router = useRouter();
  const { specialist_Id } = useLocalSearchParams();
  // Mock data for available times, session durations, and number of sessions
  const availableTimes = [
    "2025-1-26T11:00:00Z",
    "2025-1-26T13:00:00Z",
    "2025-1-26T15:00:00Z",
    "2025-1-27T09:00:00Z",
    "2025-1-27T12:00:00Z",
    "2025-1-27T16:00:00Z",
    "2025-1-28T10:00:00Z",
    "2025-1-28T14:00:00Z",
  ];
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
        name: "",
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

  const [selectedDateTime, setSelectedDateTime] = useState("");

  const onSubmit = (data: any) => {
    if (!selectedDateTime) {
      alert("Please select a date and time.");
      return;
    }

    const payload = {
      ...data,
      availableDate: selectedDateTime,
      userId: user._id,
      specialistId: specialist_Id,
      phoneNumber: user.phoneNumber,
    };

    console.log("Submitting data:", payload);

    // Mock API submission
    setTimeout(() => {
      alert("Appointment booked successfully!");
    }, 1000);
  };

  return (
    <ScrollView className="flex-1 bg-blue-50/10 p-4">
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
        <Text className="text-red-500">{errors.numberOfSessions.message}</Text>
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
            {errors.personalInformation?.name && (
              <Text className="text-red-500">
                {errors.personalInformation.name.message}
              </Text>
            )}

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
            {errors.personalInformation?.age && (
              <Text className="text-red-500">
                {errors.personalInformation.age.message}
              </Text>
            )}
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
            {errors.familyComposition?.members && (
              <Text className="text-red-500">
                {errors.familyComposition.members.message}
              </Text>
            )}
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
            {errors.history?.healthConditions && (
              <Text className="text-red-500">
                {errors.history.healthConditions.message}
              </Text>
            )}
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
            {errors.natureOfComplaint?.description && (
              <Text className="text-red-500">
                {errors.natureOfComplaint.description.message}
              </Text>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <Text className="text-lg font-bold mb-4">
        Other information you would like to mention
      </Text>
      <Controller
        control={control}
        name="additionalInfo"
        render={({ field: { onChange, value } }) => (
          <Textarea
            placeholder="Write a brief about your situation"
            value={value}
            onChangeText={onChange}
            aria-labelledby="textareaLabel"
          />
        )}
      />

      <ScheduleSelector
        selectedDateTime={selectedDateTime}
        setSelectedDateTime={setSelectedDateTime}
        availableTimes={availableTimes}
        CalenderHeading={"Available Dates"}
        TimeSliderHeading={"Available Times"}
      />
      {!selectedDateTime && (
        <Text className="text-red-500">Please select a date and time.</Text>
      )}

      <Button onPress={handleSubmit(onSubmit)} className="mt-4">
        <Text className="text-white font-medium">Submit</Text>
      </Button>
    </ScrollView>
  );
}
