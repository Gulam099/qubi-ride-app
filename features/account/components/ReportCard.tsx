import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons"; // For icons (optional)
import { ExportCurve, Moneys } from "iconsax-react-native";
import colors from "@/utils/colors";

type ReportCardProps = {
  title: string;
  doctorName: string;
  date: string;
  number: string;
};

const ReportCard = ({ title, doctorName, date, number }: ReportCardProps) => {
  return (
    <View className="bg-background rounded-xl p-4 ">
      {/* Card Header */}
      <View className="flex-row justify-between ">
        <Text className="font-semibold text-lg text-blue-800">{title}</Text>
        <ExportCurve size={18} color={colors.primary[600]} />
      </View>

      {/* Doctor's Name */}
      <Text className="font-medium text-base text-neutral-600 my-4">
        <Text className="font-medium text-base text-blue-800">
          Doctor's name :{" "}
        </Text>
        {doctorName}
      </Text>

      {/* Footer: Date & Number */}
      <View className="flex-row justify-between border-t border-neutral-300 pt-4">
        <View className="flex-row items-center">
          <View className="p-1 bg-blue-50/20 aspect-square rounded-full w-8 flex justify-center items-center">
            <Moneys size="18" color={colors.primary[900]} />
          </View>
          <Text className="font-medium text-sm text-neutral-600 ">
            {" "}
            Date : {date}
          </Text>
        </View>
        <View className="flex-row items-center">
          <View className="p-1 bg-blue-50/20 aspect-square rounded-full w-8 flex justify-center items-center">
            <Moneys size="18" color={colors.primary[900]} />
          </View>
          <Text className="font-medium text-sm text-neutral-600 "> Number : {number}</Text>
        </View>
      </View>
    </View>
  );
};

export default ReportCard;
