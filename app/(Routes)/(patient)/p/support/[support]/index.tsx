import { View, Text } from "react-native";
import React from "react";
import { Stack, useLocalSearchParams } from "expo-router";

export default function SupportPage() {
  const { support } = useLocalSearchParams();
  return (
    <>
    
    <View>
      <Text>SupportPage - {support}</Text>
    </View>
    
    </>
  );
}
