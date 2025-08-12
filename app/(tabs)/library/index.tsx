import {
  View,
  Text,
  FlatList,
  ScrollView,
  ActivityIndicator,
  Pressable,
} from "react-native";
import React, { useCallback, useState } from "react";
import { H3 } from "@/components/ui/Typography";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import LibraryCard from "@/features/culturalLibrary/components/LibraryCard";
import { toast } from "sonner-native";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { ApiUrl } from "@/const";
import { useFocusEffect } from "@react-navigation/native";
import { useTranslation } from "react-i18next";

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
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useInfiniteQuery({
    queryKey: ["library"],
    queryFn: fetchLibrary,
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.hasNext ? lastPage.nextPage : undefined,
  });
  useFocusEffect(
    useCallback(() => {
      queryClient.invalidateQueries(["library"]);
    }, [])
  );
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
        <Text className="text-gray-500 mt-2">{t("Loading")}</Text>
      </View>
    );
  }

  if (isError) {
    toast.error("Failed to load content.");
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-gray-500">{t("SomethingWentWrong")}</Text>
      </View>
    );
  }

  const getYoutubeThumbnail = (url: string | undefined) => {
    if (!url) return "https://placehold.co/300x200?text=No+Thumbnail";

    const videoIdMatch = url.match(
      /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/))([^?&"/]+)/
    );
    return videoIdMatch
      ? `https://img.youtube.com/vi/${videoIdMatch[1]}/hqdefault.jpg`
      : "https://placehold.co/300x200?text=No+Thumbnail";
  };
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
            const isActive = activeTab === tab;
            return (
              <Pressable
                key={tab}
                onPress={() => setActiveTab(tab)}
                style={{
                  backgroundColor: isActive ? "#000F8F" : "#E5E7EB", // green-600 / gray-200
                  paddingHorizontal: 16,
                  height: 36,
                  borderRadius: 16,
                  justifyContent: "center",
                  alignItems: "center",
                  minWidth: 96,
                }}
              >
                <Text
                  style={{
                    color: isActive ? "white" : "black",
                    fontWeight: "500",
                  }}
                >
                  {t(tab)}
                </Text>
              </Pressable>
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
              image={
                item.type === "Video" || item.type === "فيديو"
                  ? getYoutubeThumbnail(item.videoLink)
                  : item.thumbnail || "https://placehold.co/200"
              }
              link={`/library/${item._id}`}
              type={item.type}
              seenCount={item.seenCount || 0}
              likeCount={item.likeCount || 0}
              rating={item.rating || 0}
              comments={item.comments || []} // Pass real comments from DB
              shareCount={item.shareCount || 0} // Pass real share count from DB
              contentId={item._id} // Pass content ID for API calls
              onAddComment={(comment) => {
                // Handle comment addition if needed
              }}
            />
          )}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          onRefresh={refetch}
          refreshing={isRefetching}
          contentContainerClassName="gap-4 pb-8"
          ListEmptyComponent={() => (
            <Text className="text-gray-500 text-center">
              {t("NoContentAvailable")}
            </Text>
          )}
        />
      </View>
    </>
  );
}
