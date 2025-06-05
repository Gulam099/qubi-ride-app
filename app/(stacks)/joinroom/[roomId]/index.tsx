import { View, Text, ActivityIndicator, Alert } from "react-native";
import React, { useState, useEffect, useRef } from "react";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import WebView from "react-native-webview";
import { apiNewUrl } from "@/const";

const JoinRoom = () => {
  const { roomId } = useLocalSearchParams();
  const router = useRouter();
  const [roomData, setRoomData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [sessionDuration, setSessionDuration] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const intervalRef = useRef(null);

  const roomUrl = `https://baseerah.daily.co/${roomId}`;

  // Fetch room data
  const fetchRoomData = async () => {
    try {
      setLoading(true);
      // Replace with your actual API endpoint
      const response = await fetch(`${apiNewUrl}/api/room/get-room/${roomId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Add authorization headers if needed
          // 'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch room data');
      }

      const data = await response.json();
      setRoomData(data);

      // Calculate time remaining until expiration
      if (data.expiresAt) {
        const expirationTime = new Date(data.expiresAt.$date || data.expiresAt);
        const now = new Date();
        const timeDiff = expirationTime.getTime() - now.getTime();

        if (timeDiff > 0) {
          setTimeRemaining(Math.floor(timeDiff / 1000)); // Convert to seconds
        } else {
          // Room already expired
          handleRoomExpired();
          return;
        }
      }

      // Set session duration (in minutes)
      if (data.duration) {
        setSessionDuration(data.duration);
      }

    } catch (err) {
      console.error('Error fetching room data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle room expiration
  const handleRoomExpired = () => {
    Alert.alert(
      "Session Expired",
      "This room session has expired.",
      [
        {
          text: "OK",
          onPress: () => {
            // Navigate to payment page or appropriate screen
            redirectToPayment();
          }
        }
      ]
    );
  };

  // Create payment on backend
  const createPayment = async () => {
    try {
      setPaymentLoading(true);

      const userId = roomData?.patientId ?? roomData?.patient?._id;
      const doctorId = roomData?.doctorId ?? roomData?.doctor?._id;
      console.log("userId", "doctorId", userId, doctorId, roomData?.bookingId)

      // Payment payload
      const paymentPayload = {
        userId: userId,
        doctorId: doctorId,
        amount: 1000, // You might want to calculate this based on session duration
        currency: "SAR",
        description: "Medical consultation session",
        status: "initiated",
        bookingId: roomData?.bookingId,
        bookingType:'instant'
      };

      const paymentResponse = await fetch(`${apiNewUrl}/api/payments/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.EXPO_MOYASAR_TEST_SECRET_KEY}`,
        },
        body: JSON.stringify(paymentPayload),
      });

      const paymentResult = await paymentResponse.json();

      if (!paymentResponse.ok) {
        throw new Error(paymentResult?.message || "Payment creation failed.");
      }

      const paymentId = paymentResult?.payment?.internalPaymentId;

      if (!paymentId) {
        throw new Error("Payment ID missing.");
      }

      return paymentId;

    } catch (error) {
      console.error('Error creating payment:', error);
      throw error;
    } finally {
      setPaymentLoading(false);
    }
  };

  // Redirect to payment page
  const redirectToPayment = async () => {
    if (roomData && roomData.instant === true) {
      try {
        // Show loading state
        setPaymentLoading(true);

        // Create payment first
        const paymentId = await createPayment();

        // Extract necessary data for payment redirection
        const bookingData = {
          userId: roomData.patientId, // Assuming patientId is userId
          doctorId: roomData.doctorId,
          selectedDateTime: roomData.scheduledAt,
          sessionDuration: roomData.duration || 30,
          numberOfSessions: 1, // Default or get from room data
        };

        const queryParams = new URLSearchParams({
          userId: bookingData.userId,
          doctorId: bookingData.doctorId,
          selectedDateTime: bookingData.selectedDateTime,
          sessionDuration: bookingData.sessionDuration.toString(),
          numberOfSessions: bookingData.numberOfSessions.toString(),
          bookingId: roomData.bookingId || "",
          instant: "true"
        }).toString();

        // Navigate with the actual payment ID
        router.push(`/(stacks)/paymentpage/${paymentId}?${queryParams}`);

      } catch (error) {
        console.error('Payment creation failed:', error);
        Alert.alert(
          "Payment Error",
          "Failed to create payment. Please try again.",
          [
            { text: "OK" }
          ]
        );
        setPaymentLoading(false);
      }
    }
  };

  // Format time display
  const formatTime = (seconds) => {
    if (seconds <= 0) return "00:00";

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate elapsed time
  const getElapsedTime = () => {
    if (!roomData || !sessionDuration) return null;

    const totalSeconds = sessionDuration * 60; // Convert minutes to seconds
    const remainingSeconds = timeRemaining || 0;
    const elapsedSeconds = totalSeconds - remainingSeconds;

    return Math.max(0, elapsedSeconds);
  };

  useEffect(() => {
    if (roomId) {
      fetchRoomData();
    }
  }, [roomId]);

  useEffect(() => {
    if (timeRemaining !== null && timeRemaining > 0) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            handleRoomExpired();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [timeRemaining]);

  if (loading) {
    return (
      <>
        <Stack.Screen
          options={{
            headerShown: true,
            headerTitle: "Join Room",
          }}
        />
        <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }}>
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#3b82f6" />
            <Text style={{ marginTop: 10, color: '#64748b' }}>Loading Room Data...</Text>
          </View>
        </SafeAreaView>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Stack.Screen
          options={{
            headerShown: true,
            headerTitle: "Join Room",
          }}
        />
        <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }}>
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
            <Text style={{ color: '#ef4444', fontSize: 16, textAlign: 'center' }}>
              Error loading room: {error}
            </Text>
            <Text
              style={{ color: '#3b82f6', marginTop: 20, fontSize: 16 }}
              onPress={fetchRoomData}
            >
              Retry
            </Text>
          </View>
        </SafeAreaView>
      </>
    );
  }

  // Show payment loading overlay
  if (paymentLoading) {
    return (
      <>
        <Stack.Screen
          options={{
            headerShown: true,
            headerTitle: "Join Room",
          }}
        />
        <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }}>
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#3b82f6" />
            <Text style={{ marginTop: 10, color: '#64748b' }}>Creating Payment...</Text>
          </View>
        </SafeAreaView>
      </>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: `Join Room`,
        }}
      />
      <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }}>
        {/* Timer Display */}
        <View style={{
          backgroundColor: '#f8fafc',
          paddingVertical: 12,
          paddingHorizontal: 20,
          borderBottomWidth: 1,
          borderBottomColor: '#e2e8f0'
        }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View>
              <Text style={{ fontSize: 14, color: '#64748b' }}>Time Remaining</Text>
              <Text style={{
                fontSize: 18,
                fontWeight: 'bold',
                color: timeRemaining && timeRemaining < 300 ? '#ef4444' : '#059669'
              }}>
                {formatTime(timeRemaining || 0)}
              </Text>
            </View>
            <View>
              <Text style={{ fontSize: 14, color: '#64748b' }}>Session Duration</Text>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#374151' }}>
                {formatTime(getElapsedTime() || 0)} / {sessionDuration}min
              </Text>
            </View>
          </View>
        </View>

        <View style={{ flex: 1, padding: 60 }}>
          <WebView
            source={{ uri: roomUrl }}
            style={{ flex: 1, borderRadius: 12, overflow: 'scroll' }}
            startInLoadingState={true}
            renderLoading={() => (
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#3b82f6" />
                <Text style={{ marginTop: 10, color: '#64748b' }}>Loading Room...</Text>
              </View>
            )}
            allowsFullscreenVideo
            javaScriptEnabled
            domStorageEnabled
          />

          {/* Footer */}
          <View style={{ paddingTop: 16 }}>
            <Text style={{ textAlign: 'center', color: '#64748b' }}>
              Room ID: {roomId} • Status: {roomData?.status || 'Unknown'}
            </Text>
            {roomData?.status === 'active' && (
              <Text style={{ textAlign: 'center', color: '#059669', fontSize: 12, marginTop: 4 }}>
                🔴 Live Session
              </Text>
            )}
          </View>
        </View>
      </SafeAreaView>
    </>
  );
};

export default JoinRoom;