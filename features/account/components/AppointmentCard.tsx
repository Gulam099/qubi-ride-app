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
  return appointment.bookingDate || 
         appointment.createdAt || 
         appointment.bookedAt;
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

  // Get the correct date values
  const appointmentDate = getAppointmentDate(appointment);
  const bookingDate = getBookingDate(appointment);

  console.log("Appointment data:", {
    appointmentDate,
    bookingDate,
    fullAppointment: appointment
  });

  const Menu = [
    {
      type: "treatment",
      title: "Treatment",
      icon: Hospital,
      onPress: () => {
        const patientId = appointment.doctor?._id;
        console.log("patient ID 2", patientId);
        router.replace(`/(stacks)/treatment/${patientId}`);
      },
    },
  ];

  const handleClickCard = () => {
    // if (type === "completed" || type === "upcoming") {
    //   router.push(`/s/account/appointment/${_id}/${type}`);
    // }
  };

  return (
    <TouchableOpacity onPress={handleClickCard}>
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
                  {formatDate(appointmentDate, "dd MMM yyyy, hh:mm a")}
                </Text>
              </View>
            )}

            <View className="flex-1 p-4 pb-6 gap-3">
              <Text className="text-gray-600 text-base">
                Customer Name: {appointment.user?.name || appointment.patientName || "N/A"}
              </Text>
              
              {type !== "upcoming" && (
                <Text className="text-gray-600 text-base">
                  Appointment Date: {formatDate(appointmentDate, "dd MMM yyyy, hh:mm a")}
                </Text>
              )}
              
              <Text className="text-gray-600 text-base">
                Booking Date: {formatDate(bookingDate, "dd MMM yyyy")}
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

        {/* Drawer */}
        <Drawer
          visible={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          title="Attachments"
          height="50%"
        >
          <View className="flex flex-1 justify-center items-start w-full gap-2">
            {Menu.map((item, index) => (
              <Button
                key={item.type + index}
                variant={"secondary"}
                className="flex-row items-center justify-start gap-4 w-full"
                onPress={() => {
                  item.onPress();
                  setIsDrawerOpen(false);
                }}
              >
                <item.icon size="22" color={colors.gray[600]} />
                <Text className="text-neutral-500 font-medium leading-7">
                  {item.title}
                </Text>
              </Button>
            ))}
          </View>
        </Drawer>
      </View>
    </TouchableOpacity>
  );
}