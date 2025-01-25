import React from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { Stack, useLocalSearchParams } from "expo-router";
import { Button } from "@/components/ui/Button";
import { H3, H2 } from "@/components/ui/Typography";
import { libraryContent } from "@/features/culturalLibrary/constLibrary";
import BackButton from "@/features/Home/Components/BackButton";
import NotificationIconButton from "@/features/Home/Components/NotificationIconButton";
import ProfileImage from "@/features/account/components/ProfileImage";
import { Avatar, AvatarFallback } from "@/components/ui/Avatar";
import { toCapitalizeFirstLetter } from "@/utils/string.utils";
import { useVideoPlayer, VideoView } from "expo-video";

export default function LibraryPage() {
  const { library } = useLocalSearchParams();

  const videoSource =
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

  const player = useVideoPlayer(videoSource, (player) => {
    player.loop = true;
    player.play();
  });

  // Find the library item based on the `library` parameter
  const libraryItem = libraryContent.find((item) => item.id === library);

  if (!libraryItem) {
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
          <View className="flex flex-col gap-4">
            {/* <Image
              source={{ uri: libraryItem.thumbnail }}
              className="w-full h-56 rounded-lg"
              resizeMode="cover"
            /> */}
            <View className="flex-1 p-4 items-center justify-center">
              <VideoView
                player={player}
                allowsFullscreen
                allowsPictureInPicture
                className="w-full h-32 aspect-video "
              />
            </View>
            <View className="flex flex-row justify-between items-center">
              <Text className="text-gray-500">{libraryItem.duration}</Text>
              <Text className="text-gray-500">{libraryItem.rating} ★</Text>
            </View>
            <Button
              className="w-full bg-purple-600 py-3 rounded-md"
              onPress={() =>
                console.log(`Playing video: ${libraryItem.mediaUrl}`)
              }
            >
              <Text className="text-white font-semibold">Play Video</Text>
            </Button>
          </View>
        );
      case "audio":
        return (
          <View className="flex flex-col gap-4">
            <Image
              source={{ uri: libraryItem.thumbnail }}
              className="w-full h-56 rounded-lg"
              resizeMode="cover"
            />
            <View className="flex flex-row justify-between items-center">
              <Text className="text-gray-500">{libraryItem.duration}</Text>
              <Text className="text-gray-500">{libraryItem.rating} ★</Text>
            </View>
            <Button
              className="w-full bg-purple-600 py-3 rounded-md"
              onPress={() =>
                console.log(`Playing audio: ${libraryItem.mediaUrl}`)
              }
            >
              <Text className="text-white font-semibold">Play Audio</Text>
            </Button>
          </View>
        );
      case "article":
        return (
          <View className="flex flex-col gap-4">
            <Text className="text-lg font-semibold text-gray-700">
              {libraryItem.title}
            </Text>
            <Text className="text-gray-500">{libraryItem.publishedDate}</Text>
            <Image
              source={{ uri: libraryItem.thumbnail }}
              className="w-full h-56 rounded-lg"
              resizeMode="cover"
            />
            <Text className="text-gray-700">{libraryItem.content}</Text>
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

          {/* Subjects */}
          {libraryItem.subjects && libraryItem.subjects.length > 0 && (
            <View className="mb-6">
              <Text className="font-semibold text-xl">Subjects</Text>
              {libraryItem.subjects.map((subject, index) => (
                <Text key={index} className="text-gray-700">
                  • {subject.title} ({subject.time})
                </Text>
              ))}
            </View>
          )}

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
