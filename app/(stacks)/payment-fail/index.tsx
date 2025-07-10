import { View, Text } from "react-native";

export default function PaymentFailure() {
  return (
    <View className="flex-1 items-center justify-center">
      <Text className="text-red-600 text-xl font-bold">❌ Payment Failed</Text>
    </View>
  );
}
