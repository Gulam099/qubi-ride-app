import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Alert,
  ScrollView,
} from "react-native";
import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Redirect, useRouter } from "expo-router";
import { Label } from "@/components/ui/Label";
import { Switch } from "@/components/ui/Switch";
import colors from "@/utils/colors";
import { Calendar } from "iconsax-react-native";

type OptionType = {
  id: string;
  label: string;
};

const SituationOptions: OptionType[] = [
  { id: "1", label: "Anxiety disorders" },
  { id: "2", label: "Transitional phase in life" },
  { id: "3", label: "Learning difficulties" },
  { id: "4", label: "Depression" },
  { id: "5", label: "Domestic violence" },
  { id: "6", label: "Post-traumatic stress disorders (PTSD)" },
  { id: "7", label: "Panic attacks" },
  { id: "8", label: "Marital relationship" },
  { id: "9", label: "Suicidal Thoughts" },
  { id: "10", label: "Emotional emptiness" },
  { id: "11", label: "Overthinking" },
  { id: "12", label: "Bullying" },
];

const MoreFiltersOptions = [
  {
    id: "budget",
    label: "Budget",
    options: [
      "100 - 230 SR",
      "231 - 400 SR",
      "401 - 500 SR",
      "More than 501 SR",
    ],
  },
  {
    id: "type",
    label: "Consultant Type",
    options: [
      "Psychiatrist",
      "Psychologist",
      "Child psychologist",
      "Marriage and Family Therapist",
      "Developmental Psychologist",
    ],
  },
  {
    id: "language",
    label: "Session Language",
    options: ["Arabic", "English", "Not important"],
  },
  {
    id: "gender",
    label: "Consultant’s Gender",
    options: ["Male", "Female", "Not important"],
  },
  {
    id: "duration",
    label: "Session Duration",
    options: ["30 min", "45 min", "60 min"],
  },
];

export default function ConsultFilter() {
  const router = useRouter();
  const [ClosestAppointmentCheck, setClosestAppointmentCheck] = useState(false);
  const [ConsultFilterData, setConsultFilterData] = useState<{
    situation: string[];
    budget: string;
    type: string;
    language: string;
    gender: string;
    duration: string;
    ClosestAppointment: boolean;
  }>({
    situation: [],
    budget: "",
    type: "",
    language: "",
    gender: "",
    duration: "",
    ClosestAppointment: ClosestAppointmentCheck,
  });

  const [tempFilterData, setTempFilterData] = useState(ConsultFilterData);
  const [validationError, setValidationError] = useState<string>("");
  const [step, setStep] = useState<number>(1); // Step 1: Situation, Step 2: More Filters

  // Toggle situation options
  const toggleSituationOption = (id: string) => {
    setTempFilterData((prev) => ({
      ...prev,
      situation: prev.situation.includes(id)
        ? prev.situation.filter((item) => item !== id)
        : [...prev.situation, id],
    }));
  };

  // Update filter fields
  const updateFilterField = (
    field: keyof typeof ConsultFilterData,
    value: string
  ) => {
    setTempFilterData((prev) => ({
      ...prev,
      [field]: prev[field] === value ? "" : value,
    }));
  };

  // Validation function for the current step
  const validateFields = () => {
    if (step === 1 && tempFilterData.situation.length === 0) {
      return "Please select at least one situation.";
    }

    if (step === 2) {
      if (!tempFilterData.budget) return "Please select a budget.";
      if (!tempFilterData.type) return "Please select a consultant type.";
      if (!tempFilterData.language) return "Please select a session language.";
      if (!tempFilterData.gender) return "Please select a consultant's gender.";
      if (!tempFilterData.duration) return "Please select a session duration.";
    }

    return "";
  };

  // Submit handler
  const handleNext = () => {
    const error = validateFields();
    if (error) {
      setValidationError(error);
      return;
    }
    setValidationError("");
    if (step === 1) {
      setStep(2); // Move to the next screen
    } else {
      setConsultFilterData(tempFilterData);
      console.log("Final Filter Data:", tempFilterData);
      //Api call Here
      router.push({
        pathname: "/p/account/consult/custom",
        params: {
          ...tempFilterData,
          ClosestAppointment: ClosestAppointmentCheck ? "true" : "false",
        },
      });
    }
  };

  const isSelectedSituation = (id: string) =>
    tempFilterData.situation.includes(id);
  const isSelectedFilter = (
    field: keyof typeof ConsultFilterData,
    value: string
  ) => tempFilterData[field] === value;

  return (
    <View className="flex-1 bg-blue-50/10 p-4">
      {/* Validation Error */}
      {validationError ? (
        <Text className="text-red-500 mb-4 text-center">{validationError}</Text>
      ) : null}

      {/* First Step: Situation Selection */}
      {step === 1 && (
        <View>
          <Text className="font-bold text-lg mb-1 text-black">
            Choose what suits your situation
          </Text>
          <Text className="text-gray-600 mb-4">
            You can choose more than one case
          </Text>

          <FlatList
            data={SituationOptions}
            keyExtractor={(item) => item.id}
            numColumns={3}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => toggleSituationOption(item.label)}
                className={`flex-1 m-1 p-4 aspect-square justify-center items-center rounded-lg border ${
                  isSelectedSituation(item.label)
                    ? "border-blue-700 bg-blue-50/10"
                    : "border-gray-200 bg-white"
                }`}
              >
                <Text
                  className={`text-center font-medium ${
                    isSelectedSituation(item.label)
                      ? "text-blue-700"
                      : "text-gray-400"
                  }`}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            )}
          />

          <Button onPress={handleNext}>
            <Text className="text-white text-center font-semibold">Next</Text>
          </Button>
        </View>
      )}

      {/* Second Step: More Filters */}
      {step === 2 && (
        <ScrollView className="flex flex-col gap-4">
          {MoreFiltersOptions.map((filter) => (
            <View key={filter.id} className="mb-6">
              <Text className="text-gray-700 mb-2 font-medium">
                {filter.label}
              </Text>
              <View className="flex-row flex-wrap">
                {filter.options.map((option) => (
                  <TouchableOpacity
                    key={option}
                    onPress={() =>
                      updateFilterField(
                        filter.id as keyof typeof ConsultFilterData,
                        option
                      )
                    }
                    className={` m-1 px-4 py-2 rounded-lg border ${
                      isSelectedFilter(
                        filter.id as keyof typeof ConsultFilterData,
                        option
                      )
                        ? "border-blue-700 bg-blue-50/10"
                        : "border-gray-200 bg-white"
                    }`}
                  >
                    <Text
                      className={`font-medium ${
                        isSelectedFilter(
                          filter.id as keyof typeof ConsultFilterData,
                          option
                        )
                          ? "text-blue-700"
                          : "text-gray-600"
                      }`}
                    >
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}

          <View className="flex-row items-center gap-2 w-full justify-between p-4 mb-4 bg-background rounded-xl">
            <View className="flex-row justify-center items-center gap-2">
              <View className="p-1 bg-blue-50/20 aspect-square rounded-full w-8  flex justify-center items-center">
                <Calendar size="18" color={colors.primary[900]} />
              </View>
              <Text className="text-sm font-medium">Closest Appointment</Text>
            </View>
            <Switch
              checked={ClosestAppointmentCheck}
              onCheckedChange={setClosestAppointmentCheck}
              nativeID="ClosestAppointmentCheck"
            />
          </View>

          <Button onPress={handleNext}>
            <Text className="text-white text-center font-semibold">Submit</Text>
          </Button>
        </ScrollView>
      )}
    </View>
  );
}
