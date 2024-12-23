import React from "react";
import { View, Text, Image } from "react-native";
import { Button } from "@/components/ui/Button";
import Anxity from "@/features/scale/assets/images/anxiety.svg";

export default function GeneralizedAnxietyDisorderScale() {
  return (
    <View className="p-6 h-full flex flex-col justify-between bg-blue-50/10">
      {/* Header Section */}
      <View className="flex gap-4 items-center bg-white rounded-2xl px-4 py-8">
        <Anxity className="w-24 h-24 mb-4" resizeMode="contain" />
        <Text className="text-lg font-bold text-center mb-2">
          Generalized Anxiety Disorder Scale
        </Text>
        <Text className="text-gray-600 text-center leading-6">
          This simple test will help you assess and understand your level of
          anxiety. Your answers will assist us in determining your mental health
          level and guiding you towards a suitable session to support your
          mental health.
        </Text>
      </View>

      {/* Reference Section */}
      <View className="bg-blue-50/50 p-4 rounded-md mt-6">
        <Text className="text-xs text-gray-800 text-center">
          Reference: Prepared by doctors Robert L. Spitzer, Janet B.W. Williams,
          Kurt Kroenke, and colleagues, with an educational grant from Pfizer
          Inc.
        </Text>
      </View>

      {/* Action Button */}
      <Button className="bg-purple-500 mt-6" onPress={() => {}}>
        <Text className="text-white font-semibold">Start Now</Text>
      </Button>
    </View>
  );
}
