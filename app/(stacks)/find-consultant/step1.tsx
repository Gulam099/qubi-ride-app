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
import { ApiUrl, apiNewUrl } from "@/const";
import { toast } from "sonner-native";
import { useUser } from "@clerk/clerk-expo";
import { useTranslation } from "react-i18next";
import { router } from "expo-router";

export default function SessionConsultPage() {
  const { user, isLoaded } = useUser();
  const { t } = useTranslation();

  const sessionDurations = [
    { label: `30 ${t("minutes")}`, value: "30 minutes" },
    { label: `45 ${t("minutes")}`, value: "45 minutes" },
    { label: `60 ${t("minutes")}`, value: "60 minutes" },
  ];

 const budgetOptions = [
  { label: t("100 - 230 SR"), value: "100-230 SR" },
  { label: t("231 - 400 SR"), value: "231-400 SR" },
  { label: t("401 - 500 SR"), value: "401-500 SR" },
  { label: t("More than 501 SR"), value: "More than 501 SR" },
]

  const consultantTypes = [
  { label: t("Psychiatrist"), value: "Psychiatrist" },
  { label: t("Psychologist"), value: "Psychologist" },
  { label: t("Clinical Psychology"), value: "Clinical Psychology" },
  { label: t("Marriage and Family therapist"), value: "Marriage and Family therapist" },
  { label: t("Developmental Psychologist"), value: "Developmental Psychologist" },
];

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      budget: "",
      consultantType: "",
      language: "",
      numberOfSessions: "",
      sessionDuration: "",
      gender: "",
      familyMemberName: "",
    },
  });

  // Watch all form values
  const formValues = watch();

  const handleNext = () => {
    // Validate required fields
    const requiredFields = ['budget', 'consultantType', 'language', 'sessionDuration', 'gender'];
    const missingFields = requiredFields.filter(field => !formValues[field]);
    
    if (missingFields.length > 0) {
      toast.error(t("Please fill all required fields"));
      return;
    }

    // Create query parameters from form data
    const queryParams = new URLSearchParams({
      budget: formValues.budget,
      consultantType: formValues.consultantType,
      language: formValues.language,
      sessionDuration: formValues.sessionDuration,
      gender: formValues.gender,
    }).toString();

    // Navigate with query parameters
    router.push(`/(stacks)/find-consultant/step2?${queryParams}`);
  };

  if (!isLoaded) return null;

  return (
    <>
      <View className="relative w-full flex-1 bg-blue-50/20">
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 16, gap: 16 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Budget */}
          <View>
            <Text className="font-semibold mb-2">{t("Budget")}</Text>
            <View className="flex-row flex-wrap gap-2">
              {budgetOptions.map(({ label, value }) => (
                <Controller
                  key={value}
                  control={control}
                  rules={{ required: t("budgetRequired") }}
                  name="budget"
                  render={({ field: { onChange, value: selectedValue } }) => (
                    <Button
                      className="flex-1 min-w-[45%]"
                      variant={selectedValue === value ? "default" : "outline"}
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
            {errors.budget && (
              <Text className="text-red-500 text-sm mt-1">
                {errors.budget.message}
              </Text>
            )}
          </View>

          {/* Consultant Type */}
          <View>
            <Text className="font-semibold mb-2">{t("Consultant type")}</Text>
            <View className="flex-row flex-wrap gap-2">
              {consultantTypes.map(({ label, value }) => (
                <Controller
                  key={value}
                  control={control}
                  rules={{ required: t("consultantTypeRequired") }}
                  name="consultantType"
                  render={({ field: { onChange, value: selectedValue } }) => (
                    <Button
                      className="flex-1 min-w-[45%]"
                      variant={selectedValue === value ? "default" : "outline"}
                      onPress={() => onChange(value)}
                    >
                      <Text
                        className={
                          selectedValue === value ? "text-white" : "text-gray-800"
                        }
                      >
                        {t(label)}
                      </Text>
                    </Button>
                  )}
                />
              ))}
            </View>
            {errors.consultantType && (
              <Text className="text-red-500 text-sm mt-1">
                {errors.consultantType.message}
              </Text>
            )}
          </View>

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

          {/* Duration */}
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

          {/* Gender Selection */}
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

          <Button
           className="mt-4 mb-4"
           onPress={handleNext}
          >
            <Text className="text-white font-medium">
              {t("Next")}
            </Text>
          </Button>
        </ScrollView>
      </View>
    </>
  );
}