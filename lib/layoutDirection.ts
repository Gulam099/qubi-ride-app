// utils/layoutDirection.ts
import { I18nManager } from "react-native";
import * as Updates from "expo-updates";

export const setLayoutDirection = async (language: "en" | "ar") => {
  const isRTL = language === "ar";
  console.log("Setting layout direction. Language:", language);
  console.log("Expected isRTL:", isRTL);

  if (I18nManager.isRTL !== isRTL) {
    console.log("Applying RTL direction:", isRTL);
    I18nManager.forceRTL(isRTL);
    I18nManager.allowRTL(isRTL);

    // Log before reloading to confirm the change
    console.log("Before reload, I18nManager.isRTL:", I18nManager.isRTL);

    await Updates.reloadAsync();
  } else {
    console.log("No change needed. Current isRTL:", I18nManager.isRTL);
  }
};

