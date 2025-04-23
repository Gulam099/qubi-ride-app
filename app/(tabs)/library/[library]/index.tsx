import React from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  ActivityIndicator,
} from "react-native";
import { Stack, useLocalSearchParams } from "expo-router";
import BackButton from "@/features/Home/Components/BackButton";
import NotificationIconButton from "@/features/Home/Components/NotificationIconButton";
import ProfileImage from "@/features/account/components/ProfileImage";
import { Avatar, AvatarFallback } from "@/components/ui/Avatar";
import { toCapitalizeFirstLetter } from "@/utils/string.utils";
import { useVideoPlayer } from "expo-video";
import { useQuery } from "@tanstack/react-query";
import VideoPlayer from "@/features/Home/Components/VideoPlayer";
import AudioPlayer from "@/features/Home/Components/AudioPlayer";

export default function LibraryPage() {
  const { library  } = useLocalSearchParams();

  const fetchLibraryContent = async () => {
    const res = await fetch(
      `https://www.baserah.sa/api/content/library?content_id=${library}`
    );
    const data = await res.json();
  
    if (!res.ok) {
      throw new Error(data.message || "Error fetching content");
    }
  
    return {
      data: data.data,
    };
  };

  const {
    data,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["libraryContent", library],
    queryFn: fetchLibraryContent,
  })

  

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#6B21A8" />
        <Text className="text-gray-500 mt-2">Loading Content...</Text>
      </View>
    );
  }

  // Find the library item based on the `library` parameter
  const libraryItem = data?.data || null;

  if (!libraryItem || isError) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-gray-500">Library content not found</Text>
      </View>
    );
  }

  // Render different types of content dynamically
  const renderContent = () => {
    switch (libraryItem.type.toLowerCase()) {
      case "video":
        return (
          <View className="flex flex-col gap-4 py-4">
            <VideoPlayer VideoUri={libraryItem.mediaUrl} />
          </View>
        );
      case "audio":
        return (
          <View className="flex flex-col gap-4 py-4">
            <AudioPlayer
              AudioUri={libraryItem.mediaUrl}
              thumbnail={{ url: libraryItem.thumbnail, type: "full" }}
            />
          </View>
        );
      case "article":
        return (
          <View className="flex flex-col gap-4 py-4">
            <Image
              source={{ uri: libraryItem.thumbnail }}
              className="w-full aspect-video rounded-lg"
              resizeMode="cover"
            />
            <Text className="text-gray-700">{libraryItem.content}</Text>
            <Text className="text-gray-500">{libraryItem.publishedDate}</Text>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerShadowVisible: false,
          headerTitle: () => (
            <Text className="font-semibold text-lg leading-8">
              {libraryItem.title}
            </Text>
          ),
          headerLeft: () => <BackButton />,
          headerRight: () => <NotificationIconButton className="mr-4" />,
        }}
      />
      <ScrollView className="px-4 bg-blue-50/10 flex-1 ">
        <View className="gap-4">
          {/* Dynamic Content */}
          <View className="">{renderContent()}</View>
          {/* Header */}
          <Text className="font-semibold text-xl">{libraryItem.title}</Text>
          <Text className="text-gray-500 capitalize">
            {libraryItem.category}
          </Text>
          <Text className="text-gray-600 mt-4">{libraryItem.description}</Text>

          {/* Author */}
          {libraryItem.author && (
            <View className="items-center bg-white flex-row gap-2 py-4 px-6 rounded-2xl">
              <ProfileImage
                className="size-16"
                imageUrl={libraryItem.author.profileImage}
                name={libraryItem.author.name}
              />
              <View className="flex-col gap-1">
                <Text className="text-gray-800 mt-2 text-center font-medium text-lg">
                  {libraryItem.author.name}
                </Text>
                <Text className="text-gray-500 text-sm">
                  {libraryItem.author.specialization}
                </Text>
              </View>
            </View>
          )}

          {/* Feedback */}

          {libraryItem.feedback && libraryItem.feedback.length > 0 && (
            <View className=" gap-2">
              <Text className="font-semibold text-xl">Feedback</Text>
              {libraryItem.feedback.map((item: any, index: any) => (
                <View
                  key={index}
                  className="flex-row justify-between items-center py-4 gap-2 bg-white rounded-2xl px-4 "
                >
                  <View className="flex-row items-center">
                    <Avatar alt="avatar-without-image">
                      <AvatarFallback className="bg-primary-700">
                        <Text className="text-white font-semibold">
                          {toCapitalizeFirstLetter(item.user.slice(0, 1))}
                        </Text>
                      </AvatarFallback>
                    </Avatar>
                  </View>
                  <View className="flex-1 w-full">
                    <View className="flex-row justify-between">
                      <Text>{item.user}</Text>
                      <Text className="text-sm text-neutral-500">
                        {item.date}
                      </Text>
                    </View>

                    <Text className="text-sm text-blue-600">
                      {item.comment}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </>
  );
}
