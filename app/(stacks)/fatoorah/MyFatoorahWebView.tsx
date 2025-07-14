import React from "react";
import { ActivityIndicator, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { WebView } from "react-native-webview";

export default function MyFatoorahWebView() {
  const { redirectUrl } = useLocalSearchParams();
  const router = useRouter();

  console.log("Redirect URL:", redirectUrl);

  const handleNavigationChange = (navState: any) => {
    const url = navState.url;

    console.log("url", url);
    if (url.includes("payment-success")) {
      router.replace("/(stacks)/payment-success");
    } else if (url.includes("payment-error")) {
      router.replace("/(tabs)");
    }
  };

  if (!redirectUrl) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="green" />
      </View>
    );
  }

  return (
    <WebView
      source={{ uri: redirectUrl }}
      startInLoadingState
      onNavigationStateChange={handleNavigationChange}
    />
  );
}
