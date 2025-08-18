import React, { useState } from "react";
import { Text, TouchableOpacity, View, TextInput, Modal } from "react-native";
import { format } from "date-fns";
import { Separator } from "@/components/ui/Separator";
import CopyToClipboard from "@/features/Home/Components/CopyToClipboard";
import { Alert } from "react-native";
import {
  CalendarAdd,
  Trash,
  Copy,
  FolderOpen,
  Headphone,
  Hospital,
  Message,
  Repeat,
  Warning2,
  CloseCircle,
} from "iconsax-react-native";
import colors from "@/utils/colors";
import { Button } from "@/components/ui/Button";
import { Ellipsis, Headset, X } from "lucide-react-native";
import Drawer from "@/components/ui/Drawer";
import { router, useRouter } from "expo-router";
import { TouchableWithoutFeedback } from "react-native-gesture-handler";
import { useTranslation } from "react-i18next";
import { Image } from "react-native";
import { apiNewUrl } from "@/const";

// Helper function to safely format dates
const formatDate = (dateValue, formatString = "dd MMM yyyy") => {
  if (!dateValue) return "N/A";

  try {
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return "Invalid Date";
    return format(date, formatString);
  } catch (error) {
    console.error("Date formatting error:", error);
    return "Invalid Date";
  }
};

// Helper function to get the correct date field
const getAppointmentDate = (appointment) => {
  // Check for multiple possible date field names
  return (
    appointment.appointmentDate ||
    appointment.dateTime ||
    appointment.scheduledDate ||
    appointment.appointmentTime
  );
};

const getBookingDate = (appointment) => {
  return (
    appointment.appointmentDate ||
    appointment.date ||
    appointment.scheduledDate ||
    appointment.appointmentTime ||
    appointment.dateTime
  );
};

const isValidDate = (dateValue) => {
  if (!dateValue) return false;
  const date = new Date(dateValue);
  return !isNaN(date.getTime());
};

const handleReschedule = (id: any) => {
  router.push(`/(stacks)/reschedule/${id}`)
};

// Cancel Bottom Sheet Component
const CancelBottomSheet = ({ isVisible, onClose, onConfirm, appointment }) => {
  const { t } = useTranslation();
  const [cancelReason, setCancelReason] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleCancel = async () => {
    if (!cancelReason.trim()) {
      Alert.alert(t("error"), "Please provide a reason for cancellation");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${apiNewUrl}/api/bookings/update/${appointment._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'cancelled',
          cancelReason: cancelReason.trim()
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to cancel appointment');
      }

      // Close the bottom sheet
      onClose();
      setCancelReason("");

      // Show success alert
      Alert.alert(
        t("success"),
        t("yourAppointmentSuccessfullyCancelled"),
        [{ text: t("ok") }]
      );

      // Call the onConfirm callback if provided
      if (onConfirm) onConfirm();

    } catch (error) {
      Alert.alert(
        t("error"),
        error.message || t("failedToCancelAppointment"),
        [{ text: t("ok") }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setCancelReason("");
    onClose();
  };

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View className="flex-1 bg-black/50 justify-end">
        <TouchableWithoutFeedback onPress={handleClose}>
          <View className="flex-1" />
        </TouchableWithoutFeedback>

        <View className="bg-white rounded-t-3xl p-6 pb-8">
          {/* Header */}
          <View className="flex-row items-center justify-between mb-6">
            <Text className="text-xl font-semibold text-gray-900">
              Cancel Session
            </Text>
            <TouchableOpacity onPress={handleClose}>
              <X size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* Reason Input */}
          <View className="mb-6">
            <Text className="text-base font-medium text-gray-700 mb-3">
              Reason Cancel
            </Text>
            <TextInput
              className="bg-gray-50 rounded-xl p-4 text-base text-gray-900 min-h-[100px]"
              placeholder="Reason to cancel a session"
              placeholderTextColor="#9CA3AF"
              multiline={true}
              textAlignVertical="top"
              value={cancelReason}
              onChangeText={setCancelReason}
              maxLength={500}
            />
          </View>

          {/* Action Buttons */}
          <View className="gap-3">
            <TouchableOpacity
              className="bg-purple-600 py-4 rounded-full items-center"
              onPress={handleCancel}
              disabled={isLoading}
            >
              <Text className="text-white font-semibold text-base">
                {isLoading ? "Cancelling..." : "Cancellation confirmation session"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="py-4 rounded-full items-center"
              onPress={handleClose}
            >
              <Text className="text-gray-500 font-medium text-base">
                Retreat
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// Single appointment card component
const SingleAppointmentCard = ({
  appointment,
  slot,
  onCancel,
  onReschedule,
  onChat,
}) => {
  const { t } = useTranslation();
  const [isCancelSheetVisible, setIsCancelSheetVisible] = useState(false);

  const isActionDisabled =
    appointment?.status?.toLowerCase() === "cancelled" ||
    appointment?.status?.toLowerCase() === "completed";

  // Function to get doctor's initials
  const getDoctorInitials = (fullName) => {
    if (!fullName) return t("notAvailable");
    const names = fullName.split(" ");
    if (names.length >= 2) {
      return (names[0][0] + names[1][0]).toUpperCase();
    }
    return fullName[0].toUpperCase();
  };

  const getFormattedDate = () => {
    if (slot && isValidDate(slot)) {
      return formatDate(slot, "dd-MM-yyyy");
    }
    return t("notAvailable");
  };

  const getFormattedTime = () => {
    if (slot && isValidDate(slot)) {
      return formatDate(slot, "hh:mm a");
    }
    return t("notAvailable");
  };

  return (
    <>
      <View className="bg-white rounded-2xl p-6 mb-4 shadow-sm border border-gray-100">
        {/* Doctor Info Row */}
        <View className="flex-row items-center gap-3 mb-6">
          {appointment?.doctorId?.profile_picture ? (
            <Image
              source={{ uri: appointment?.doctorId?.profile_picture }}
              className="w-16 h-16 rounded-full bg-gray-200"
              resizeMode="cover"
            />
          ) : (
            <View className="w-16 h-16 rounded-full bg-blue-500 items-center justify-center">
              <Text className="text-white text-xl font-bold">
                {getDoctorInitials(appointment?.doctorId?.full_name)}
              </Text>
            </View>
          )}
          <View className="flex-1">
            <Text className="text-lg font-semibold text-gray-900 mb-1">
              {appointment?.doctorId?.full_name ?? "N/A"}
            </Text>
            <View className="flex-row items-center mb-1">
              <Text className="text-sm text-gray-600 font-medium">
                {t("sessionDay")} :
              </Text>
              <Text className="text-sm text-gray-900 ml-2 font-medium">
                {getFormattedDate()}
              </Text>
            </View>
            <View className="flex-row items-center">
              <Text className="text-sm text-gray-600 font-medium">
                {t("sessionTime")} :
              </Text>
              <Text className="text-sm text-gray-900 ml-2 font-medium">
                {getFormattedTime()}
              </Text>
            </View>
            <View className="flex-row items-center">
              <Text className="text-sm text-gray-600 font-medium">
                {t("Status")} :
              </Text>
              <Text className="text-sm text-gray-900 ml-2 font-medium">
                {appointment.status}
              </Text>
            </View>
            {appointment.cancelReason && <View className="flex-row items-center">
              <Text className="text-sm text-gray-600 font-medium">
                {t("Cancellation Reason")} :
              </Text>
              <Text className="text-sm text-gray-900 ml-2 font-medium">
                {appointment.cancelReason}
              </Text>
            </View>}
          </View>
        </View>

        <Separator />

        {/* Action Buttons */}
        <View className="flex-row justify-between gap-3 mt-4">
          <TouchableOpacity
            className={`flex-1 ${isActionDisabled ? "bg-red-50" : "bg-red-100"} py-2.5 rounded-full items-center flex-row justify-center`}
            onPress={() => setIsCancelSheetVisible(true)}
            disabled={isActionDisabled}
          >
            <Trash size={18} color="#DC2626" />
            <Text className={`${isActionDisabled ? "text-red-200" : "text-red-600"} font-semibold ml-1 text-base`}>
              {t("cancel")}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`flex-1 ${isActionDisabled ? "bg-yellow-50" : "bg-yellow-100"} py-2.5 rounded-full items-center flex-row justify-center`}
            onPress={() => handleReschedule(appointment?._id)}
            disabled={isActionDisabled}
          >
            <Repeat size={18} color="#B45309" />
            <Text className={`${isActionDisabled ? "text-yellow-300" : "text-yellow-700"} font-semibold ml-1 text-base`}>
              {t("reschedule")}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-1 bg-purple-100 py-2.5 rounded-full items-center flex-row justify-center"
            onPress={() => router.push("/(tabs)/account/chat/chatlist")}
          >
            <Message size={18} color="#7C3AED" />
            <Text className="text-purple-700 font-semibold ml-1 text-base">
              {t("chats")}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Cancel Bottom Sheet */}
      <CancelBottomSheet
        isVisible={isCancelSheetVisible}
        onClose={() => setIsCancelSheetVisible(false)}
        onConfirm={() => {
          // Refresh the appointment list or perform any other action
          if (onCancel) onCancel();
        }}
        appointment={appointment}
      />
    </>
  );
};

// Main component that renders multiple cards
export default function AppointmentCard({
  appointment,
  type,
  onCancel,
  onChat,
}: any) {
  const {
    _id,
    patientName,
    sessionCount,
    status,
    specialistRequired,
    genderSpecialistRequired,
    overview,
    isImmediate,
  } = appointment;

  const router = useRouter();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  console.log("appointment>>", appointment);

  // Get the correct date values
  const appointmentDate = getAppointmentDate(appointment);
  const bookingDate = getBookingDate(appointment);

  // Function to get all appointment slots
  const getAppointmentSlots = () => {
    const slots = [];

    // Check if selectedSlots array exists and has items
    if (
      appointment?.selectedSlots &&
      Array.isArray(appointment.selectedSlots) &&
      appointment.selectedSlots.length > 0
    ) {
      appointment.selectedSlots.forEach((slot) => {
        if (slot && isValidDate(slot)) {
          slots.push(slot);
        }
      });
    }

    // Fall back to other date fields if no selectedSlots
    if (slots.length === 0) {
      if (appointmentDate && isValidDate(appointmentDate)) {
        slots.push(appointmentDate);
      }
    }

    return slots;
  };

  const appointmentSlots = getAppointmentSlots().sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );

  // If no valid slots, show single card with N/A
  if (appointmentSlots.length === 0) {
    return (
      <SingleAppointmentCard
        appointment={appointment}
        slot={null}
        onCancel={onCancel}
        onReschedule={onReschedule}
        onChat={onChat}
      />
    );
  }

  // Render separate cards for each slot
  return (
    <View>
      {appointmentSlots.map((slot, index) => (
        <SingleAppointmentCard
          key={`${appointment._id}-${index}`}
          appointment={appointment}
          slot={slot}
          onCancel={onCancel}
          onReschedule={handleReschedule}
          onChat={onChat}
        />
      ))}
    </View>
  );
}