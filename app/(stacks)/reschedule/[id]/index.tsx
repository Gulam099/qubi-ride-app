import { View, Text, ScrollView, Pressable, Platform } from "react-native";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ApiUrl, apiNewUrl } from "@/const";
import { toast } from "sonner-native";
import { useUser } from "@clerk/clerk-expo";
import { useMutation, useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { apiBaseUrl } from "@/features/Home/constHome";
import {
    SchedulePickerButton,
    SchedulePickerSheet,
} from "@/features/Home/Components/SchedulePicker";
import { InfoCircle, Status } from "iconsax-react-native";
import { currencyFormatter } from "@/utils/currencyFormatter.utils";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "expo-router/build/hooks";

export default function RescheduleAppointment() {
    const { user, isLoaded } = useUser();
    const router = useRouter();
    const userId = user?.publicMetadata.dbPatientId as string;
    const { id } = useLocalSearchParams();
    const [selectedDateTime, setSelectedDateTime] = useState("");
    const [doctorSchedule, setDoctorSchedule] = useState("");
    const [appointmentData, setAppointmentData] = useState(null);
    const { t } = useTranslation();

    const SchedulePickerRef = useRef(null);

    // Fetch appointment details
    const fetchAppointmentData = async () => {
        console.log("thiss runs");
        if (!id) throw new Error("Appointment ID is missing.");
        const response = await fetch(`${ApiUrl}/api/bookings/booking/${id}`);
        console.log("response", response)
        if (!response.ok) throw new Error("Failed to fetch appointment data");
        const result = await response.json();
        console.log("result", result)
        return result.booking;
    };

    const {
        data: appointmentDetails,
        isLoading: appointmentLoading,
        isError: appointmentError,
        error: appointmentErrorMsg,
    } = useQuery({
        queryKey: ["appointment", id],
        queryFn: fetchAppointmentData,
        enabled: !!id,
    });

    console.log("appointmentDetails>>", appointmentDetails)

    // Fetch specialist data using doctorId from appointment
    const fetchSpecialistData = async () => {
        if (!appointmentDetails?.doctorId) throw new Error("Doctor ID is missing.");
        const response = await fetch(
            `${ApiUrl}/api/doctors/doctor/${appointmentDetails.doctorId}`
        );
        if (!response.ok) throw new Error("Failed to fetch specialist data");
        const result = await response.json();
        console.log("result>>", result)
        return result;
    };

    const {
        data: specialistData,
        isLoading: specialistLoading,
        isError: specialistError,
        error: specialistErrorMsg,
    } = useQuery({
        queryKey: ["doctor", appointmentDetails?.doctorId],
        queryFn: fetchSpecialistData,
        enabled: !!appointmentDetails?.doctorId,
    });

    const clerk_Id = specialistData?.data?.clerkId;
    console.log("specialistData>>>", specialistData)

    const getUserById = async (clerk_Id) => {
        try {
            const response = await fetch(`${ApiUrl}/user/${clerk_Id}`);
            const data = await response.json();
            setDoctorSchedule(data);
        } catch (error) {
            console.error("Failed to fetch user:", error);
        }
    };

    useEffect(() => {
        if (clerk_Id) {
            getUserById(clerk_Id);
        }
    }, [clerk_Id]);

    useEffect(() => {
        if (appointmentDetails) {
            const appointment = appointmentDetails;
            setAppointmentData(appointment);

            // Pre-populate current appointment time
            if (appointment.selectedSlots && appointment.selectedSlots.length > 0) {
                setSelectedDateTime(JSON.stringify(appointment.selectedSlots));
            }
        }
    }, [appointmentDetails]);

    const {
        control,
        handleSubmit,
        watch,
        reset,
        formState: { errors },
    } = useForm({
        defaultValues: {
            language: appointmentData?.language || "",
            numberOfSessions: appointmentData?.numberOfSessions || "",
            sessionDuration: appointmentData?.duration || "",
            gender: appointmentData?.gender || "",
            familyMemberName: appointmentData?.familyMemberDetails?.name || "",
        },
    });

    // Update form when appointment data loads
    useEffect(() => {
        if (appointmentData) {
            reset({
                language: appointmentData.language || "",
                numberOfSessions: appointmentData.numberOfSessions || "",
                sessionDuration: appointmentData.duration || "",
                gender: appointmentData.gender || "",
                familyMemberName: appointmentData.familyMemberDetails?.name || "",
            });
        }
    }, [appointmentData, reset]);

    const numberOfSessionsValue = watch("numberOfSessions");
    const sessionDurationValue = watch("sessionDuration");

    const { mutate: rescheduleAppointment, isPending: isSubmitting } = useMutation({
        mutationFn: async (data: any) => {
            // Validation
            if (!selectedDateTime) {
                throw new Error(t("Please Select Date time"));
            }

            if (!appointmentData) {
                throw new Error("Appointment data not found");
            }

            // Reschedule payload
            const reschedulePayload = {
                appointmentId: appointmentData._id,
                newSelectedSlots: selectedDateTime,
                userId: userId,
                doctorId: appointmentData.doctorId,
            };
            console.log("reschedulePayload>>>>", reschedulePayload);
            const response = await fetch(`${ApiUrl}/api/bookings/reschedule`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(reschedulePayload),
            });

            const result = await response.json();
            if (!response.ok)
                throw new Error(result?.message || "Reschedule failed.");

            return result;
        },
        onSuccess: (result) => {
            toast.success("Appointment rescheduled successfully!");
            router.back(); // Go back to appointments list
        },
        onError: (err: any) => {
            toast.error(err.message || "Failed to reschedule appointment.");
            console.log("Error rescheduling appointment:", err);
        },
    });

    const onSubmit = (data: any) => {
        console.log("Reschedule data:", data);
        console.log("Selected DateTime:", selectedDateTime);
        rescheduleAppointment(data);
    };

    const totalFee = useMemo(() => {
        return appointmentData?.totalFee || 0;
    }, [appointmentData]);

    const isLoading = appointmentLoading || specialistLoading;
    const hasError = appointmentError || specialistError;
    const errorMessage = appointmentErrorMsg?.message || specialistErrorMsg?.message;

    if (isLoading) {
        return (
            <View className="flex-1 justify-center items-center bg-white">
                <Text className="text-lg">{t("Loading appointment details...")}</Text>
            </View>
        );
    }

    if (hasError || !appointmentDetails || !specialistData) {
        return (
            <View className="flex-1 justify-center items-center bg-white p-4">
                <Text className="text-red-500 text-center text-lg mb-4">
                    {errorMessage || "Failed to load appointment details."}
                </Text>
                <Button onPress={() => router.back()}>
                    <Text className="text-white">{t("Go Back")}</Text>
                </Button>
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
                    <View className="bg-yellow-50 p-3 rounded-lg border border-yellow-200 mt-4">
                        <Text className="text-yellow-800 text-sm text-center">
                            {t("Note: You can reschedule the session before 24 hours from the session start time. Please ensure the new time works for you.")}
                        </Text>
                    </View>
                    {/* Header with current appointment info */}
                    <View className="bg-slate-300 p-4 rounded-lg mb-4">
                        <Text className="text-xl font-bold text-[#000F8F] mb-2">
                            {t("Reschedule Appointment")}
                        </Text>
                        <Text className="text-gray-600 mb-1">
                            {t("Current Time")}: {appointmentData?.selectedSlots?.[0] ?
                                new Date(appointmentData.selectedSlots[0]).toLocaleString() :
                                t("Not specified")}
                        </Text>
                        <Text className="text-gray-600 mb-1">
                            {t("Doctor")}: {specialistData?.data?.name || t("Not available")}
                        </Text>
                        <Text className="text-gray-600">
                            {t("Status")}: {appointmentData?.status || t("Unknown")}
                        </Text>
                    </View>

                    {/* Language Selection - DISABLED */}
                    <View className="opacity-50">
                        <Text className="font-semibold mb-2">{t("Language")} - {t("Current Selection")}</Text>
                        <View className="bg-gray-100 p-3 rounded-lg">
                            <Text className="text-gray-700 font-medium">
                                {appointmentData?.language || t("Not specified")}
                            </Text>
                        </View>
                    </View>

                    {/* Number of sessions - DISABLED */}
                    <View className="opacity-50">
                        <Text className="font-semibold mb-2">
                            {t("Number of sessions")} - {t("Current Selection")}
                        </Text>
                        <View className="bg-gray-100 p-3 rounded-lg">
                            <Text className="text-gray-700 font-medium">
                                {appointmentData?.numberOfSessions || 1} {t("session(s)")}
                            </Text>
                        </View>
                    </View>

                    {/* Duration - DISABLED */}
                    <View className="opacity-50">
                        <Text className="font-semibold mb-2">{t("Duration")} - {t("Current Selection")}</Text>
                        <View className="bg-gray-100 p-3 rounded-lg">
                            <Text className="text-gray-700 font-medium">
                                {appointmentData?.duration || t("Not specified")}
                            </Text>
                        </View>
                    </View>

                    {/* Gender - DISABLED */}
                    <View className="opacity-50">
                        <Text className="font-semibold mb-2">{t("Gender")} - {t("Current Selection")}</Text>
                        <View className="bg-gray-100 p-3 rounded-lg">
                            <Text className="text-gray-700 font-medium">
                                {appointmentData?.gender || t("Not specified")}
                            </Text>
                        </View>
                    </View>

                    {/* Family Member Info - DISABLED (if applicable) */}
                    {appointmentData?.isForFamilyMember && (
                        <View className="opacity-50">
                            <Text className="font-semibold mb-2">
                                {t("Family Member")} - {t("Current Selection")}
                            </Text>
                            <View className="bg-gray-100 p-3 rounded-lg">
                                <Text className="text-gray-700 font-medium">
                                    {appointmentData?.familyMemberDetails?.name || t("Not specified")}
                                </Text>
                            </View>
                        </View>
                    )}

                    {/* Fee Display - READ ONLY */}
                    <View className="bg-[#8A00FA] p-4 rounded-lg mb-4">
                        <Text className="font-semibold text-lg mb-2 text-white">
                            {t("Fee Information")}
                        </Text>
                        <Text className="text-white">
                            {t("Total Fee")}: {currencyFormatter(totalFee)}
                        </Text>
                        <Text className="text-white text-sm mt-1">
                            {t("No additional charges for rescheduling")}
                        </Text>
                    </View>

                    {/* Time Slot Selection - ONLY EDITABLE FIELD */}
                    <View className="bg-green-50 p-4 rounded-lg border-2 border-green-200">
                        <Text className="font-semibold text-lg mb-2 text-green-800">
                            {t("Select New Time Slot")}
                        </Text>
                        <Text className="text-green-700 text-sm mb-3">
                            {t("Choose your preferred new date and time")}
                        </Text>

                        <SchedulePickerButton
                            selectedDateTime={selectedDateTime}
                            setSelectedDateTime={setSelectedDateTime}
                            sheetRef={SchedulePickerRef}
                        />
                    </View>

                    {/* Action Buttons */}
                    <View className="flex-row gap-3 mt-4">
                        <Button
                            onPress={() => router.back()}
                            variant="outline"
                            className="flex-1"
                            disabled={isSubmitting}
                        >
                            <Text className="text-gray-700 font-medium">
                                {t("Cancel")}
                            </Text>
                        </Button>

                        <Button
                            onPress={handleSubmit(onSubmit)}
                            disabled={isSubmitting || !selectedDateTime}
                            className="flex-1"
                        >
                            <Text className="text-white font-medium">
                                {isSubmitting ? t("Rescheduling...") : t("Reschedule")}
                            </Text>
                        </Button>
                    </View>

                </ScrollView>
            </View>

            {/* Schedule Picker Sheet - Same as original */}
            <SchedulePickerSheet
                selectedDateTime={selectedDateTime}
                setSelectedDateTime={setSelectedDateTime}
                doctorSchedule={doctorSchedule}
                doctorId={appointmentData?.doctorId}
                numberOfSessions={appointmentData?.numberOfSessions || 1}
                time={appointmentData?.duration || "30 minutes"}
                ref={SchedulePickerRef}
            />
        </>
    );
}