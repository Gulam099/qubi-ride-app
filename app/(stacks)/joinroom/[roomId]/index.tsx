import {
  View,
  Text,
  ActivityIndicator,
  Alert,
  Modal,
  TouchableOpacity,
  TextInput,
} from "react-native";
import React, { useState, useEffect, useRef } from "react";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import WebView from "react-native-webview";
import { apiNewUrl } from "@/const";
import { useTranslation } from "react-i18next";

const JoinRoom = () => {
  const { roomId } = useLocalSearchParams();
  const router = useRouter();
  const [roomData, setRoomData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [sessionDuration, setSessionDuration] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedRating, setSelectedRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [submittingRating, setSubmittingRating] = useState(false);
  const [sessionEnded, setSessionEnded] = useState(false);
  const [totalFee, setTotalFee] = useState(null);
  const intervalRef = useRef(null);
  const { t } = useTranslation();

  const roomUrl = `https://baseerah.daily.co/${roomId}`;

  console.log("roomId", roomId);

  // Fetch room data
  const fetchRoomData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${apiNewUrl}/api/room/get-room/${roomId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch room data");
      }

      const data = await response.json();
      setRoomData(data);

      if (data.expiresAt) {
        const expirationTime = new Date(data.expiresAt.$date || data.expiresAt);
        const now = new Date();
        const timeDiff = expirationTime.getTime() - now.getTime();

        if (timeDiff > 0) {
          setTimeRemaining(Math.floor(timeDiff / 1000));
        } else {
          handleSessionEnd();
          return;
        }
      }

      if (data.duration) {
        setSessionDuration(data.duration);
      }
    } catch (err) {
      console.error("Error fetching room data:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        if (!roomData?.bookingId) {
          setLoading(false);
          return;
        }
        const response = await fetch(
          `${apiNewUrl}/api/instantbookings/${roomData?.bookingId}`
        );
        const data = await response.json();

        if (response.ok) {
          setTotalFee(data?.booking?.totalFee);
        } else {
          setError(data.message || "Failed to fetch booking");
        }
      } catch (err) {
        console.error("Error fetching booking:", err);
        setError("Network or server error");
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [roomData?.bookingId]);

  // Handle session end (show rating modal)
  const handleSessionEnd = () => {
    setSessionEnded(true);
    setShowRatingModal(true);
  };

  // Handle post-rating flow
  const handlePostRating = () => {
    setShowRatingModal(false);

    // Check if this is an instant booking that needs payment
    if (roomData && roomData.instant === true) {
      // Redirect to payment after rating
      redirectToPayment();
    } else {
      // For regular bookings, just go back to home
      router.push("/(tabs)");
    }
  };

  // Handle room expiration (original function)
  const handleRoomExpired = () => {
    Alert.alert("Session Expired", "This room session has expired.", [
      {
        text: "OK",
        onPress: () => {
          redirectToPayment();
        },
      },
    ]);
  };

  // Submit rating and review
  const submitRating = async () => {
    if (selectedRating === 0) {
      Alert.alert(
        "Rating Required",
        "Please select a rating before submitting."
      );
      return;
    }

    try {
      setSubmittingRating(true);

      const ratingPayload = {
        doctorId: roomData?.doctorId ?? roomData?.doctor?._id,
        patientId: roomData?.patientId ?? roomData?.patient?._id,
        rating: selectedRating,
        review: reviewText.trim(),
      };

      const response = await fetch(`${apiNewUrl}/api/ratings/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Add authorization if needed
        },
        body: JSON.stringify(ratingPayload),
      });

      if (!response.ok) {
        throw new Error("Failed to submit rating");
      }

      const result = await response.json();

      // Show success message
      Alert.alert(
        "Thank You!",
        "Your rating has been submitted successfully.",
        [
          {
            text: "OK",
            onPress: () => {
              handlePostRating();
            },
          },
        ]
      );
    } catch (error) {
      console.error("Error submitting rating:", error);
      Alert.alert("Error", "Failed to submit rating. Please try again.", [
        {
          text: "Retry",
          onPress: submitRating,
        },
        {
          text: "Skip",
          onPress: () => {
            handlePostRating();
          },
        },
      ]);
    } finally {
      setSubmittingRating(false);
    }
  };

  // Skip rating
  const skipRating = () => {
    Alert.alert(
      "Skip Rating",
      "Are you sure you want to skip rating this session?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Skip",
          onPress: () => {
            if (roomData && roomData.instant === true) {
              // Redirect to payment even when skipping rating
              redirectToPayment();
            } else {
              // For regular bookings, just go back to home
              router.push("/(tabs)");
            }
          },
        },
      ]
    );
  };

  // Create payment on backend
  const createPayment = async () => {
    try {
      setPaymentLoading(true);

      const userId = roomData?.patientId ?? roomData?.patient?._id;
      const doctorId = roomData?.doctorId ?? roomData?.doctor?._id;
      const amount = roomData?.doctorId?.fees;

      console.log("amount", amount);
      const paymentPayload = {
        userId: userId,
        doctorId: doctorId,
        amount: totalFee,
        currency: t("SAR"),
        description: t("medical_consultation_session"),
        status: "initiated",
        bookingId: roomData?.bookingId,
        bookingType: t("Instant"),
      };

      const paymentResponse = await fetch(`${apiNewUrl}/api/payments/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.MYFATOORAH_TEST_TOKEN}`,
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
      console.error("Error creating payment:", error);
      throw error;
    } finally {
      setPaymentLoading(false);
    }
  };

  // Redirect to payment page
  const redirectToPayment = async () => {
  if (roomData && roomData.instant === true) {
    try {
      setPaymentLoading(true);

      const userId = roomData?.patientId ?? roomData?.patient?._id;
      const doctorId = roomData?.doctorId ?? roomData?.doctor?._id;

      const paymentPayload = {
        userId,
        doctorId,
        amount: totalFee,
        currency: t("SAR"),
        description: t("medical_consultation_session"),
        status: "initiated",
        bookingId: roomData?.bookingId,
        bookingType: t("Instant"),
      };

      const paymentResponse = await fetch(`${apiNewUrl}/api/payments/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(paymentPayload),
      });

      const paymentResult = await paymentResponse.json();

      if (!paymentResponse.ok) {
        throw new Error(paymentResult?.message || "Payment creation failed.");
      }

      const paymentId = paymentResult?.payment?.internalPaymentId;
      if (!paymentId) throw new Error("Payment ID missing.");

      // ✅ Get redirect URL
      const processResponse = await fetch(
        `${apiNewUrl}/api/payments/${paymentId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const processResult = await processResponse.json();
      if (!processResponse.ok)
        throw new Error(processResult?.error || "Payment processing failed.");

      const redirectUrl = processResult?.redirectUrl;
      if (!redirectUrl) throw new Error("Redirect URL not found.");

      // Build query params
      const queryParams = new URLSearchParams({
        userId: userId,
        doctorId: doctorId,
        selectedDateTime: roomData.scheduledAt,
        sessionDuration: (roomData.duration || 30).toString(),
        numberOfSessions: "1",
        totalFee: totalFee.toString(),
        bookingId: roomData.bookingId || "",
        redirectUrl,
        instant: "true",
      }).toString();

      router.push(`/(stacks)/fatoorah/MyFatoorahWebView?${queryParams}`);
    } catch (error) {
      console.error("Payment creation failed:", error);
      Alert.alert(
        "Payment Error",
        "Failed to create payment. Please try again.",
        [{ text: "OK" }]
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
      return `${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${minutes.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // Calculate elapsed time
  const getElapsedTime = () => {
    if (!roomData || !sessionDuration) return null;

    const totalSeconds = sessionDuration * 60;
    const remainingSeconds = timeRemaining || 0;
    const elapsedSeconds = totalSeconds - remainingSeconds;

    return Math.max(0, elapsedSeconds);
  };

  // Render star rating
  const renderStarRating = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <TouchableOpacity
          key={i}
          onPress={() => setSelectedRating(i)}
          style={{ marginHorizontal: 5 }}
        >
          <Text
            style={{
              fontSize: 32,
              color: i <= selectedRating ? "#fbbf24" : "#d1d5db",
            }}
          >
            ★
          </Text>
        </TouchableOpacity>
      );
    }
    return stars;
  };

  // Rating descriptions
  const getRatingDescription = (rating) => {
    const descriptions = {
      1: "Poor",
      2: "Fair",
      3: "Good",
      4: "Very Good",
      5: "Excellent",
    };
    return descriptions[rating] || "";
  };

  useEffect(() => {
    if (roomId) {
      fetchRoomData();
    }
  }, [roomId]);

  useEffect(() => {
    if (timeRemaining !== null && timeRemaining > 0) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            handleSessionEnd(); // Show rating modal instead of expired alert
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
        <SafeAreaView style={{ flex: 1, backgroundColor: "#ffffff" }}>
          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <ActivityIndicator size="large" color="#3b82f6" />
            <Text style={{ marginTop: 10, color: "#64748b" }}>
              Loading Room Data...
            </Text>
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
        <SafeAreaView style={{ flex: 1, backgroundColor: "#ffffff" }}>
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              padding: 20,
            }}
          >
            <Text
              style={{ color: "#ef4444", fontSize: 16, textAlign: "center" }}
            >
              Error loading room: {error}
            </Text>
            <Text
              style={{ color: "#3b82f6", marginTop: 20, fontSize: 16 }}
              onPress={fetchRoomData}
            >
              Retry
            </Text>
          </View>
        </SafeAreaView>
      </>
    );
  }

  if (paymentLoading) {
    return (
      <>
        <Stack.Screen
          options={{
            headerShown: true,
            headerTitle: "Join Room",
          }}
        />
        <SafeAreaView style={{ flex: 1, backgroundColor: "#ffffff" }}>
          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <ActivityIndicator size="large" color="#3b82f6" />
            <Text style={{ marginTop: 10, color: "#64748b" }}>
              Creating Payment...
            </Text>
          </View>
        </SafeAreaView>
      </>
    );
  }

  return (
    <>
      <SafeAreaView style={{ flex: 1, backgroundColor: "#ffffff" }}>
        {/* Timer Display */}
        <View
          style={{
            backgroundColor: "#f8fafc",
            paddingVertical: 12,
            paddingHorizontal: 20,
            borderBottomWidth: 1,
            borderBottomColor: "#e2e8f0",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <View>
              <Text style={{ fontSize: 14, color: "#64748b" }}>
                {t("timeRemaining")}{" "}
              </Text>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "bold",
                  color:
                    timeRemaining && timeRemaining < 300
                      ? "#ef4444"
                      : "#059669",
                }}
              >
                {formatTime(timeRemaining || 0)}
              </Text>
            </View>
            <View>
              <Text style={{ fontSize: 14, color: "#64748b" }}>
                {t("sessionDuration")}
              </Text>
              <Text
                style={{ fontSize: 18, fontWeight: "bold", color: "#374151" }}
              >
                {formatTime(getElapsedTime() || 0)} / {sessionDuration}min
              </Text>
            </View>
          </View>
        </View>

        <View style={{ flex: 1, padding: 60 }}>
          <WebView
            source={{ uri: roomUrl }}
            style={{ flex: 1, borderRadius: 12, overflow: "scroll" }}
            startInLoadingState={true}
            renderLoading={() => (
              <View
                style={{
                  flex: 1,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <ActivityIndicator size="large" color="#3b82f6" />
                <Text style={{ marginTop: 10, color: "#64748b" }}>
                  {t("loadingRoom")}
                </Text>
              </View>
            )}
            allowsFullscreenVideo
            javaScriptEnabled
            domStorageEnabled
          />

          {/* Footer */}
          <View style={{ paddingTop: 16 }}>
            <Text style={{ textAlign: "center", color: "#64748b" }}>
              {t("roomId")}: {roomId} • {t("status")}:{" "}
              {roomData?.status || t("unknown")}
            </Text>
            {roomData?.status === "active" && (
              <Text
                style={{
                  textAlign: "center",
                  color: "#059669",
                  fontSize: 12,
                  marginTop: 4,
                }}
              >
                {t("liveSession")}
              </Text>
            )}
          </View>
        </View>

        {/* Rating Modal */}
        <Modal
          visible={showRatingModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => {}}
        >
          <View
            style={{
              flex: 1,
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <View
              style={{
                backgroundColor: "#ffffff",
                margin: 20,
                borderRadius: 16,
                padding: 24,
                width: "90%",
                maxWidth: 400,
              }}
            >
              {/* Header */}
              <View style={{ alignItems: "center", marginBottom: 24 }}>
                <Text
                  style={{
                    fontSize: 24,
                    fontWeight: "bold",
                    color: "#374151",
                    marginBottom: 8,
                  }}
                >
                  {t("rateYourSession")}
                </Text>
                <Text
                  style={{
                    fontSize: 16,
                    color: "#64748b",
                    textAlign: "center",
                  }}
                >
                  {t("howWasConsultation")} {roomData?.doctor?.name || "Doctor"}
                  ?
                </Text>
              </View>

              {/* Star Rating */}
              <View style={{ alignItems: "center", marginBottom: 20 }}>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "center",
                    marginBottom: 8,
                  }}
                >
                  {renderStarRating()}
                </View>
                {selectedRating > 0 && (
                  <Text
                    style={{
                      fontSize: 16,
                      color: "#6b7280",
                      fontWeight: "500",
                    }}
                  >
                    {getRatingDescription(selectedRating)}
                  </Text>
                )}
              </View>

              {/* Review Text Input */}
              <View style={{ marginBottom: 24 }}>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "500",
                    color: "#374151",
                    marginBottom: 8,
                  }}
                >
                  {t("leaveReview")}
                </Text>
                <TextInput
                  style={{
                    borderWidth: 1,
                    borderColor: "#d1d5db",
                    borderRadius: 8,
                    padding: 12,
                    height: 100,
                    textAlignVertical: "top",
                    fontSize: 14,
                  }}
                  placeholder="Share your experience..."
                  value={reviewText}
                  onChangeText={setReviewText}
                  multiline
                  maxLength={500}
                />
                <Text
                  style={{
                    fontSize: 12,
                    color: "#9ca3af",
                    textAlign: "right",
                    marginTop: 4,
                  }}
                >
                  {reviewText.length}/500
                </Text>
              </View>

              {/* Action Buttons */}
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <TouchableOpacity
                  style={{
                    flex: 1,
                    paddingVertical: 12,
                    paddingHorizontal: 16,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: "#d1d5db",
                    marginRight: 8,
                  }}
                  onPress={skipRating}
                  disabled={submittingRating}
                >
                  <Text
                    style={{
                      textAlign: "center",
                      color: "#6b7280",
                      fontSize: 16,
                      fontWeight: "500",
                    }}
                  >
                    {t("skip")}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={{
                    flex: 1,
                    paddingVertical: 12,
                    paddingHorizontal: 16,
                    borderRadius: 8,
                    backgroundColor: "#3b82f6",
                    marginLeft: 8,
                    opacity: submittingRating ? 0.7 : 1,
                  }}
                  onPress={submitRating}
                  disabled={submittingRating}
                >
                  {submittingRating ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <Text
                      style={{
                        textAlign: "center",
                        color: "#ffffff",
                        fontSize: 16,
                        fontWeight: "500",
                      }}
                    >
                      {t("submit")}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </>
  );
};

export default JoinRoom;
