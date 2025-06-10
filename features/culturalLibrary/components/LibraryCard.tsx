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
import React from "react";
import {
  View,
  Text,
  Image,
  ImageSourcePropType,
  TouchableOpacity,
} from "react-native";
import { RelativePathString, useRouter } from "expo-router";
import { apiNewUrl } from "@/const";

type LibraryCardProps = {
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
  const { title, category, type, link, seenCount, image } = props;

  // Define icons based on type
  const IconList: Record<string, React.ElementType> = {
    video: VideoHorizontal,
    article: Notepad,
    audio: AudioSquare,
  };
  const Icon = IconList[type.toLowerCase()] || Notepad;

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
              onPress={onLike}
              className="w-11 h-11 rounded-full bg-purple-100 justify-center items-center"
            >
              <Heart size="24" color={colors.primary[500]} />
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
