import { View, Text, TouchableOpacity } from "react-native";
import React, { useState } from "react";
import { ArrowRight2, TableDocument } from "iconsax-react-native";
import { Redirect, RelativePathString, useRouter } from "expo-router";
import { Button } from "@/components/ui/Button";
import Drawer from "@/components/ui/Drawer";
import { H3 } from "@/components/ui/Typography";
import { toSentenceCase } from "@/utils/string.utils";

export default function HelpCenterPage() {
  const router = useRouter();
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const Data = [
    {
      title: "Frequently Asked Questions (FAQ)",
      link: "/(Routes)/(patient)/help/faqs",
    },
    {
      title: "Numbers that concern you",
      link: "/(Routes)/(patient)/help/numbers",
    },
  ];
  return (
    <View className="bg-blue-50/20 h-full p-4 flex-col gap-2">
      {Data.map((e, i) => (
        <TouchableOpacity
          onPress={() => router.push(e.link as RelativePathString)}
          key={i}
        >
          <View className="bg-white py-4 px-4 rounded-2xl flex-row justify-between items-center gap-2">
            <View className="flex-row gap-2 items-center">
              <TableDocument size="24" color="#000" />
              <Text>{e.title}</Text>
            </View>
            <ArrowRight2 size="24" color="#000" />
          </View>
        </TouchableOpacity>
      ))}

      <View className="justify-center items-center">
        <TouchableOpacity
          onPress={() => setIsDrawerVisible(true)}
          className="w-full"
        >
          <View className="bg-white py-4 px-4 rounded-2xl flex-row justify-between items-center gap-2">
            <View className="flex-row gap-2 items-center">
              <TableDocument size="24" color="#000" />
              <Text>Application permissions</Text>
            </View>
            <ArrowRight2 size="24" color="#000" />
          </View>
        </TouchableOpacity>

        <Drawer
          visible={isDrawerVisible}
          onClose={() => setIsDrawerVisible(false)}
          title="My Drawer"
          className="max-h-[60%]"
          height="60%"
        >
          <View className="flex flex-col flex-1 justify-center items-center w-full gap-4 px-6">
            <H3 className="border-none ">Technical Support Chat</H3>
            <Text className="text-lg text-neutral-600 text-center">
              We are available to serve you and we are happy to communicate with
              you
            </Text>
            <Text className="text-lg text-neutral-600 text-center">
              Can you choose one of the options shown in front of you
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {[
                "payment_method",
                "baserah_services",
                "about_consulting",
                "privacy_policy",
                "other",
                "choosing_a_consultant",
                "specialist_service",
                "medical_prescriptions",
              ].map((e, i) => (
                <Button
                  onPress={() => {
                    router.push(`/(stacks)/chat/${e}`);
                    setIsDrawerVisible(false);
                  }}
                  key={i}
                  className="w-auto bg-blue-50/20"
                >
                  <Text className="text-blue-500 font-medium">
                    {toSentenceCase(e)}
                  </Text>
                </Button>
              ))}
            </View>
          </View>
        </Drawer>
      </View>
    </View>
  );
}
