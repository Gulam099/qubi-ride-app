import React from "react";
import { Button } from "@/components/ui/Button";
import { ArrowLeft2, ArrowRight2 } from "iconsax-react-native";
import { RelativePathString, useRouter } from "expo-router";
import { cn } from "@/lib/utils";

export default function BackButton(props: {
  className?: string;
  color?: string;
  iconSize?: number;
  iconColor?: string;
  customBackLink?: string;
}) {
  const router = useRouter();
  return (
    <Button
      className={cn(props.className, "aspect-square")}
      onPress={() =>
        !props.customBackLink
          ? router.back()
          : router.replace(props.customBackLink as RelativePathString)
      }
      variant={"ghost"}
    >
        <ArrowLeft2
          size={props.iconSize ?? 24}
          color={props.iconColor ?? "black"}
        />
      
    </Button>
  );
}

export function WhiteBackButton(props: {
  className?: string;
  iconSize?: number;
  customBackLink?: string;
}) {
  const router = useRouter();

  return (
    <Button
      className={cn(props.className, "aspect-square")}
      onPress={() =>
        !props.customBackLink
          ? router.back()
          : router.replace(props.customBackLink as RelativePathString)
      }
      variant={"ghost"}
    >
        <ArrowLeft2 size={props.iconSize ?? 24} color="#fff" />
    </Button>
  );
}
