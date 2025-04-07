import { View, Text } from "react-native";
import React from "react";
import { Stack, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

const JoinRoom = () => {
  const { roomId } = useLocalSearchParams();
  return (
    <>
      <Stack.Screen options={{ headerShown: true }} />
      <SafeAreaView>
        <View>
          <Text className="text-3xl text-black">Join Room ID : {roomId}</Text>
        </View>
      </SafeAreaView>
    </>
  );
};

export default JoinRoom;
