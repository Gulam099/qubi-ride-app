import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import { currencyFormatter } from "@/utils/currencyFormatter.utils";
import React from "react";
import { View, Text, Image } from "react-native";

interface FavLibraryCardProps {
  title: string;

  price: string;
  date: string;
  image: string;
}

const FavLibraryCard: React.FC<FavLibraryCardProps> = ({
  title,

  price,
  date,
  image,
}) => {
  const formattedDate = new Date(date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
  });

  return (
    <View className="flex-row gap-4 bg-background p-4 rounded-2xl">
      <Avatar alt="avatar-with-image" className="w-16 h-16 ">
        <AvatarImage source={{ uri: image }} />
        <AvatarFallback>
          <Text>L</Text>
        </AvatarFallback>
      </Avatar>
      <View className="flex-1">
        <Text className="font-semibold text-lg">{title}</Text>
      </View>
      <View>
        <Text>{currencyFormatter(price)}</Text>
        <Text>{formattedDate}</Text>
      </View>
    </View>
  );
};

export default FavLibraryCard;
