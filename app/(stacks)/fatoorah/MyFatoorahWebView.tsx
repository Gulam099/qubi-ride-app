import React from "react";
import { ActivityIndicator, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { WebView } from "react-native-webview";
import * as Linking from "expo-linking";

export default function MyFatoorahWebView() {
  const { redirectUrl } = useLocalSearchParams();
  const router = useRouter();

  console.log("Redirect URL:", redirectUrl);

  const handleNavigationChange = (navState: any) => {
    const url = navState.url;

    console.log("url", url);
    if (url.includes("payment-success")) {
      const parsed = Linking.parse(url); // Parse the URL
      const { queryParams } = parsed;
      router.replace({
        pathname: "/(stacks)/payment-success",
        params: {
          ...queryParams,
        },
      });
    } else if (url.includes("payment-error")) {
      router.replace("/(tabs)/home");
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
