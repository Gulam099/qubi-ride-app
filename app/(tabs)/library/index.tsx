import {
  View,
  Text,
  FlatList,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import React, { useState } from "react";
import { H3 } from "@/components/ui/Typography";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import LibraryCard from "@/features/culturalLibrary/components/LibraryCard";
import { toast } from "sonner-native";
import { useInfiniteQuery } from "@tanstack/react-query";
import { ApiUrl } from "@/const";

const PAGE_SIZE = 10;

const fetchLibrary = async ({ pageParam = 1 }) => {
  const res = await fetch(
    `${ApiUrl}/api/library/approved?page=${pageParam}&limit=${PAGE_SIZE}`
  );
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Error fetching content");
  }

  return {
    data: data.data || [],
    hasNext: data.hasNext,
    nextPage: pageParam + 1,
  };
};

export default function LibraryPage() {
  const [activeTab, setActiveTab] = useState("All");

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteQuery({
    queryKey: ["library"],
    queryFn: fetchLibrary,
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.hasNext ? lastPage.nextPage : undefined,
  });

  const allContent = data?.pages.flatMap((page) => page.data) ?? [];

  const filteredContent =
    activeTab === "All"
      ? allContent
      : allContent.filter(
          (item) => item.type?.toLowerCase() === activeTab.toLowerCase()
        );

  const loadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const handleShareUpdate = (contentId) => {
    // Update the specific item's share count in the cached data
    // This is a local update to provide immediate feedback
    console.log(`Share count updated for content: ${contentId}`);
    // Optionally refetch data to get the latest counts
    // refetch();
  };

  console.log('filteredContent',filteredContent)
  const renderFooter = () =>
    isFetchingNextPage ? (
      <View className="py-4">
        <ActivityIndicator size="small" />
      </View>
    ) : null;

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator />
        <Text className="text-gray-500 mt-2">Loading...</Text>
      </View>
    );
  }

  if (isError) {
    toast.error("Failed to load content.");
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-gray-500">Something went wrong.</Text>
      </View>
    );
  }

  return (
    <>
      <View className="p-4 pb-0 bg-blue-50/10 h-full flex flex-col gap-4">
        {/* <H3>Cultural Libraries</H3> */}

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
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <LibraryCard
              title={item.title}
              category={item.category}
              image={item.thumbnail || "https://placehold.co/200"}
              link={`/library/${item._id}`}
              type={item.type}
              seenCount={item.favorites || 0}
              rating={item.rating || 0}
              comments={item.comments || []} // Pass real comments from DB
              shareCount={item.shareCount || 0} // Pass real share count from DB
              contentId={item._id} // Pass content ID for API calls
              onAddComment={(comment) => {
                // Handle comment addition if needed
              }}
              onShare={() => handleShareUpdate(item._id)}
            />
          )}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          contentContainerClassName="gap-4 pb-8"
          ListEmptyComponent={() => (
            <Text className="text-gray-500 text-center">
              No content available.
            </Text>
          )}
        />
      </View>
    </>
  );
}
