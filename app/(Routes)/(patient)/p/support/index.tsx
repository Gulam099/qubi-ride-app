import { View, Text, FlatList, ScrollView } from "react-native";
import React, { useState } from "react";
import { H2, H3 } from "@/components/ui/Typography";
import {
  SupportGroupArray,
  supportGroups,
} from "@/features/supportGroup/constSupportGroup";
import SupportGroupCard from "@/features/supportGroup/components/SupportGroupCard";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { toKebabCase } from "@/utils/string.utils";

export default function SupportPage() {
  const [ActiveTab, setActiveTab] = useState("All");

  const handleCardPress = (id: number) => {
    console.log("Card Pressed:", id);
    // Navigate to details page or perform any action
  };

  const filteredGroups =
    ActiveTab === "All"
      ? supportGroups
      : supportGroups.filter(
          (group) => group.category.toLowerCase() === ActiveTab.toLowerCase()
        );

  return (
    <View className="p-4 bg-blue-50/10 h-full flex flex-col gap-2">
      <H3>Support Group</H3>

      <ScrollView
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="gap-4 py-2 "
      >
        {SupportGroupArray.map((e, i) => {
          const isActiveTabThis = e === ActiveTab;
          return (
            <Button
              key={e + i}
              size={"sm"}
              onPress={() => setActiveTab(e)}
              className={cn(
                isActiveTabThis ? "bg-blue-900" : "bg-white",
                "w-36 h-9 rounded-xl"
              )}
            >
              <Text
                className={cn(
                  isActiveTabThis ? "text-white" : "",
                  "font-medium"
                )}
              >
                {e}
              </Text>
            </Button>
          );
        })}
      </ScrollView>

      {/* List of Support Groups */}
      {filteredGroups.length > 0 ? (
        <FlatList
          data={filteredGroups}
          showsVerticalScrollIndicator={false}
          keyExtractor={(item) => item.id.toString()}
          contentContainerClassName=""
          renderItem={({ item }) => (
            <SupportGroupCard
              title={item.title}
              category={item.category}
              price={item.price}
              recorded={item.recorded}
              rating={item.rating}
              image={item.image}
              onPress={() => handleCardPress(item.id)}
              link={`/p/support/${toKebabCase(item.title)}`}
            />
          )}
          contentContainerStyle={{ gap: 16, paddingVertical: 10 }}
        />
      ) : (
        <View className="flex-1">
          <Text className="text-center text-gray-500 mt-4 ">
            No Group Available
          </Text>
        </View>
      )}
    </View>
  );
}
