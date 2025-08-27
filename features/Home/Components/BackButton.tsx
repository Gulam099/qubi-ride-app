import React from "react";
import { Button } from "@/components/ui/Button";
import { ArrowLeft2, ArrowRight2 } from "iconsax-react-native";
import { RelativePathString, useRouter } from "expo-router";
import { cn } from "@/lib/utils";
import i18n from "@/lib/i18n";

export default function BackButton(props: {
  className?: string;
  color?: string;
  iconSize?: number;
  iconColor?: string;
  customBackLink?: string;
}) {
  const router = useRouter();
  const isArabic = i18n.language === "ar";
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
      {isArabic ? (
        <ArrowRight2
          size={props.iconSize ?? 24}
          color={props.iconColor ?? "black"}
        />
      ) : (
        <ArrowLeft2
          size={props.iconSize ?? 24}
          color={props.iconColor ?? "black"}
        />
      )}
    </Button>
  );
}

export function WhiteBackButton(props: {
  className?: string;
  iconSize?: number;
  customBackLink?: string;
}) {
  const router = useRouter();
  const isArabic = i18n.language === "ar";

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
      {isArabic ? (
        <ArrowRight2 size={props.iconSize ?? 24} color="#fff" />
      ) : (
        <ArrowLeft2 size={props.iconSize ?? 24} color="#fff" />
      )}
    </Button>
  );
}
