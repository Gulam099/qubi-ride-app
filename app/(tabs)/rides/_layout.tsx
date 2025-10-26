import { View, Text } from "react-native";
import React from "react";
import { Stack } from "expo-router";
import colors from "@/utils/colors";
import NotificationIconButton from "@/features/Home/Components/NotificationIconButton";
import BackButton from "@/features/Home/Components/BackButton";

export default function ProgramLayout() {

  return (
     <Stack
       screenOptions={{
         headerShown: false,
       }}
     >
     </Stack>
   );
}
