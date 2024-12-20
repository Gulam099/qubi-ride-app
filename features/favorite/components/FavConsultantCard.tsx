import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import colors from "@/utils/colors";
import { ExportCurve } from "iconsax-react-native";
import React from "react";
import { View, Image, Text } from "react-native";

type Consultant = {
  name: string;
  profession: string;
  image: string;
};

const FavConsultantCard: React.FC<Consultant> = ({
  name,
  profession,
  image,
}) => {
  return (
    <View className="flex-row gap-4 bg-background p-4 rounded-2xl">
      <Avatar alt="avatar-with-image" className="w-16 h-16">
        <AvatarImage source={{ uri: image }} />
        <AvatarFallback>
          <Text>UN</Text>
        </AvatarFallback>
      </Avatar>
      <View className="flex-1">
        <Text className="font-semibold text-lg">{name}</Text>
        <Text>{profession}</Text>
      </View>
      <View>
      <ExportCurve size={18} color={colors.primary[600]} />
      </View>
    </View>
  );
};

export default FavConsultantCard;
