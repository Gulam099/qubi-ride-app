import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import colors from "@/utils/colors";
import {
  AudioSquare,
  ExportCurve,
  Heart,
  Message,
  Moneys,
  Notepad,
  People,
  VideoHorizontal,
} from "iconsax-react-native";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  ImageSourcePropType,
  TouchableOpacity,
} from "react-native";
import { RelativePathString, useRouter } from "expo-router";
import { apiNewUrl, ApiUrl } from "@/const";
import { useUser } from "@clerk/clerk-expo";
import { toast } from "sonner-native";

type LibraryCardProps = {
  contentId: string;
  title: string;
  category: string;
  type: string;
  seenCount: number;
  rating: number;
  image: string;
  link: string; // Route to navigate to
};

export default function LibraryCard(props: LibraryCardProps) {
  const router = useRouter();
  const { title, category, type, link, seenCount, image, contentId } = props;

  // Define icons based on type
  const IconList: Record<string, React.ElementType> = {
    video: VideoHorizontal,
    article: Notepad,
    audio: AudioSquare,
  };
  const Icon = IconList[type.toLowerCase()] || Notepad;
  const { user } = useUser();
  const userId = user?.publicMetadata.dbPatientId as string;
  const [isFavorited, setIsFavorited] = useState(false);

  console.log("isfavorited", isFavorited);
  useEffect(() => {
    const checkFavorites = async () => {
      try {
        const res = await fetch(`${ApiUrl}/api/favorites/culturalContent/${userId}`);
        const data = await res.json();
        console.log("data??", data);

        if (res.ok && data?.data) {
          // Fixed: Check if contentId exists in the data array directly
          const isInFavorites = data.data.some(
            (item) => item._id?.toString() === contentId?.toString()
          );
          console.log("isInFavorites", isInFavorites);

          setIsFavorited(isInFavorites);
        } else {
          setIsFavorited(false);
        }
      } catch (e) {
        console.error("Error checking favorites:", e);
        setIsFavorited(false);
      }
    };

    if (userId && contentId) {
      checkFavorites();
    }
  }, [userId, contentId]);

  const handleAddToFavorites = async () => {
    try {
      const response = await fetch(`${ApiUrl}/api/favorites/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, itemId: contentId, type: "culturalContent" }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Failed to add");
      toast.success("Added to favorites!");
      setIsFavorited(true);
    } catch (err) {
      toast.error("Something went wrong");
    }
  };

  const handleRemoveFromFavorites = async () => {
    try {
      const response = await fetch(`${ApiUrl}/api/favorites/remove`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, itemId: contentId, type: "culturalContent" }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Failed to remove");
      toast.success("Removed from favorites!");
      setIsFavorited(false);
    } catch (err) {
      toast.error("Something went wrong");
    }
  };

  // Handlers
  const onLike = () => {
    console.log(`Liked ${title}`);
  };
  const onComment = () => {
    console.log(`Comment on ${title}`);
  };

  const handleDelete = async () => {
    try {
      // Extract the ID from the link
      const segments = props.link.split("/");
      const id = segments[segments.length - 1];

      const response = await fetch(`${apiNewUrl}/api/library/delete/${id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (response.ok && result.status === 200) {
        console.log("Deleted successfully");
        // toast.success("Content deleted!");
        // Optionally: trigger refresh or navigation
      } else {
        console.error("Delete failed:", result.message);
        // toast.error(result.message || "Delete failed");
      }
    } catch (error) {
      console.error("Delete error:", error);
      // toast.error("An error occurred during deletion");
    }
  };

  return (
    <Card className="w-full">
      {/* Header with clickable title */}
      <TouchableOpacity onPress={() => router.push(link as RelativePathString)}>
        <CardHeader className="flex flex-row justify-between items-start">
          <View className="flex-1 pr-4">
            <CardTitle className="text-lg font-semibold">{title}</CardTitle>
            <CardDescription className="text-sm text-gray-500 capitalize">
              {category}
            </CardDescription>
          </View>
        </CardHeader>
      </TouchableOpacity>

      {/* Content with clickable image */}
      <TouchableOpacity onPress={() => router.push(link as RelativePathString)}>
        <CardContent className="p-0">
          <Image
            source={{ uri: image }}
            className="w-full h-64 "
            resizeMode="cover"
          />
        </CardContent>
      </TouchableOpacity>

      {/* Footer with type, seen count, and Join button */}
      <CardFooter className="flex-row flex-wrap gap-3 mt-2">
        {/* Reusable Icon Box */}
        <View className="flex-row gap-6">
          {/* Like */}
          <View className="items-center">
            <TouchableOpacity
              onPress={isFavorited ? handleRemoveFromFavorites : handleAddToFavorites}
              className="w-11 h-11 rounded-full bg-purple-100 justify-center items-center"
            >
              <Heart
                size="24"
                color={isFavorited ? "red" : colors.primary[500]}
                variant={isFavorited ? "Bold" : "Linear"}
              />
            </TouchableOpacity>

          </View>

          {/* Comment */}
          <View className="items-center">
            <TouchableOpacity
              onPress={onComment}
              className="w-11 h-11 rounded-full bg-purple-100 justify-center items-center"
            >
              <Message size="24" color={colors.primary[500]} />
            </TouchableOpacity>
          </View>
          {/* shere */}
          <View className="items-center">
            <View className="w-11 h-11 rounded-full bg-purple-100 justify-center items-center">
              <ExportCurve size="22" color={colors.primary[500]} />
            </View>
            <Text className="text-xs mt-1 capitalize text-center">
              {0} share
            </Text>
          </View>
          {/* Type */}
          <View className="items-center">
            <View className="w-11 h-11 rounded-full bg-purple-100 justify-center items-center">
              <Icon size="22" color={colors.primary[500]} />
            </View>
            <Text className="text-xs mt-1 capitalize text-center">{type}</Text>
          </View>

          {/* Seen Count */}
          <View className="items-center">
            <View className="w-11 h-11 rounded-full bg-purple-100 justify-center items-center">
              <People size="22" color={colors.primary[500]} />
            </View>
            <Text className="text-xs mt-1">{seenCount} seen</Text>
          </View>
        </View>
      </CardFooter>
    </Card>
  );
}