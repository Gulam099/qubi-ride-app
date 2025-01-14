import { View } from "react-native";
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import { Text } from "@/components/ui/Text";
import { cn } from "@/lib/utils";

export default function ProfileImage(props: {
  imageUrl: string | null;
  name: string | null;
  className?: string;
}) {
  const { imageUrl, name, className } = props;
  return (
    <Avatar
      alt="avatar-with-image"
      className={cn("size-24 border-2 border-neutral-500", className)}
    >
      {imageUrl && (
        <AvatarImage
          source={{
            uri: imageUrl,
          }}
        />
      )}
      <AvatarFallback className="bg-primary-600">
        <Text className="text-3xl text-center font-semibold text-white font-sans">
          {name === null ? "U" : name.slice(0, 1)}
        </Text>
      </AvatarFallback>
    </Avatar>
  );
}
