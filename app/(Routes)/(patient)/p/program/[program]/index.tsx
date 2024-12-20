import { View, Text } from "react-native";
import React from "react";
import { Stack, useLocalSearchParams } from "expo-router";

export default function ProgramPage() {
  const { program } = useLocalSearchParams();
  return (
    <>
      <View>
        <Text>ProgramPage - {program}</Text>
      </View>
    </>
  );
}
