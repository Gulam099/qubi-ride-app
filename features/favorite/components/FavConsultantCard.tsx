import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import colors from "@/utils/colors";
import { ExportCurve, Trash } from "iconsax-react-native";
import React from "react";
import { TouchableOpacity } from "react-native";
import { View, Image, Text } from "react-native";

type Consultant = {
  name: string;
  profession: string;
  image: string;
  education: string;
  // onRemove: () => void;
};

const FavConsultantCard: React.FC<Consultant> = ({
  name,
  // onRemove,
  profession,
  image,
  education,
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
        <Text>{education}</Text>
      </View>
      <View>
        {/* <ExportCurve size={18} color={colors.primary[600]} /> */}
        {/* <TouchableOpacity
          className="mt-2 text-red-500 rounded-md self-start"
          onPress={onRemove}
        >
          < Trash />
        </TouchableOpacity> */}
      </View>
    </View>
  );
};

export default FavConsultantCard;
