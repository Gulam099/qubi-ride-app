import { View, Text, FlatList, ScrollView } from "react-native";
import React, { useState, useEffect } from "react";
import { H3 } from "@/components/ui/Typography";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import LibraryCard from "@/features/culturalLibrary/components/LibraryCard";
import { toast } from "sonner-native";
import { apiNewUrl } from "@/const";

export default function LibraryPage() {
  const [activeTab, setActiveTab] = useState("All");
  const [libraryContent, setLibraryContent] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLibraryContent = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${apiNewUrl}/doctors/library/cultural`
        );
        const result = await response.json();

        if (response.ok && result.data) {
          const approvedContent = result.data.filter(
            (item: any) => item.status === "Approveds"
          );
          setLibraryContent(approvedContent);
        } else {
          throw new Error(result.message || "Failed to fetch library content.");
        }
      } catch (error) {
        console.error("Error fetching library content:", error);
        toast.error("Error loading library content.");
      } finally {
        setLoading(false);
      }
    };

    fetchLibraryContent();
  }, []);

  // Filter content based on the active tab
  const filteredContent =
    activeTab === "All"
      ? libraryContent
      : libraryContent.filter(
          (item) => item.type.toLowerCase() === activeTab.toLowerCase()
        );

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-gray-500">Loading...</Text>
      </View>
    );
  }

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
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <LibraryCard
            title={item.title}
            category={item.category}
            image={item.resources[0] || "https://placehold.co/200"}
            link={`/p/library/${item._id}`}
            type={item.type}
            seenCount={item.favorites || 0}
            rating={item.rating || 0}
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
