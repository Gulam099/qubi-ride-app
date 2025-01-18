import { View, Text } from "react-native";
import React from "react";
import { useLocalSearchParams } from "expo-router/build/hooks";


export default function VideoCallPage() {
  const { callerId } = useLocalSearchParams();
  return (
    <View>
      <Text>VideoCallPage</Text>
    </View>
  );
}
