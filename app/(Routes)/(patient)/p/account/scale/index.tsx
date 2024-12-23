import React from "react";
import { View, Text, TouchableOpacity, FlatList } from "react-native";
import { RelativePathString, useRouter } from "expo-router";

export default function ScalePage() {
  const router = useRouter();

  // Demo data for scales
  const scales = [
    {
      id: "1",
      title: "Generalized Anxiety Disorder scale",
      time: "3 min",
      users: "1.1M",
      link: "/p/account/scale/generalized-anxiety-disorder-scale",
    },
    {
      id: "2",
      title: "Mood scale",
      time: "3 min",
      users: "1.1M",
      link: "/p/account/scale/mood-scale",
    },
    {
      id: "3",
      title: "Quality of Life scale",
      time: "3 min",
      users: "1.1M",
      link: "/p/account/scale/quality-of-life-scale",
    },
    {
      id: "4",
      title: "Depression scale",
      time: "3 min",
      users: "1.1M",
      link: "/p/account/scale/depression-scale",
    },
  ];

  return (
    <View className="p-4 bg-blue-50/10 h-full">
      <View className="flex-row justify-between items-center mb-4">
        <Text className="font-bold text-xl">Scale</Text>
        <TouchableOpacity
          className="bg-purple-500 px-4 py-2 rounded-md"
          onPress={() =>
            router.push("/p/account/scale/record" as RelativePathString)
          }
        >
          <Text className="text-white font-medium">Record</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={scales}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: "space-between" }}
        renderItem={({ item }) => (
          <TouchableOpacity
            className="bg-white p-4 rounded-lg shadow-md mb-4 w-[48%]"
            onPress={() => router.push(`${item.link}` as RelativePathString)}
          >
            <Text className="font-bold text-sm mb-2">{item.title}</Text>
            <View className="flex-row items-center gap-2">
              <Text className="text-gray-500 text-xs">⏱ {item.time}</Text>
              <Text className="text-gray-500 text-xs">👥 {item.users}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
