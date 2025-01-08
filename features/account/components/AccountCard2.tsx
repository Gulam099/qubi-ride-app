import { View, Text } from "react-native";
import React from "react";
import { Button } from "@/components/ui/Button";
import { IconType } from "@/features/Home/types/home.type";
import { cn } from "@/lib/utils";
import { Link, RelativePathString } from "expo-router";

export default function AccountCard(props: {
  className?: string;
  link: string;
  iconColor: string;
  iconSize?: number;
  shadowColor?: string;
  backgroundColor?: string;
  icon: IconType;
  label: string;
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
  } = props;

  return (
    <View
      className={cn(
        className,
        " rounded-2xl  flex justify-center items-center w-[30%] aspect-[5/4] relative overflow-hidden h-full p-5 "
      )}
      style={{ backgroundColor: backgroundColor ?? "white" }}
    >
      <View className={" flex flex-1 justify-center items-center"}>
        {/* Render the passed Icon component */}
        <View className="relative z-10 flex justify-center items-center gap-2">
          <Icon size={iconSize ?? 32} color={iconColor} className="z-10" />
          <Text
            className="z-10 text-sm font-medium text-inherit text-center flex flex-col gap-2"
            style={{ color: iconColor }}
          >
            {label}
          </Text>
        </View>
      </View>
      <View
        className={`absolute -top-4 -right-6 size-24 rounded-full z-0 opacity-10 `}
        style={{ backgroundColor: shadowColor }}
      ></View>
    </View>
  );
}
