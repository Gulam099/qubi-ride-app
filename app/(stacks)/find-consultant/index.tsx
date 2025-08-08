import { router } from "expo-router";
import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { Button } from "@/components/ui/Button";
import { useTranslation } from "react-i18next";
import i18n from "@/lib/i18n";

const ConsultationScreen = () => {
  const { t } = useTranslation();
  
  const currentLanguage = i18n.language;
  const getImageConfig = () => {
    switch (currentLanguage) {
      case "en":
        return {
          source: require("@/assets/images/imageEn.png"),
          width: 380,
          height: 510,
        };
      case "ar":
        return {
          source: require("@/assets/images/imageAr.png"),
          width: 380,
          height: 535,
        };
      default:
        return {
          source: require("@/assets/images/imageEn.png"),
          width: 380,
          height: 510,
        };
    }
  };
  const imageConfig = getImageConfig();
  return (
    <View className="flex-1">
      <View style={styles.container}>
        <Image
          source={imageConfig.source}
          style={{
            width: imageConfig.width,
            height: imageConfig.height,
            resizeMode: "contain",
          }}
        />
      </View>
      {/* Bottom section with text and button */}
      <View className="bg-white rounded-t-3xl p-6 pb-8">
        <Button
          className="bg-purple-600 py-4 rounded-xl mx-2"
          onPress={() => router.push("/(stacks)/find-consultant/step1")}
        >
          <Text className="text-white font-semibold text-lg text-center">
            {t("Start Now")}
          </Text>
        </Button>
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
});

export default ConsultationScreen;
