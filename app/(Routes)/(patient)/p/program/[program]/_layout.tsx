import { View, Text } from "react-native";
import React from "react";
import { Stack, useLocalSearchParams } from "expo-router";
import NotificationIconButton from "@/features/Home/Components/NotificationIconButton";
import BackButton from "@/features/Home/Components/BackButton";
import { toTitleCase } from "@/utils/string.utils";

export default function ProgramGroupIndPage() {
  const { program } = useLocalSearchParams();
  return (
    <Stack
      screenOptions={{
        headerLeft:()=> <BackButton/>,
        headerTitle: ({ children }) => (
          <Text className="font-semibold text-lg ">{toTitleCase(program as string)}</Text>
        ),
        headerRight: () => <NotificationIconButton className="mr-4" />,
      }}
    />
  );
}
