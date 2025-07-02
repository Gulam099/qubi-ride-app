import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import { Button } from "@/components/ui/Button";
import { IconType } from "@/features/Home/types/home.type";
import { cn } from "@/lib/utils";
import { Link, RelativePathString, router } from "expo-router";
import { LucideIcon } from "lucide-react-native";

export default function AccountCard(props: {
  className?: string;
  link: string;
  iconColor: string;
  iconSize?: number;
  shadowColor?: string;
  backgroundColor?: string;
  icon: IconType | LucideIcon;
  label: string;
  onPress?: () => void;
}) {
  const {
    className,
    link,
    iconColor,
    iconSize,
    shadowColor,
    backgroundColor,
    icon: Icon,
    label,
    onPress
  } = props;

   const handlePress = () => {
    if (onPress) {
      onPress();
    } else if (link) {
      router.push(link as any);
    }
  };
  return (
     <TouchableOpacity
      onPress={handlePress}
      className={cn(
        className,
        "rounded-2xl flex justify-center items-center w-[50%] aspect-[5/4] relative overflow-hidden h-full p-5"
      )}
      style={{ backgroundColor: backgroundColor ?? "white" }}
    >
      <View className="relative z-10 w-[90%] flex justify-center items-center gap-2">
        <Icon size={iconSize ?? 32} color={iconColor} className="z-10" />
        <Text
          className="z-10 text-[10px] text-nowrap truncate font-medium text-inherit text-center flex flex-col gap-2"
          style={{ color: iconColor }}
        >
          {label}
        </Text>
      </View>

      <View
        className={`absolute -top-4 -right-6 size-24 rounded-full z-0 opacity-10`}
        style={{ backgroundColor: shadowColor }}
      />
    </TouchableOpacity>
    
  );
}
