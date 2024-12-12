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
  return (
    <View className="p-4 bg-blue-50/10 h-full flex flex-col gap-4">
      <H3>Support Group</H3>

      <ScrollView
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 12, paddingBottom: 10 }}
      >
        {SupportGroupArray.map((e, i) => {
          const isActiveTabThis = e === ActiveTab;
          return (
            <Button
              key={e + i}
              size={"sm"}
              className={cn(
                isActiveTabThis ? "bg-blue-900" : "bg-white",
                "w-36 h-9 rounded-xl  "
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
      <FlatList
        data={supportGroups}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <SupportGroupCard
            title={item.title}
            category={item.category}
            price={item.price}
            recorded={item.recorded}
            rating={item.rating}
            image={item.image}
            onPress={() => handleCardPress(item.id)} link={`p/support/${toKebabCase(item.title)}/index`}          />
        )}
        contentContainerStyle={{ gap: 16, paddingVertical: 10 }}
      />
    </View>
  );
}
