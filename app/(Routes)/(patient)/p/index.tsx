import { View, Text, ImageBackground } from "react-native";
import React from "react";
import {  useSelector } from "react-redux";

import { Button } from "@/components/ui/Button";
import { useRouter } from "expo-router";
import {  H3 } from "@/components/ui/Typography";
import { Calendar, Clock } from "iconsax-react-native";

export default function PatientPage() {
  const user = useSelector((state: any) => state.user);

  if (!user.isAuthenticated) {
  }

  const router = useRouter();

  const image = require("@/features/Home/assets/images/PatientPageBackgroundImage.png");
  return (
    <ImageBackground source={image} className="bg-cover flex-1 ">
      <View className="px-2 py-8 flex gap-6 flex-col">
        <Button
          className="bg-neutral-300/50 backdrop-blur-md"
          onPress={() => router.push("/p/account/notification")}
        >
          <Text className="font-medium text-left w-full text-white">
            Help me find the right consultant{" "}
          </Text>
        </Button>

        <H3 className="text-white">What type of consultation do you need?</H3>

        <View className="flex flex-row gap-4 w-full ">
          {[
            {
              title: "Scheduled",
              desc: "Book your appointment with the appropriate specialist for you.",
              icon: Calendar,
            },
            {
              title: "Instant",
              desc: "Immediate sessions with a specialist",
              icon: Clock,
            },
          ].map((e, i) => (
            <View
              key={e.title}
              className="flex-1 flex justify-between aspect-square rounded-xl p-4 bg-neutral-300/20 backdrop-blur-md"
            >
              <View className="flex justify-end w-full items-end">
                <e.icon color="white" size={30} className="w-full " />
              </View>
              <View>
                <H3 className="text-white">{e.title}</H3>
                <Text className="text-neutral-200 text-base font-normal">
                  {e.desc}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </ImageBackground>
  );
}
