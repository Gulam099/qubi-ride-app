import React from "react";
import { View, Text, TouchableOpacity, FlatList } from "react-native";
import { RelativePathString, useRouter } from "expo-router";
import { Button } from "@/components/ui/Button";
import { Chart21, Clock, Profile2User } from "iconsax-react-native";
import colors from "@/utils/colors";

export default function ScalePage() {
  const router = useRouter();

  // Demo data for scales
  const scales = [
    {
      id: "1",
      title: "Generalized Anxiety Disorder scale",
      time: "3 min",
      users: "1.1M",
      link: "/account/scale/generalized-anxiety-disorder-scale",
    },
    {
      id: "2",
      title: "Mood scale",
      time: "3 min",
      users: "1.1M",
      link: "/account/scale/mood-scale",
    },
    {
      id: "3",
      title: "Quality of Life scale",
      time: "3 min",
      users: "1.1M",
      link: "/account/scale/quality-of-life-scale",
    },
    {
      id: "4",
      title: "Depression scale",
      time: "3 min",
      users: "1.1M",
      link: "/account/scale/depression-scale",
    },
  ];

  return (
    <View className="p-4 bg-blue-50/10 h-full">
      <View className="flex-row justify-between items-center mb-4">
        <Text className="font-bold text-xl">Scale</Text>
        <Button
          className="h-11 max-h-11 py-0 px-0 flex-row bg-primary-50 gap-3"
          onPress={() =>
            router.push("/account/scale/record" as RelativePathString)
          }
        >
          <Chart21 size="24" color={colors.primary[500]} />
          <Text className="text-primary-500 font-semibold">Record</Text>
        </Button>
      </View>

      <FlatList
        data={scales}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerClassName="gap-4"
        columnWrapperClassName="gap-4"
        renderItem={({ item }) => (
          <TouchableOpacity
            className="bg-white p-4 rounded-2xl  flex-1 aspect-[4/3] relative overflow-hidden flex-col justify-between"
            onPress={() => router.push(`${item.link}` as RelativePathString)}
          >
            <Text className="font-bold text-lg ">{item.title}</Text>
            <View className="size-36 absolute -top-6 -left-6 bg-blue-50/20 rounded-full"></View>
            <View className="flex-row items-start justify-start gap-3">
              <View className="flex-row items-center justify-center gap-2">
                <Clock size="16" color={colors.primary[500]} />
                <Text className="text-gray-500 text-xs font-semibold">
                  {item.time}
                </Text>
              </View>
              <View className="flex-row items-center justify-center gap-2">
                <Profile2User size="16" color={colors.primary[500]} />
                <Text className="text-gray-500 text-xs font-semibold">
                  {item.users}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
