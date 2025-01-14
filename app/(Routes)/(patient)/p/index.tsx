import { View, Text, ImageBackground } from "react-native";
import React from "react";
import { useSelector } from "react-redux";

import { Button } from "@/components/ui/Button";
import { useRouter } from "expo-router";
import { H3 } from "@/components/ui/Typography";
import { Calendar, Clock } from "iconsax-react-native";
import {
  PatientHomeImage,
  PatientPageInstantMenuImage,
} from "@/features/patient/constPatient";
import { Image } from "react-native";
import { cn } from "@/lib/utils";
import { StatusBar } from "expo-status-bar";
import colors from "@/utils/colors";

export default function PatientPage() {
  const user = useSelector((state: any) => state.user);

  if (!user.isAuthenticated) {
  }

  const router = useRouter();

  return (
    <View className=" flex gap-6 flex-col">
      <Image
        source={PatientHomeImage}
        className={cn("w-full h-[undefined] aspect-[375/295]")}
      />
      <View className="flex gap-6 flex-col px-4">
        <H3 className="text-center">What type of consultation do you need?</H3>

        {[
          {
            title: "Instant",
            desc: "Immediate sessions with a specialist",
            image: PatientPageInstantMenuImage,
          },
          {
            title: "Scheduled",
            desc: "Book your appointment with the appropriate specialist for you.",
          },
        ].map((e, i) => (
          <View
            key={e.title}
            className="flex justify-between  rounded-xl p-4  backdrop-blur-md border border-neutral-300 flex-row relative overflow-hidden h-40"
          >
            <View className="absolute -right-16 top-0 rounded-full bg-blue-50/30 h-40 aspect-square"></View>
            <View className="w-2/3 flex flex-col justify-end">
              <H3 className="font-normal">{e.title}</H3>
              <Text className=" text-base font-normal">{e.desc}</Text>
            </View>
            <View className="flex justify-end w-1/3  items-end">
              {e.image && (
                <Image
                  source={e.image}
                  className={cn("w-full h-[undefined] aspect-square")}
                />
              )}
            </View>
          </View>
        ))}

        <Button
          className="bg-blue-50/30 backdrop-blur-md "
          onPress={() => router.push("/p/account/consult")}
        >
          <Text className="font-medium text-left w-full ">
            Help me find the right consultant{" "}
          </Text>
        </Button>
        {/* <Button
          className="bg-blue-50/30 backdrop-blur-md "
          onPress={() => router.push("/faqs/index")}
        >
          <Text className="font-medium text-left w-full ">FAQ</Text>
        </Button> */}
      </View>
    </View>
  );
}
