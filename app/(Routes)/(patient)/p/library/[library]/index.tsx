import { View, Text } from "react-native";
import React from "react";
import { Stack, useLocalSearchParams } from "expo-router";

export default function ProgramPage() {
  const { library } = useLocalSearchParams();
  return (
    <>
      <View>
        <Text>ProgramPage - {library}</Text>
      </View>
    </>
  );
}
