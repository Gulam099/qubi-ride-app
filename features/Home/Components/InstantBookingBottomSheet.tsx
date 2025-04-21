import { TouchableOpacity, View } from "react-native";
import React, { useCallback, useMemo, useRef } from "react";

import { Button } from "@/components/ui/Button";
import { useRouter } from "expo-router";
import { InfoCircle } from "iconsax-react-native";
import { Text } from "@/components/ui/Text";
import { Controller, useForm } from "react-hook-form";
import { Switch } from "@/components/ui/Switch";
import { Input } from "@/components/ui/Input";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { apiNewUrl } from "@/const";
import { toast } from "sonner-native";
import BottomSheet, {
  BottomSheetScrollView,
  BottomSheetTextInput,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { X } from "lucide-react-native";
import { useUser } from "@clerk/clerk-expo";

export function InstantBookingBottomSheet({
  refProp,
}: {
  refProp: React.RefObject<BottomSheet>;
}) {
  const router = useRouter();

  const { user } = useUser();
  const userId = user?.publicMetadata.dbPatientId as string;

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      sex: "",
      category: "",
      specialization: "",
      language: "",
      duration: "",
      overview: "",
      closestAppointment: false,
    },
  });

  const onSubmit = async (data: any) => {
    try {
      const response = await fetch(`${apiNewUrl}/booking/instant`, {
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

        router.push("/(stacks)/payment/1234");
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Booking failed. Please try again.");
      }
    } catch (error) {
      console.error("Error during booking:", error);
      toast.error("An error occurred while booking. Please try again.");
    }
  };

  // variables
  const snapPoints = useMemo(() => ["50%", "85%"], []);

  return (
    <BottomSheet
      ref={refProp}
      index={-1} // Start fully hidden
      snapPoints={snapPoints}
      keyboardBehavior="fillParent"
      enableDynamicSizing={false}
    >
      <View className="relative flex-1 px-2 pb-0">
        <Button
          size={"icon"}
          variant={"ghost"}
          className=" rounded-full p-0 text-neutral-800  self-end"
          onPress={() => refProp.current?.close()}
        >
          <X size={20} color={"#262626"} />
        </Button>
        <BottomSheetView className="w-full flex-1 bg-white p-2 pb-12 gap-4">
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
                      className={`flex-1 ${
                        value === sex ? "bg-blue-500" : "bg-gray-200"
                      }`}
                      onPress={() => onChange(sex)}
                    >
                      <Text
                        className={
                          value === sex ? "text-white" : "text-gray-800"
                        }
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
                      className={`flex-none px-4 py-2 rounded-lg ${
                        value === category ? "bg-blue-500" : "bg-gray-200"
                      }`}
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
              render={({ field: { onChange, value } }) => (
                <BottomSheetTextInput
                  placeholder="Write the specific specialization"
                  value={value}
                  onChangeText={onChange}
                />
              )}
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
                      className={`flex-1 ${
                        value === language ? "bg-blue-500" : "bg-gray-200"
                      }`}
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
                      className={`flex-1 ${
                        value === duration ? "bg-blue-500" : "bg-gray-200"
                      }`}
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
                <BottomSheetTextInput
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
            <Button onPress={handleSubmit(onSubmit)} className="mb-16">
              <Text className="text-white font-semibold">Book now</Text>
            </Button>
          </View>
        </BottomSheetView>
      </View>
    </BottomSheet>
  );
}

export function InstantBookingBottomSheetTrigger({
  children,
  refProp,
}: {
  children: React.ReactNode;
  refProp: React.RefObject<BottomSheet>;
}) {
  return (
    <TouchableOpacity onPress={() => refProp.current?.expand()}>
      {children}
    </TouchableOpacity>
  );
}
