import { useEffect } from "react";
import { AppState, AppStateStatus, Platform } from "react-native";
import { focusManager } from "@tanstack/react-query";

export function useOnlineManager(status: AppStateStatus) {
  if (Platform.OS !== "web") {
    focusManager.setFocused(status === "active");
  }
}

useEffect(() => {
  const subscription = AppState.addEventListener("change", useOnlineManager);
  return () => subscription.remove();
}, []);
