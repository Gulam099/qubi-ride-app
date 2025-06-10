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
import { AppointmentCardProps } from "../types/appointment.type";
import { useRouter } from "expo-router";
import { TouchableWithoutFeedback } from "react-native-gesture-handler";

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
  return appointment.appointmentDate || 
         appointment.date || 
         appointment.scheduledDate || 
         appointment.appointmentTime;
};

const getBookingDate = (appointment) => {
  return appointment.appointmentDate || 
         appointment.date || 
         appointment.scheduledDate || 
         appointment.appointmentTime ||
         appointment.selectedDateTime;
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

  console.log('appointment', appointment);
  // Safe access to selectedSlots
  console.log('selectedSlots', appointment?.selectedSlots);
  console.log('first selectedSlot', appointment?.selectedSlots?.[0]);

  // Get the correct date values
  const appointmentDate = getAppointmentDate(appointment);
  const bookingDate = getBookingDate(appointment);

  // Safe access to selectedSlots with proper null checking
  const selectedSlot = appointment?.selectedSlots?.[0] || null;
  const selectedSlotTime = appointment?.selectedSlots?.[1] || null;

  

  
  // Function to get the display date/time
  const getDisplayDateTime = () => {
    if (selectedSlot) {
      return formatDate(selectedSlot, "dd MMM yyyy, hh:mm a");
    }
    if (selectedSlotTime) {
      return selectedSlotTime;
    }
    if (appointmentDate) {
      return formatDate(appointmentDate, "dd MMM yyyy, hh:mm a");
    }
    return "N/A";
  };

  return (
      <View className="bg-white overflow-hidden rounded-2xl">
        <View>
          {/* Header with appointment number */}
          <View className="flex-row justify-start items-center gap-2 p-4">
            <Text className="font-medium text-neutral-800">Appointment :</Text>
            <CopyToClipboard
              data={_id}
              variant="secondary"
              size={"sm"}
              className="flex-row items-center justify-center gap-1"
            >
              <Text className="font-semibold text-primary-500 text-xs leading-8">
                {_id}
              </Text>
              <Copy size="16" color={colors.primary[300]} />
            </CopyToClipboard>
          </View>
          <Separator />

          {/* Common Appointment Details */}
          <View className="flex-row gap-0">
            {type === "upcoming" && (
              <View className="bg-green-100 w-1/3 justify-center items-center px-4 py-6">
                <Text className="font-semibold text-green-700 text-balance text-base">
                  Appointment Date:
                </Text>
                <Text className="text-base text-green-700 text-center">
                  {getDisplayDateTime()}
                </Text>
              </View>
            )}

            <View className="flex-1 p-4 pb-6 gap-3">
              <Text className="text-gray-600 text-base">
                Customer Name: {appointment.user?.name || appointment.patientId?.name || "N/A"}
              </Text>
              
              <Text className="text-gray-600 text-base">
                Appointment Date And Time: {getDisplayDateTime()}
              </Text>
              
              <Text className="text-gray-600 text-base">
                Booking Date: {formatDate(bookingDate || appointment.createdAt, "dd MMM yyyy")}
              </Text>

              {type !== "urgent" && (
                <Text className="text-gray-600 text-base">
                  Session: {sessionCount ?? "N/A"}
                </Text>
              )}

              {/* Urgent-Specific Details */}
              {type === "urgent" && (
                <>
                  {appointment.specialization && (
                    <Text className="text-gray-600 text-base">
                      Specialization: {appointment.specialization}
                    </Text>
                  )}
                  {appointment.category && (
                    <Text className="text-gray-600 text-base">
                      Category: {appointment.category}
                    </Text>
                  )}
                  {specialistRequired && (
                    <Text className="text-gray-600 text-base">
                      Specialist Required: {specialistRequired}
                    </Text>
                  )}
                  {genderSpecialistRequired && (
                    <Text className="text-gray-600 text-base">
                      Gender Specialist Required: {genderSpecialistRequired}
                    </Text>
                  )}
                </>
              )}
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