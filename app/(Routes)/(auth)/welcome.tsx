import React from "react";
import WelcomeScreen from "@/features/Home/Components/welcomeScreeenSlider";
import { View } from "react-native";
import LangToggleButton from "@/components/custom/LangToggle";
import { Button } from "@/components/ui/Button";
import { Text } from "@/components/ui/Text";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";

export default function welcome() {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <View className="w-full h-full relative">
      <View className="absolute top-16  z-50 flex flex-row w-full justify-between ">
        <LangToggleButton className="rounded-none rounded-r-full px-8 w-24" />
        <Button
          variant={"ghost"}
          onPress={() => router.push("/login")}
          className="px-8 mr-4 "
        >
          <Text className="text-white">{t("Skip")}</Text>
        </Button>
      </View>
      <WelcomeScreen />
    </View>
  );
}
