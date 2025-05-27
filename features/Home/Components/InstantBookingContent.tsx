import { View, ScrollView } from "react-native";
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
import { useMutation } from "@tanstack/react-query";

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

  const { mutate: bookInstantSession, isPending: isSubmitting } = useMutation({
    mutationFn: async (data: any) => {
      // 1. Create Payment first
      const paymentPayload = {
        userId: userId,
        amount: 1000, 
        currency: "SAR",
        description: data.overview || "Instant consultation booking",
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

      console.log('paymentId', paymentId);

      // 2. Create Instant Booking with payment reference
      const instantBookingPayload = {
        ...data,
        userId: userId,
        paymentId: paymentId,
        paymentStatus: "pending", // Because payment not completed yet
      };

      const bookingResponse = await fetch(`${ApiUrl}/api/instantbookings/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(instantBookingPayload),
      });

      const bookingResult = await bookingResponse.json();
      if (!bookingResponse.ok)
        throw new Error(bookingResult?.message || "Instant booking creation failed.");

      return { paymentId, bookingResult };
    },
    onSuccess: ({ paymentId, bookingResult }) => {
      toast.success("Instant booking created successfully!");
      reset();
      console.log("Booking result:", bookingResult);
      
      if (paymentId) {
        router.push(`/(stacks)/paymentpage/${paymentId}`);
        console.log('route', `/(stacks)/paymentpage/${paymentId}`);
      } else {
        toast.error("Payment ID not found.");
      }
    },
    onError: (err: any) => {
      toast.error(err.message || "Something went wrong. Please try again.");
      console.log("Error booking instant session:", err);
    },
  });

  const onSubmit = (data: any) => {
    bookInstantSession(data);
  };

  return (
    <View className="relative w-full flex-1 bg-white">
      <ScrollView 
        className="flex-1" 
        contentContainerStyle={{ padding: 16, gap: 16 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Sex Selection */}
        <View>
          <Text className="font-semibold mb-2">Sex</Text>
          <View className="flex-row gap-2">
            {["Male", "Female", "Rather not say"].map((sex) => (
              <Controller
                key={sex}
                control={control}
                rules={{ required: "Sex is required." }}
                name="sex"
                render={({ field: { onChange, value } }) => (
                  <Button
                    className="flex-1"
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
            <Text className="text-red-500 text-sm mt-1">{errors.sex.message}</Text>
          )}
        </View>

        {/* Specialist Category */}
        <View>
          <View className="flex-row gap-3 items-center mb-2">
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
          <View className="flex-row flex-wrap gap-2">
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
                    className="flex-wrap"
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
            <Text className="text-red-500 text-sm mt-1">
              {errors.category.message}
            </Text>
          )}
        </View>

        {/* Specialization - Using Button-based approach as fallback */}
        <View>
          <Text className="font-semibold mb-2">Specialization</Text>
          <View className="flex-row flex-wrap gap-2">
            {specializationOptions.map((option) => (
              <Controller
                key={option.value}
                control={control}
                rules={{ required: "Specialization is required." }}
                name="specialization"
                render={({ field: { onChange, value } }) => (
                  <Button
                    className="flex-wrap"
                    variant={value === option.value ? "default" : "outline"}
                    onPress={() => onChange(option.value)}
                  >
                    <Text
                      className={
                        value === option.value ? "text-white" : "text-gray-800"
                      }
                      style={{ fontSize: 12 }}
                    >
                      {option.label}
                    </Text>
                  </Button>
                )}
              />
            ))}
          </View>
          {errors.specialization && (
            <Text className="text-red-500 text-sm mt-1">
              {errors.specialization.message}
            </Text>
          )}
        </View>

        {/* Language Selection */}
        <View>
          <Text className="font-semibold mb-2">Language</Text>
          <View className="flex-row gap-2">
            {["French", "English", "Arabic"].map((language) => (
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

        {/* Duration Selection */}
        <View>
          <Text className="font-semibold mb-2">Duration</Text>
          <View className="flex-row gap-2">
            {["60 minutes", "45 minutes", "30 minutes"].map((duration) => (
              <Controller
                key={duration}
                control={control}
                rules={{ required: "Duration is required." }}
                name="duration"
                render={({ field: { onChange, value } }) => (
                  <Button
                    className="flex-1"
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
            <Text className="text-red-500 text-sm mt-1">
              {errors.duration.message}
            </Text>
          )}
        </View>

        {/* Overview of the Consultation */}
        <View>
          <Text className="font-semibold mb-2">Overview of the Consultation</Text>
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
            <Text className="text-red-500 text-sm mt-1">
              {errors.overview.message}
            </Text>
          )}
        </View>

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
        <Button 
          onPress={handleSubmit(onSubmit)} 
          disabled={isSubmitting}
          className="mb-4"
        >
          <Text className="text-white font-semibold">
            {isSubmitting ? "Processing..." : "Book now"}
          </Text>
        </Button>
      </ScrollView>
    </View>
  );
};

export default InstantBookingContent;