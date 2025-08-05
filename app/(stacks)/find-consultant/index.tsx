import { router } from "expo-router";
import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { Button } from "@/components/ui/Button";

const ConsultationScreen = () => {
  return (
    <View className="flex-1">
       <View style={styles.container}>
            <Image
              source={require("@/assets/images/image.png")} // path ko adjust karein agar alias use nahi kar rahe ho
              style={{
                width: 380,
                height: 510,
                resizeMode: "contain",
              }}
            />
          </View>
      {/* Bottom section with text and button */}
      <View className="bg-white rounded-t-3xl p-6 pb-8">
        <Button
          className="bg-purple-600 py-4 rounded-xl mx-2"
          onPress={() => router.push("/(stacks)/find-consultant/step1")}
        >
          <Text className="text-white font-semibold text-lg text-center">
            Start Now
          </Text>
        </Button>
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
});

export default ConsultationScreen;
