import { View, Text, ScrollView, StyleSheet } from "react-native";
import React, { useEffect, useState } from "react";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { ApiUrl } from "@/const";
import { toast } from "sonner-native";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Lock } from "iconsax-react-native";
import { useUser } from "@clerk/clerk-expo";
import NotificationIconButton from "@/features/Home/Components/NotificationIconButton";
import BackButton from "@/features/Home/Components/BackButton";

export default function PaymentPage() {
  const { user } = useUser();
  const router = useRouter();
 const { 
    paymentId, 
    userId, 
    doctorId, 
    selectedDateTime, 
    sessionDuration, 
    numberOfSessions, 
    complaint,
    bookingId 
  } = useLocalSearchParams();

    const [cardDetails, setCardDetails] = useState({
    name: "",
    number: "",
    month: "",
    year: "",
    cvc: ""
  });
  const [paymentInfo, setPaymentInfo] = useState(null);
console.log('paymentId>>>',paymentId)
  // Fetch payment details
//   const { data: payment, isLoading: isLoadingPayment } = useQuery({
//     queryKey: ["payment", paymentId],
//     queryFn: async () => {
//       const response = await fetch(`${ApiUrl}/api/payments/${paymentId}`);
//       if (!response.ok) {
//         throw new Error("Failed to fetch payment details");
//       }
//       const data = await response.json();
//       setPaymentInfo(data);
//       return data;
//     },
//     enabled: !!paymentId,
//   });


const { mutate: createVideoCall } = useMutation({
    mutationFn: async () => {
      const videoCallPayload = {
        bookingId:bookingId,
        patientId: userId,
        doctorId: doctorId,
        type:'video',
        scheduledAt: selectedDateTime,
        // duration: parseInt(sessionDuration),
        // sessionCount: parseInt(numberOfSessions),
        // complaint: complaint,
        // Add any other video call specific data you need
        // roomName: `room_${bookingId}_${Date.now()}`, // Generate unique room name
        // status: "scheduled"
      };

      const response = await fetch(`${ApiUrl}/api/room/create-room`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(videoCallPayload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create video call");
      }

      return await response.json();
    },
    onSuccess: (data) => {
      console.log("Video call created successfully:", data);
      toast.success("Video call scheduled successfully!");
    },
    onError: (error) => {
      console.error("Failed to create video call:", error);
      toast.error("Failed to schedule video call: " + error.message);
    }
  });


  // Process payment mutation
  const { mutate: processPayment, isPending: isProcessing } = useMutation({
    mutationFn: async () => {
      // Validate card details
      if (!cardDetails.name.trim()) throw new Error("Cardholder name is required");
      if (!cardDetails.number.trim() || cardDetails.number.length < 12) 
        throw new Error("Valid card number is required");
      if (!cardDetails.month || !cardDetails.year || !cardDetails.cvc)
        throw new Error("Expiration date and CVC are required");
      
      // Format card details for Moyasar
      const paymentPayload = {
        source: {
          type: "creditcard",
          name: cardDetails.name,
          number: cardDetails.number.replace(/\s/g, ""), 
          month: cardDetails.month,
          year: cardDetails.year.length === 4 ? cardDetails.year.slice(2) : cardDetails.year,
          cvc: cardDetails.cvc
        }
      };
      
      // Process the payment with Moyasar
      const response = await fetch(`${ApiUrl}/api/payments/${paymentId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(paymentPayload),
      });
      
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Payment processing failed");
      }
      console.log('result',result)
      return result;
    },
    onSuccess: (data) => {
      toast.success("Payment successful!");

       createVideoCall();
      // Navigate to success page or booking confirmation
      router.replace("/(stacks)/payment-success");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Payment failed. Please try again.");
    }
  });

  const handleCardNumberChange = (text: string) => {
    // Format card number with spaces every 4 digits
    const formatted = text.replace(/\s/g, "").replace(/(.{4})/g, "$1 ").trim();
    setCardDetails(prev => ({ ...prev, number: formatted }));
  };

//   if (isLoadingPayment) {
//     return (
//       <View style={styles.container}>
//         <Text>Loading payment details...</Text>
//       </View>
//     );
//   }

  return (
    <><Stack.Screen
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
      }} /><ScrollView style={styles.container}>
        <View style={styles.headerContainer}>
          <Lock size={24} color="#0066CC" />
          <Text style={styles.header}>Secure Payment</Text>
        </View>

        <View style={styles.summaryContainer}>
          <Text style={styles.summaryTitle}>Payment Summary</Text>
          {paymentInfo && (
            <>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Amount:</Text>
                <Text style={styles.summaryValue}>{paymentInfo.amount} {paymentInfo.currency}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Description:</Text>
                <Text style={styles.summaryValue}>{paymentInfo.description}</Text>
              </View>
            </>
          )}
        </View>

        <View style={styles.cardContainer}>
          <Text style={styles.sectionTitle}>Card Information</Text>

          <Text style={styles.label}>Cardholder Name</Text>
          <Input
            placeholder="John Doe"
            value={cardDetails.name}
            onChangeText={(text) => setCardDetails(prev => ({ ...prev, name: text }))}
            className="mb-4" />

          <Text style={styles.label}>Card Number</Text>
          <Input
            placeholder="4111 1111 1111 1111"
            keyboardType="numeric"
            value={cardDetails.number}
            onChangeText={handleCardNumberChange}
            className="mb-4" />

          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <Text style={styles.label}>Expiry Month</Text>
              <Input
                placeholder="MM"
                keyboardType="numeric"
                maxLength={2}
                value={cardDetails.month}
                onChangeText={(text) => setCardDetails(prev => ({ ...prev, month: text }))}
                className="mb-4" />
            </View>

            <View style={styles.halfWidth}>
              <Text style={styles.label}>Expiry Year</Text>
              <Input
                placeholder="YY"
                keyboardType="numeric"
                maxLength={2}
                value={cardDetails.year}
                onChangeText={(text) => setCardDetails(prev => ({ ...prev, year: text }))}
                className="mb-4" />
            </View>
          </View>

          <Text style={styles.label}>CVC</Text>
          <Input
            placeholder="123"
            keyboardType="numeric"
            maxLength={4}
            secureTextEntry={true}
            value={cardDetails.cvc}
            onChangeText={(text) => setCardDetails(prev => ({ ...prev, cvc: text }))}
            className="mb-4" />
        </View>

        <View style={styles.testCardContainer}>
          <Text style={styles.testCardTitle}>Test Card:</Text>
          <Text style={styles.testCardValue}>Card: 4111 1111 1111 1111</Text>
          <Text style={styles.testCardValue}>Expiry: 12/25</Text>
          <Text style={styles.testCardValue}>CVC: 123</Text>
        </View>

        <Button
          onPress={() => processPayment()}
          disabled={isProcessing}
          className="mt-4 mb-8"
        >
          <Text className="text-white font-medium">
            {isProcessing ? "Processing..." : "Pay Now"}
          </Text>
        </Button>
      </ScrollView></>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EFF6FF80',
    padding: 16,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24
  },
  header: {
    fontSize: 20,
    fontWeight: '600',
    marginLeft: 8
  },
  summaryContainer: {
    backgroundColor: '#f5f9ff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8
  },
  summaryLabel: {
    color: '#666'
  },
  summaryValue: {
    fontWeight: '500'
  },
  cardContainer: {
    marginBottom: 24
  },
  sectionTitle: {
    fontSize: 18, 
    fontWeight: '600',
    marginBottom: 12
  },
  label: {
    fontSize: 14,
    marginBottom: 4,
    color: '#666'
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  halfWidth: {
    width: '48%'
  },
  testCardContainer: {
    backgroundColor: '#f0f8ff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16
  },
  testCardTitle: {
    fontWeight: '600',
    marginBottom: 4
  },
  testCardValue: {
    fontSize: 13,
    color: '#666'
  }
});