import { View, Text } from "react-native";
import React from "react";
import { Button } from "@/components/ui/Button";
import { Notification } from "iconsax-react-native";
import { Badge } from "@/components/ui/Badge";
import { Link, useRouter } from "expo-router";
import { cn } from "@/lib/utils";

export default function NotificationIconButton(props: { className?: string }) {
  const router = useRouter();
  return (
    <Button
      onPress={() => router.push("/p/account/notification")}
      variant={"secondary"}
      className={cn(
        props.className,
        "border aspect-square size-5 relative p-2 bg-background"
      )}
    >
      <View className="size-[0.60rem] bg-red-500 rounded-full absolute top-2 right-2 z-10"></View>
      <Notification size="20" color="black" />
    </Button>
  );
}
