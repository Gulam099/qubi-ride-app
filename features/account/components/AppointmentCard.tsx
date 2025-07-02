import React, { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { format } from "date-fns";
import { Separator } from "@/components/ui/Separator";
import CopyToClipboard from "@/features/Home/Components/CopyToClipboard";
import {
  CalendarAdd,
  CloseCircle,
  Copy,
  FolderOpen,
  Headphone,
  Hospital,
  Message,
  Repeat,
  Warning2,
} from "iconsax-react-native";
import colors from "@/utils/colors";
import { Button } from "@/components/ui/Button";
import { Ellipsis, Headset } from "lucide-react-native";
import Drawer from "@/components/ui/Drawer";
import { useRouter } from "expo-router";
import { TouchableWithoutFeedback } from "react-native-gesture-handler";
import { useTranslation } from "react-i18next";

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
    appointment.date ||
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
    appointment.selectedDateTime
  );
};

const isValidDate = (dateValue) => {
  if (!dateValue) return false;
  const date = new Date(dateValue);
  return !isNaN(date.getTime());
};
export default function AppointmentCard({ appointment, type }: any) {
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

  console.log("appointment", appointment);
  // Safe access to selectedSlots
  console.log("selectedSlots", appointment?.selectedSlots);
  console.log("first selectedSlot", appointment?.selectedSlots?.[0]);
  const { t } = useTranslation(); 

  // Get the correct date values
  const appointmentDate = getAppointmentDate(appointment);
  const bookingDate = getBookingDate(appointment);
  // Function to get the display date/time
  const getAllDisplayDateTime = () => {
    const dates = [];

    // Check if selectedSlots array exists and has items
    if (
      appointment?.selectedSlots &&
      Array.isArray(appointment.selectedSlots) &&
      appointment.selectedSlots.length > 0
    ) {
      appointment.selectedSlots.forEach((slot, index) => {
        if (slot) {
          if (isValidDate(slot)) {
            dates.push(formatDate(slot, "dd MMM yyyy, hh:mm a"));
          } else if (typeof slot === "string") {
            dates.push(slot);
          }
        }
      });
    }

    // If no valid dates from selectedSlots, fall back to other date fields
    if (dates.length === 0) {
      if (appointmentDate && isValidDate(appointmentDate)) {
        dates.push(formatDate(appointmentDate, "dd MMM yyyy, hh:mm a"));
      } else if (appointmentDate && typeof appointmentDate === "string") {
        dates.push(appointmentDate);
      }
    }

    return dates.length > 0 ? dates : ["N/A"];
  };
  const allDisplayDates = getAllDisplayDateTime();
  return (
    <View className="bg-white overflow-hidden rounded-2xl">
      <View>
        {/* Header with appointment number */}
        <View className="items-center p-4">
          <Text className="font-medium text-neutral-800">
             {t("appointmentDetails")}
          </Text>
        </View>

        <Separator />

        {/* Common Appointment Details */}
        <View className="flex-row gap-0">
          <View className="flex-1 p-4 pb-6 gap-3">
            <Text className="text-gray-600 text-base">
              {t("customerName")}:{" "}
              {appointment.user?.name || appointment.patientId?.name || "N/A"}
            </Text>
            <Text className="text-gray-600 text-base">
             {t(" Duration")}: {appointment?.duration}
            </Text>
            <Text className="text-gray-600 text-base">
               {t("session")}; {appointment?.numberOfSessions}
            </Text>
            <Text className="text-gray-600 text-base">
              {t("bookingDate")}:{" "}
              {formatDate(bookingDate || appointment.createdAt, "dd MMM yyyy")}
            </Text>

            {appointment?.isForFamilyMember === true && (
              <Text className="text-gray-600 text-base">
                {t("familyMemberName")}: {appointment?.familyMemberDetails?.name}
              </Text>
            )}

            <View className="text-gray-600 text-base">
              <Text className="text-gray-600 text-base">
                {t("appointmentDateTime")}:
              </Text>
              {allDisplayDates.map((date, index) => (
                <Text key={index} className="text-gray-600 text-base ml-2">
                  • {date}
                </Text>
              ))}
            </View>
          </View>
        </View>
      </View>

      {isImmediate && (
        <View className="bg-red-100/50 p-2 rounded-b-2xl mt-2 flex-row justify-center items-center gap-2">
          <Warning2 size="18" color={colors.red[600]} variant="Bulk" />
          <Text className="text-red-600 font-medium">
            This client has suicidal thoughts
          </Text>
        </View>
      )}
    </View>
  );
}
