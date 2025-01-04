// utils/layoutDirection.ts
import { I18nManager } from "react-native";
import * as Updates from "expo-updates";

export const setLayoutDirection = async (language: "en" | "ar") => {
  const isRTL = language === "ar";
  if (I18nManager.isRTL !== isRTL) {
    I18nManager.forceRTL(isRTL);
    I18nManager.allowRTL(isRTL);
    await Updates.reloadAsync(); // Required for layout change to take effect
  }
};
