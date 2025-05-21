import { View } from "react-native";
import React from "react";
import { ApiUrl } from "@/const";
import { toast } from "sonner-native";
import { Controller, useForm } from "react-hook-form";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useUser } from "@clerk/clerk-expo";
import { Switch } from "@/components/ui/Switch";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { InfoCircle } from "iconsax-react-native";
import { X } from "lucide-react-native";
import { Text } from "@/components/ui/Text";
import { Textarea } from "@/components/ui/Textarea";

const InstantBookingContent = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const contentInsets = {
    top: insets.top,
    bottom: insets.bottom,
    left: 12,
    right: 12,
  };

  const { user } = useUser();
  const userId = user?.publicMetadata.dbPatientId as string;
  // specialization options
  const specializationOptions = [
    { value: "assistant_specialist", label: "Assistant Specialist" },
    { value: "specialist", label: "Specialist" },
    { value: "first_specialist", label: "First Specialist" },
    { value: "consultant", label: "Consultant" },
    { value: "deputy_specialist_doctor", label: "Deputy Specialist Doctor" },
    {
      value: "first_deputy_specialist_doctor",
      label: "First Deputy Specialist Doctor",
    },
    { value: "consultant_doctor", label: "Consultant Doctor" },
    {
      value: "first_consultant_doctor",
      label: "First Consultant Doctor (Subspecialty)",
    },
  ];

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      sex: "",
      category: "",
      specialization: "consultant",
      language: "",
      duration: "",
      overview: "",
      closestAppointment: false,
    },
  });

  const onSubmit = async (data: any) => {
    try {
      const response = await fetch(`${ApiUrl}/api/instantbookings/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          userId: userId,

        }),
      });

      if (response.ok) {
        toast.success("Booking successful!");
        reset();
        const result = await response.json();
        console.log("Booking result:", result);
        router.push("/(stacks)/paymentpage");
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Booking failed. Please try again.");
      }
    } catch (error) {
      console.log('error',error)
      console.error("Error during booking:", error);
      toast.error("An error occurred while booking. Please try again.");
    }
  };
  return (
    <View className="relative w-full flex-1 bg-white p-4   gap-4">
      <View className="flex-1 flex-col gap-4 ">
        {/* Sex Selection */}
        <Text className="font-semibold">Sex</Text>
        <View className="flex-row gap-2">
          {["Male", "Female", "Rather not say"].map((sex) => (
            <Controller
              key={sex}
              control={control}
              rules={{ required: "Sex is required." }}
              name="sex"
              render={({ field: { onChange, value } }) => (
                <Button
                  className={`flex-1 `}
                  variant={value === sex ? "default" : "outline"}
                  onPress={() => onChange(sex)}
                >
                  <Text
                    className={value === sex ? "text-white" : "text-gray-800"}
                  >
                    {sex}
                  </Text>
                </Button>
              )}
            />
          ))}
        </View>
        {errors.sex && (
          <Text className="text-red-500 text-sm">{errors.sex.message}</Text>
        )}

        {/* Specialist Category */}
        <View className="flex-row gap-3 items-center">
          <Text className="font-semibold">Specialist Category</Text>
          <Tooltip delayDuration={150}>
            <TooltipTrigger className="rounded-full p-1">
              <InfoCircle size="20" color="#000" />
            </TooltipTrigger>
            <TooltipContent>
              <Text className="text-lg">Select a category</Text>
            </TooltipContent>
          </Tooltip>
        </View>
        <View className="flex-row flex-wrap gap-2 mb-4">
          {[
            "Psychologist",
            "Psychiatrist",
            "Developmental Psychologist",
            "Child Psychologist",
            "Marriage and Family Therapist",
          ].map((category) => (
            <Controller
              key={category}
              control={control}
              rules={{ required: "Category is required." }}
              name="category"
              render={({ field: { onChange, value } }) => (
                <Button
                  className={`flex-wrap`}
                  variant={value === category ? "default" : "outline"}
                  onPress={() => onChange(category)}
                >
                  <Text
                    className={
                      value === category ? "text-white" : "text-gray-800"
                    }
                  >
                    {category}
                  </Text>
                </Button>
              )}
            />
          ))}
        </View>
        {errors.category && (
          <Text className="text-red-500 text-sm">
            {errors.category.message}
          </Text>
        )}

        {/* Specialization */}
        <Text className="font-semibold">Specialization</Text>
        <Controller
          control={control}
          name="specialization"
          rules={{ required: "Specialization is required." }}
          render={({ field: { onChange, value } }) => {
            const selected = specializationOptions.find(
              (option) => option.value === value
            );

            return (
              <Select
                defaultValue={selected}
                onValueChange={(val) => onChange(val?.value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue
                    className="text-foreground text-sm native:text-base"
                    placeholder="Select specialization"
                  />
                </SelectTrigger>
                <SelectContent insets={contentInsets} className="w-full">
                  <SelectGroup>
                    <SelectLabel>Specialization</SelectLabel>
                    {specializationOptions.map((option) => (
                      <SelectItem
                        key={option.value}
                        value={option.value}
                        label={option.label}
                      >
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            );
          }}
        />
        {errors.specialization && (
          <Text className="text-red-500 text-sm">
            {errors.specialization.message}
          </Text>
        )}

        {/* Language Selection */}
        <Text className="font-semibold">Language</Text>
        <View className="flex-row gap-2">
          {["French", "English", "Arabic"].map((language) => (
            <Controller
              key={language}
              control={control}
              rules={{ required: "Language is required." }}
              name="language"
              render={({ field: { onChange, value } }) => (
                <Button
                  className={`flex-1 `}
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
          <Text className="text-red-500 text-sm">
            {errors.language.message}
          </Text>
        )}

        {/* Duration Selection */}
        <Text className="font-semibold">Duration</Text>
        <View className="flex-row gap-2">
          {["60 minutes", "45 minutes", "30 minutes"].map((duration) => (
            <Controller
              key={duration}
              control={control}
              rules={{ required: "Duration is required." }}
              name="duration"
              render={({ field: { onChange, value } }) => (
                <Button
                  className={`flex-1 `}
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
          <Text className="text-red-500 text-sm">
            {errors.duration.message}
          </Text>
        )}

        {/* Overview of the Consultation */}
        <Text className="font-semibold">Overview of the Consultation</Text>
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
          <Text className="text-red-500 text-sm">
            {errors.overview.message}
          </Text>
        )}

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
        <Button onPress={handleSubmit(onSubmit)} className="mb-4">
          <Text className="text-white font-semibold">Book now</Text>
        </Button>
      </View>
    </View>
  );
};

export default InstantBookingContent;
