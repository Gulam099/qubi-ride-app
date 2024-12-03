import { AppLogo } from "@/const";
import React from "react";
import { View, Image } from "react-native";

export default function Logo() {
  return (
    <View className="w-full h-32 flex justify-center items-center">
      <Image source={AppLogo} className="w-32 h-32" />
    </View>
  );
}
