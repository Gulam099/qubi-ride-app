import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  ActivityIndicator,
  Dimensions,
  Modal,
  Pressable,
  TouchableOpacity,
} from "react-native";
import { Stack, useLocalSearchParams } from "expo-router";
import { Button } from "@/components/ui/Button";
import BackButton from "@/features/Home/Components/BackButton";
import NotificationIconButton from "@/features/Home/Components/NotificationIconButton";
import ProfileImage from "@/features/account/components/ProfileImage";
import { Avatar, AvatarFallback } from "@/components/ui/Avatar";
import { toCapitalizeFirstLetter } from "@/utils/string.utils";
import { toast } from "sonner-native";
import { ExportCurve, Heart, Star1 } from "iconsax-react-native";
import colors from "@/utils/colors";
import VideoPlayer from "@/features/Home/Components/VideoPlayer";
import AudioPlayer from "@/features/Home/Components/AudioPlayer";
import { apiNewUrl } from "@/const";
import { useUser } from "@clerk/clerk-expo";
import { t } from "i18next";
const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;

export default function LibraryPage() {
  const { library } = useLocalSearchParams();
  const [libraryItem, setLibraryItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user } = useUser();
  const userId = user?.publicMetadata?.dbPatientId as string;
  const [isImageModalVisible, setImageModalVisible] = useState(false);
  const [imageScale, setImageScale] = useState(1);
  const [translateX, setTranslateX] = useState(0);
  const [translateY, setTranslateY] = useState(0);

  const handleZoomIn = () => {
    setImageScale((prev) => Math.min(prev + 0.5, 4)); // Max zoom 4x
  };
  const handleZoomOut = () => {
    setImageScale((prev) => Math.max(prev - 0.5, 1)); // Min zoom 1x
    if (imageScale - 0.5 <= 1) {
      setTranslateX(0);
      setTranslateY(0);
    }
  };
  const resetZoom = () => {
    setImageScale(1);
    setTranslateX(0);
    setTranslateY(0);
  };
  useEffect(() => {
    const fetchLibraryContent = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${apiNewUrl}/api/library/getbyid/${library}`
        );
        const result = await response.json();

        if (response.ok && result.status === 200) {
          setLibraryItem(result.data);
        } else {
          setError(result.message || "Failed to fetch content.");
          toast.error(result.message || "Error loading content.");
        }
      } catch (err) {
        setError("Error fetching library content.");
        toast.error("Error fetching library content.");
      } finally {
        setLoading(false);
      }
    };

    fetchLibraryContent();
  }, [library]);

  useEffect(() => {
    const incrementSeen = async () => {
      try {
        const response = await fetch(`${apiNewUrl}/api/library/seen`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ library, userId }),
        });
      } catch (error) {
        console.error("Failed to update seen count:", error);
      }
    };

    if (library && userId) {
      incrementSeen();
    }
  }, [library, userId]);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#6B21A8" />
        <Text className="text-gray-500 mt-2">{t("Loading...")}</Text>
      </View>
    );
  }

  if (!libraryItem || error) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-gray-500">{error || "Content not found"}</Text>
      </View>
    );
  }

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
            {/* Image with zoom modal */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setImageModalVisible(true)}
            >
              <Image
                source={{ uri: libraryItem.thumbnail }}
                className="w-full aspect-video rounded-lg"
                resizeMode="cover"
                style={{ borderRadius: 12 }}
              />
            </TouchableOpacity>

            <Text className="text-gray-700">{libraryItem.content}</Text>
            <Text className="text-gray-500">{libraryItem.publishedDate}</Text>

            {/* Zoom Image Modal */}
            <Modal
              visible={isImageModalVisible}
              transparent={true}
              animationType="fade"
              onRequestClose={() => {
                setImageModalVisible(false);
                resetZoom();
              }}
            >
              <View
                style={{
                  flex: 1,
                  backgroundColor: "rgba(0,0,0,0.9)",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                {/* Top Controls */}
                <View
                  style={{
                    position: "absolute",
                    top: 50,
                    left: 30,
                    right: 30,
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    zIndex: 10,
                  }}
                >
                  {/* Zoom Level Indicator */}
                  <Text style={{ color: "white", fontSize: 16 }}>
                    {Math.round(imageScale * 100)}%
                  </Text>

                  {/* Close button */}
                  <Pressable
                    onPress={() => {
                      setImageModalVisible(false);
                      resetZoom();
                    }}
                    style={{
                      padding: 10,
                      backgroundColor: "rgba(255,255,255,0.3)",
                      borderRadius: 20,
                    }}
                  >
                    <Text style={{ color: "white", fontSize: 18 }}>✕</Text>
                  </Pressable>
                </View>

                {/* Scrollable Image Container */}
                <ScrollView
                  style={{ flex: 1, width: screenWidth }}
                  contentContainerStyle={{
                    justifyContent: "center",
                    alignItems: "center",
                    minHeight: screenHeight,
                  }}
                  showsHorizontalScrollIndicator={false}
                  showsVerticalScrollIndicator={false}
                  scrollEnabled={imageScale > 1} // Only allow scrolling when zoomed
                >
                  <Image
                    source={{ uri: libraryItem.thumbnail }}
                    style={{
                      width: screenWidth * imageScale,
                      height: screenHeight * 0.7 * imageScale,
                      transform: [
                        { translateX: translateX },
                        { translateY: translateY },
                      ],
                    }}
                    resizeMode="contain"
                  />
                </ScrollView>

                {/* Bottom Zoom Controls */}
                <View
                  style={{
                    position: "absolute",
                    bottom: 50,
                    left: 30,
                    right: 30,
                    flexDirection: "row",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: 20,
                    zIndex: 10,
                  }}
                >
                  {/* Zoom Out Button */}
                  <Pressable
                    onPress={handleZoomOut}
                    disabled={imageScale <= 1}
                    style={{
                      padding: 15,
                      backgroundColor:
                        imageScale <= 1
                          ? "rgba(255,255,255,0.2)"
                          : "rgba(255,255,255,0.3)",
                      borderRadius: 25,
                      minWidth: 50,
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{
                        color:
                          imageScale <= 1 ? "rgba(255,255,255,0.5)" : "white",
                        fontSize: 20,
                        fontWeight: "bold",
                      }}
                    >
                      −
                    </Text>
                  </Pressable>

                  {/* Reset Button */}
                  <Pressable
                    onPress={resetZoom}
                    style={{
                      padding: 12,
                      backgroundColor: "rgba(255,255,255,0.3)",
                      borderRadius: 20,
                    }}
                  >
                    <Text style={{ color: "white", fontSize: 14 }}>Reset</Text>
                  </Pressable>

                  {/* Zoom In Button */}
                  <Pressable
                    onPress={handleZoomIn}
                    disabled={imageScale >= 4}
                    style={{
                      padding: 15,
                      backgroundColor:
                        imageScale >= 4
                          ? "rgba(255,255,255,0.2)"
                          : "rgba(255,255,255,0.3)",
                      borderRadius: 25,
                      minWidth: 50,
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{
                        color:
                          imageScale >= 4 ? "rgba(255,255,255,0.5)" : "white",
                        fontSize: 20,
                        fontWeight: "bold",
                      }}
                    >
                      +
                    </Text>
                  </Pressable>
                </View>

                {/* Pan Controls (when zoomed in) */}
                {imageScale > 1 && (
                  <View
                    style={{
                      position: "absolute",
                      right: 30,
                      top: "50%",
                      transform: [{ translateY: -80 }],
                      flexDirection: "column",
                      gap: 15,
                      zIndex: 10,
                    }}
                  >
                    {/* Up */}
                    {/* <Pressable
                      onPress={() => setTranslateY((prev) => prev + 20)}
                      style={{
                        padding: 10,
                        backgroundColor: "rgba(255,255,255,0.3)",
                        borderRadius: 15,
                        alignItems: "center",
                      }}
                    >
                      <Text style={{ color: "white", fontSize: 16 }}>↑</Text>
                    </Pressable>

                    {/* Down */}
                    {/* <Pressable
                      onPress={() => setTranslateY((prev) => prev - 20)}
                      style={{
                        padding: 10,
                        backgroundColor: "rgba(255,255,255,0.3)",
                        borderRadius: 15,
                        alignItems: "center",
                      }}
                    >
                      <Text style={{ color: "white", fontSize: 16 }}>↓</Text>
                    </Pressable> */}

                    {/* Left */}
                    <Pressable
                      onPress={() => setTranslateX((prev) => prev + 20)}
                      style={{
                        padding: 10,
                        backgroundColor: "rgba(255,255,255,0.3)",
                        borderRadius: 15,
                        alignItems: "center",
                      }}
                    >
                      <Text style={{ color: "white", fontSize: 16 }}>←</Text>
                    </Pressable>

                    {/* Right */}
                    <Pressable
                      onPress={() => setTranslateX((prev) => prev - 20)}
                      style={{
                        padding: 10,
                        backgroundColor: "rgba(255,255,255,0.3)",
                        borderRadius: 15,
                        alignItems: "center",
                      }}
                    >
                      <Text style={{ color: "white", fontSize: 16 }}>→</Text>
                    </Pressable>
                  </View>
                )}
              </View>
            </Modal>
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
        <View className="gap-4 pb-8">
          {renderContent()}
          {/* <View className="flex-row gap-2 justify-between items-center">
            <View className="flex-row gap-2 items-center ">
              <Button className="aspect-square bg-primary-50/40 p-0 size-4 rounded-full">
                <Heart size="16" color={colors.primary[500]} />
              </Button>
              <Text className="text-xs">
                {libraryItem.likes} Add to Favorites
              </Text>
            </View>
            <View className="flex-row gap-2 items-center ">
              <Button className="aspect-square bg-primary-50/40 p-0 size-4 rounded-full">
                <ExportCurve size="16" color={colors.primary[500]} />
              </Button>
              <Text className="text-xs">{libraryItem.shares} Share</Text>
            </View>
            <View className="flex-row gap-2 items-center ">
              <Button className="aspect-square bg-primary-50/40 p-0 size-4 rounded-full">
                <Star1 size="16" color={colors.primary[500]} />
              </Button>
              <Text className="text-xs">{libraryItem.rating} Rate</Text>
            </View>
          </View> */}
          <Text className="font-semibold text-xl">{libraryItem.title}</Text>
          <Text className="text-gray-500 capitalize">
            {libraryItem.category}
          </Text>
          <Text className="text-gray-600 mt-4">{libraryItem.note}</Text>

          {/* Author */}
          {libraryItem.author && (
            <View className="items-center bg-white flex-row gap-2 py-4 px-6 rounded-2xl">
              <ProfileImage
                className="size-16"
                imageUrl={libraryItem.doctorId.profile_picture}
                name={libraryItem.author.name}
              />
              <View className="flex-col gap-1">
                <Text className="text-gray-800 mt-2 text-center font-medium text-lg">
                  {libraryItem.doctorId.full_name}
                </Text>
                <Text className="text-gray-500 text-sm">
                  {libraryItem.doctorId.specialization}
                </Text>
              </View>
            </View>
          )}

          {/* Feedback */}
          {/* {libraryItem.feedback && libraryItem.feedback.length > 0 && (
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
          )} */}
        </View>
      </ScrollView>
    </>
  );
}
