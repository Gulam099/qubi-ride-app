import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Text } from "@/components/ui/Text";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { updateAppState } from "@/store/appState/appState";
import { setLayoutDirection } from "@/lib/layoutDirection";

export default function LangToggleButton(props: { className?: string }) {
  const { className } = props;
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const language = useSelector((state: any) => state.appState.language);

  const toggleLanguage = () => {
    const newLanguage = language === "en" ? "ar" : "en";
    console.log("Toggling language to:", newLanguage);

    dispatch(updateAppState({ language: newLanguage }));
    i18n.changeLanguage(newLanguage);
    setLayoutDirection(newLanguage);
  };

  return (
    <Button onPress={toggleLanguage} style={{ backgroundColor: "#005153" }} className={cn(className)}>
      <Text>{t("toggleLanguage")}</Text>
    </Button>
  );
}
