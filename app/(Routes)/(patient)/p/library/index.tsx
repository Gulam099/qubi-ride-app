import { View, Text, FlatList, ScrollView } from "react-native";
import React, { useState } from "react";
import { H3 } from "@/components/ui/Typography";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { toKebabCase } from "@/utils/string.utils";
import LibraryCard from "@/features/culturalLibrary/components/LibraryCard";
import { libraryContent } from "@/features/culturalLibrary/constLibrary";

export default function LibraryPage() {
  const [activeTab, setActiveTab] = useState("All");

  const handleCardPress = (id: number) => {
    console.log("Library Card Pressed:", id);
    // Navigate to details page or perform any action
  };

  // Filter content based on the active tab
  const filteredContent =
    activeTab === "All"
      ? libraryContent
      : libraryContent.filter(
          (item) => item.type.toLowerCase() === activeTab.toLowerCase()
        );

  return (
    <View className="p-4 pb-0 bg-blue-50/10 h-full flex flex-col gap-4">
      <H3>Cultural Libraries</H3>

      {/* Tabs for filtering */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 12, paddingBottom: 10 }}
      >
        {["All", "Video", "Article", "Audio"].map((tab) => {
          const isActiveTab = tab === activeTab;
          return (
            <Button
              key={tab}
              size={"sm"}
              className={cn(
                isActiveTab ? "bg-blue-900" : "bg-white",
                "w-32 h-9 rounded-xl"
              )}
              onPress={() => setActiveTab(tab)}
            >
              <Text
                className={cn(isActiveTab ? "text-white" : "", "font-medium")}
              >
                {tab}
              </Text>
            </Button>
          );
        })}
      </ScrollView>

      {/* List of Library Content */}
      <FlatList
        data={filteredContent}
        showsVerticalScrollIndicator={false}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <LibraryCard
            title={item.title}
            category={item.category}
            image={item.thumbnail}
            link={`/p/library/${toKebabCase(item.id)}`}
            type={item.type}
            seenCount={item.seenCount}
            rating={item.rating}
          />
        )}
        contentContainerClassName="gap-4 "
        ListEmptyComponent={() => (
          <Text className="text-gray-500 text-center">
            No content available.
          </Text>
        )}
      />
    </View>
  );
}
