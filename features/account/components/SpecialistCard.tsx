import React from "react";
import { View, Text, Image, TouchableOpacity, Touchable } from "react-native";
import { Heart, Share, Clock, Share2 } from "lucide-react-native"; // Replace with your icons library
import { currencyFormatter } from "@/utils/currencyFormatter.utils";
import colors from "@/utils/colors";
import { Button } from "@/components/ui/Button";
import { EmptyWalletTick } from "iconsax-react-native";
import ProfileImage from "./ProfileImage";

type SpecialistCardProps = {
  name: string;
  title: string;
  price: number;
  likes: number;
  imageUrl: string;
  shareLink: string;
  onPress: () => void;
};

export default function SpecialistCard({
  name,
  title,
  price,
  likes,
  imageUrl,
  shareLink,
  onPress,
}: SpecialistCardProps) {
  return (
    <View className="flex-row items-center bg-white  rounded-lg overflow-hidden relative ">
      {/* Specialist Image */}
      <TouchableOpacity onPress={onPress} className="size-42">
        {/* <Image
          source={{ uri: imageUrl }}
          className="w-36 h-36 "
          resizeMode="cover"
        /> */}
        <ProfileImage
          imageUrl={imageUrl}
          name={"name"}
          className="rounded-none size-36 border-none border-transparent "
        />
      </TouchableOpacity>

      {/* Specialist Info */}
      <View className="flex-1 px-4 py-3 flex-col gap-1">
        <TouchableOpacity onPress={onPress}>
          <Text className="text-blue-700 text-lg font-semibold">
            {name ?? "No name Found"}
          </Text>
        </TouchableOpacity>
        <Text className="text-gray-600 ">
          {title ?? "No specialization Found"}
        </Text>

        {/* Price and Duration */}
        <View className="flex-row items-center gap-1">
          <Text className="text-gray-800 font-bold mr-2">
            {price == 0  ?   "Free": currencyFormatter(price)}
          </Text>
          <View className="p-1 bg-blue-50/20 aspect-square rounded-full w-8  flex justify-center items-center">
            <EmptyWalletTick size="16" color={colors.primary[900]} />
          </View>

          <Text className="text-gray-600 ml-1">{likes}</Text>
          <View className="p-1 bg-blue-50/20 aspect-square rounded-full w-8  flex justify-center items-center">
            <Heart size="16" color={colors.primary[900]} />
          </View>
        </View>
      </View>

      {/* Actions */}
      <View className="flex-row gap-3 absolute top-2 right-2">
        <TouchableOpacity>
          <Share2 size={20} color="#6b7280" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
