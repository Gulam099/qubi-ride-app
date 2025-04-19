import React from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { WebView } from "react-native-webview";
import { Stack, useLocalSearchParams } from "expo-router";
import NotificationIconButton from "@/features/Home/Components/NotificationIconButton";
import BackButton from "@/features/Home/Components/BackButton";
import { Text } from "@/components/ui/Text";

const PaymentPage = () => {
  const { bookingId } = useLocalSearchParams();

  // You could also pass bookingId to your backend if needed to generate a custom payment link

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerShadowVisible: false,
          headerRight: () => <NotificationIconButton className="mr-4" />,
          headerStyle: {
            backgroundColor: "white",
          },
          headerLeft: () => <BackButton />,
          headerTitle: () => (
            <Text className="font-semibold text-lg">Payment</Text>
          ),
        }}
      />
      <View style={styles.container}>
        <WebView
          source={{ uri: "https://www.baserah.sa/payment" }}
          startInLoadingState
          renderLoading={() => (
            <ActivityIndicator
              color="#0080ff"
              size="large"
              style={styles.loader}
            />
          )}
        />
      </View>
    </>
  );
};

export default PaymentPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loader: {
    flex: 1,
    justifyContent: "center",
  },
});
