import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import { CardContent } from "@/components/ui/Card";
import { currencyFormatter } from "@/utils/currencyFormatter.utils";
import { RelativePathString } from "expo-router";
import { router } from "expo-router";
import React from "react";
import { TouchableOpacity } from "react-native";
import { View, Text, Image } from "react-native";

interface FavLibraryCardProps {
  title: string;
  // type: string;
  category: string;
  // note: string;
  link: string;
  image: string[];
  // createdAt: string;
}

const FavLibraryCard: React.FC<FavLibraryCardProps> = ({
  title,
  // type,
  category,
  // note,
  link,
  image,
  // createdAt,
}) => {
  // const formattedDate = new Date(createdAt).toLocaleDateString("en-US", {
  //   month: "short",
  //   day: "numeric",
  //   year: "numeric"
  // });
  const imageUrl = image?.[0] ?? null;

  return (
    <TouchableOpacity
      onPress={() => router.push(link as RelativePathString)}
      className="flex-row gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-3"
    >
      <View className="w-24 h-24 rounded-lg overflow-hidden">
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            className="w-full h-full"
            resizeMode="cover"
          />
        ) : (
          <View className="w-full h-full bg-gray-200 flex items-center justify-center">
            <Text className="text-gray-500">No Image</Text>
          </View>
        )}
      </View>

      <View className="flex-1">
        <View className="flex-row items-center gap-2 mb-1">
          {/* <Text className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
            {type}
          </Text> */}
          <Text className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
            {category}
          </Text>
        </View>

        <Text className="font-semibold text-lg mb-1">{title}</Text>
        {/* 
        <Text
          className="text-gray-600 text-sm mb-2"
          numberOfLines={2}
          ellipsizeMode="tail"
        >
          {note}
        </Text>

        <Text className="text-xs text-gray-400">{formattedDate}</Text> */}
      </View>
    </TouchableOpacity>
  );
};

export default FavLibraryCard;