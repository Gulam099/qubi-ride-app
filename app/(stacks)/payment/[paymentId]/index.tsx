import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { useLocalSearchParams } from 'expo-router';

const PaymentPage = () => {
  const { bookingId } = useLocalSearchParams();

  // You could also pass bookingId to your backend if needed to generate a custom payment link

  return (
    <View style={styles.container}>
      <WebView
        source={{ uri: 'https://www.baserah.sa/payment' }}
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
  );
};

export default PaymentPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
  },
});
