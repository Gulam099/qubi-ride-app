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
import { currencyFormatter } from "@/utils/currencyFormatter.utils";
import { Heart, Moneys, People } from "iconsax-react-native";
import React from "react";
import {
  View,
  Text,
  Image,
  ImageSourcePropType,
  TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { RelativePathString, useRouter } from "expo-router";

type LibraryCardProps = {
  title: string;
  category: string;
  type: string;
  recorded: number;
  rating: number;
  image: string;
  link: string; // Route to navigate to
  onJoin: () => void; // Custom handler for "Join"
  onLike: () => void;
};

export default function LibraryCard(props: LibraryCardProps) {
  const router = useRouter();
  const { title, category, type, link, onLike, onJoin, recorded, image } =
    props;

  const ArticalTypeIcon = type.toLowerCase() === "video";

  return (
    <Card className="w-full px-0">
      {/* Header with clickable title */}
      <TouchableOpacity onPress={() => router.push(link as RelativePathString)}>
        <CardHeader className="flex flex-row">
          <View className="w-2/3">
            <CardTitle className="text-xl">{title}</CardTitle>
            <CardDescription>{category}</CardDescription>
          </View>

          <View className="w-1/3 flex justify-end items-end">
            <Button
              className="aspect-square bg-primary-50/40 p-0 rounded-full"
              onPress={onLike}
            >
              <Heart size="24" color={colors.primary[500]} />
            </Button>
          </View>
        </CardHeader>
      </TouchableOpacity>

      {/* Content with clickable image */}
      <TouchableOpacity onPress={() => router.push(link as RelativePathString)}>
        <CardContent className="px-0 rounded-none">
          <Image
            source={image as ImageSourcePropType}
            className="w-full h-[undefined] aspect-video "
            resizeMode="cover"
          />
        </CardContent>
      </TouchableOpacity>

      {/* Footer with "Join" button */}
      <CardFooter className="flex flex-row justify-between items-center">
        <View className="flex flex-row gap-2 justify-center items-center">
          <View className="p-1 bg-blue-50/20 aspect-square rounded-full w-8 flex justify-center items-center">
            <Moneys size="18" color={colors.primary[900]} />
          </View>
          <Text className="font-medium">{type}</Text>
        </View>
        <View className="flex flex-row gap-2 justify-center items-center">
          <View className="p-1 bg-blue-50/20 aspect-square rounded-full w-8 flex justify-center items-center">
            <People size="18" color={colors.primary[900]} />
          </View>
          <Text className="font-medium">{recorded} seen</Text>
        </View>
        <Button onPress={onJoin}>
          <Text className="text-white font-semibold">Join</Text>
        </Button>
      </CardFooter>
    </Card>
  );
}
