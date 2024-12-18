import React from "react";
import { View, Text, TouchableOpacity } from "react-native";

import colors from "@/utils/colors";
import { Edit2, Trash } from "iconsax-react-native";

type ScheduleCalendarCardProps = {
  time: string;
  date: string;
  title: string;
  description: string;
  onDelete: () => void;
  onEdit?: () => void;
};

export default function ScheduleCalendarCard({
  time,
  date,
  title,
  description,
  onDelete,
  onEdit,
}: ScheduleCalendarCardProps) {
  return (
    <View className="bg-white rounded-lg px-4 py-6 shadow-md flex-row items-center relative">
      {/* Left Section */}
      <View className="w-1/4 pr-4">
        <Text className="font-bold text-lg text-black">{time}</Text>
        <Text className="text-gray-500">{date}</Text>
      </View>

      {/* Middle Divider */}
      <View className="w-px h-full bg-gray-200 mx-2" />

      {/* Middle Section */}
      <View className="flex-1">
        <Text className="font-semibold text-lg text-black">{title}</Text>
        <Text className="text-gray-600 text-sm">{description}</Text>
      </View>

      {/* Right Section */}
      <View className="flex-row gap-6 absolute top-2 right-3">
        <TouchableOpacity onPress={onDelete}>
          <Trash size={20} color={colors.red[500]} />
        </TouchableOpacity>
        {onEdit && (
          <TouchableOpacity onPress={onEdit}>
            <Edit2 size={20} color="black" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
