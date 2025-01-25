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
  Heart,
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
  const onJoin = () => {
    console.log(`Joined ${title}`);
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

          {/* Like button */}
          <Button
            className="aspect-square bg-primary-50/40 p-0 rounded-full"
            onPress={onLike}
          >
            <Heart size="20" color={colors.primary[500]} />
          </Button>
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
      <CardFooter className="flex flex-row justify-between items-center mt-2">
        <View className="flex-row gap-4">

        {/* Type */}
        <View className="flex flex-row items-center gap-2">
          <View className="p-1 bg-blue-50/20 aspect-square rounded-full w-8 flex justify-center items-center">
            <Icon size="18" color={colors.primary[900]} />
          </View>
          <Text className="text-sm font-medium capitalize leading-6">{type}</Text>
        </View>

        {/* Seen Count */}
        <View className="flex flex-row items-center gap-2">
          <View className="p-1 bg-blue-50/20 aspect-square rounded-full w-8 flex justify-center items-center">
            <People size="18" color={colors.primary[900]} />
          </View>
          <Text className="text-sm font-medium leading-6">{seenCount} seen</Text>
        </View>
        </View>

        {/* Join Button */}
        <Button onPress={onJoin} className="py-1 px-4 bg-blue-600">
          <Text className="text-white font-medium text-sm leading-6">Join</Text>
        </Button>
      </CardFooter>
    </Card>
  );
}
