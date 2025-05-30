import { View, Text, StyleSheet } from "react-native";
import { useLocalSearchParams, Stack } from "expo-router";
import { TickCircle } from 'iconsax-react-native';
import { Button } from "@/components/ui/Button";
import { useRouter } from "expo-router";

export default function PaymentSuccess() {
  const { amount, status } = useLocalSearchParams();
  const router = useRouter();

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <View style={styles.container}>
        <TickCircle size={64} color="#10B981" />
        <Text style={styles.title}>Payment Successful</Text>
        <Text style={styles.amount}>Amount: SAR {amount}</Text>
        <Text style={styles.status}>Status: {status}</Text>

        <Button
          className="mt-6"
          onPress={() => {
            router.replace("/(tabs)"); 
          }}
        >
          <Text className="text-white font-medium">Go to Home</Text>
        </Button>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ECFDF5",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#065F46",
    marginVertical: 16,
  },
  amount: {
    fontSize: 16,
    marginBottom: 4,
    color: "#064E3B",
  },
  status: {
    fontSize: 16,
    color: "#064E3B",
  },
});
