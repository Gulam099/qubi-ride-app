import { View, Text } from "react-native";
import React from "react";
import { Button } from "@/components/ui/Button";
import { ArrowLeft2 } from "iconsax-react-native";
import { useRouter } from "expo-router";
import { cn } from "@/lib/utils";

export default function BackButton(props: {
  className?: string;
  iconSize?: number;
  iconColor?: string;
}) {
  const router = useRouter();

  return (
    <Button
      className={cn(props.className, "aspect-square")}
      onPress={() => router.back()}
      variant={"ghost"}
    >
      <ArrowLeft2
        size={props.iconSize ?? 24}
        color={props.iconColor ?? "black"}
        className=""
      />
    </Button>
  );
}
