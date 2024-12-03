import { AppLogo } from "@/const";
import { cn } from "@/lib/utils";
import React from "react";
import { Image } from "react-native";

export default function Logo(props: { className: string }) {
  return <Image source={AppLogo} className={cn(props.className)} />;
}
