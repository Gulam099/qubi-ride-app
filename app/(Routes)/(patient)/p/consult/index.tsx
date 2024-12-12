import { View, Text, Dimensions, StyleSheet } from "react-native";
import React from "react";
import { Image } from "react-native";
import { consultPageHomeImage } from "@/features/patient/constPatient";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { useRouter } from "expo-router";
import { H3 } from "@/components/ui/Typography";

export default function ConsultPage() {
  const router = useRouter();
  return (
    <View className="flex w-full h-full  flex-col gap-4">
      <Image
        source={consultPageHomeImage}
        className={cn("w-full h-[undefined] aspect-[380/396]")}
      />
      <View className="flex flex-col gap-8 px-4 py-6">
        <H3 className="text-center leading-9">
          Based on your condition, we suggest that you book a session with any
          of the following specialists
        </H3>
        <Button
          className=" backdrop-blur-md "
          onPress={() => router.push("/p/consult")}
        >
          <Text className="font-semibold  text-center text-white">
            Start Now
          </Text>
        </Button>
      </View>
    </View>
  );
}
