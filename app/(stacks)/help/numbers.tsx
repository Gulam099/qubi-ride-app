import { View, FlatList, TouchableOpacity, Linking } from "react-native";
import React from "react";
import { Text } from "@/components/ui/Text";
import { Call, User } from "iconsax-react-native";
import colors from "@/utils/colors";

const numbersData = [
  {
    id: "1",
    name: "Center for receiving reports against violence and harm",
    number: "1919",
  },
  {
    id: "2",
    name: "Child Helpline",
    number: "116111",
  },
  {
    id: "3",
    name: "Protection Committee in the Riyadh Region",
    number: "0112075242",
  },
  {
    id: "4",
    name: "The Protection Committee in the Makkah Region",
    number: "0126616688",
  },
  {
    id: "5",
    name: "The Protection Committee in the Eastern Region",
    number: "0138394922",
  },
  {
    id: "6",
    name: "The Protection Committee in Asir Region",
    number: "0172247087",
  },
  {
    id: "7",
    name: "The Protection Committee in Hail Region",
    number: "0165437944",
  },
  {
    id: "8",
    name: "The Protection Committee in Al-Madinah Region",
    number: "0148654117",
  },
  {
    id: "9",
    name: "The Protection Committee in Al-Qassim Region",
    number: "163853730",
  },
  {
    id: "10",
    name: "Protection Committee in Al-Jouf Region",
    number: "146250824",
  },
  {
    id: "11",
    name: "Protection Committee in Najran Region",
    number: "175290386",
  },
  {
    id: "12",
    name: "Protection Committee in Al-Baha Region",
    number: "177226932",
  },
  {
    id: "13",
    name: "Protection Committee in Tabuk Region",
    number: "144235048",
  },
  {
    id: "14",
    name: "Protection Committee in the Northern Borders Region",
    number: "146629932",
  },
];

export default function NumbersPage() {
  const handleCall = (number: string) => {
    Linking.openURL(`tel:${number}`).catch((err) =>
      console.error("Failed to make a call: ", err)
    );
  };

  return (
    <View className="bg-blue-50/20 h-full px-4">
      <FlatList
        data={numbersData}
        showsVerticalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        contentContainerClassName="gap-2 py-4"
        renderItem={({ item }) => (
          <View className="flex-row items-center justify-between bg-white p-4 rounded-2xl border-l-4 border-blue-500">
            <View className="flex-row items-center gap-2 flex-1">
              <View className="bg-blue-50/50 rounded-full p-1">
                <User size="24" color="#000" />
              </View>
              <View className="flex-col gap-2">
                <Text className="text-neutral-800 font-semibold text-base w-[80%] leading-5">
                  {item.name}
                </Text>
                <Text className="text-blue-500 font-semibold">
                  {item.number}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => handleCall(item.number)}
              className="flex-row items-center gap-2 "
            >
              <Call size="28" color={colors.blue[600]} />
            </TouchableOpacity>
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 16 }}
      />
    </View>
  );
}
