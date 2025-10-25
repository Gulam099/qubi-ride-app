import { View, TouchableOpacity, ScrollView } from "react-native";
import { Button } from "@/components/ui/Button";
import { Link, useLocalSearchParams, useRouter } from "expo-router";
import { H3 } from "@/components/ui/Typography";
import {
  PatientHomeImage,
  PatientPageInstantMenuImage,
  shceduleImage,
} from "@/features/patient/constPatient";
import { Image } from "react-native";
import { cn } from "@/lib/utils";
import { Text } from "@/components/ui/Text";
import { useEffect } from "react";
import * as Updates from "expo-updates";
import { useTranslation } from "react-i18next";
import ProfileImage from "@/features/account/components/ProfileImage";
import { useUser } from "@clerk/clerk-expo";
import NotificationIconButton from "@/features/Home/Components/NotificationIconButton";
import useUserData from "@/hooks/userData";

const PatientPage = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { t } = useTranslation();
  const user = useUserData();

  const reloadApp = async () => {
    try {
      await Updates.reloadAsync();
    } catch (e) {
      console.error("Failed to reload app:", e);
    }
  };

  useEffect(() => {
    if (params.refresh) {
      reloadApp(); // Refresh logic
    }
  }, [params.refresh]);

  return (
     <ScrollView className="flex-1 bg-gray-50">
      <View className="bg-blue-600 p-6 pt-12 pb-8 rounded-b-3xl">
        <Text className="text-white text-3xl font-bold mb-2">RideEase</Text>
        <Text className="text-blue-100 text-base">Your journey, our priority</Text>
      </View>

      <View className="p-6">
        <View className="bg-white rounded-2xl p-6 mb-4 shadow-sm">
          <Text className="text-2xl font-bold text-gray-800 mb-3">Welcome to RideEase! 🚗</Text>
          <Text className="text-gray-600 text-base leading-6 mb-4">
            Experience seamless travel with our premium ride-booking service. Whether you're commuting to work or heading to the airport, we've got you covered.
          </Text>
        </View>

        <View className="bg-white rounded-2xl p-6 mb-4 shadow-sm">
          <Text className="text-xl font-bold text-gray-800 mb-4">✨ Key Features</Text>
          
          <View className="mb-3">
            <Text className="text-gray-800 font-semibold text-base mb-1">🚀 Quick Booking</Text>
            <Text className="text-gray-600 text-sm">Book your ride in just a few taps</Text>
          </View>

          <View className="mb-3">
            <Text className="text-gray-800 font-semibold text-base mb-1">💰 Affordable Prices</Text>
            <Text className="text-gray-600 text-sm">Transparent pricing with no hidden charges</Text>
          </View>

          <View className="mb-3">
            <Text className="text-gray-800 font-semibold text-base mb-1">⭐ Verified Drivers</Text>
            <Text className="text-gray-600 text-sm">All our drivers are background-checked and rated</Text>
          </View>

          <View className="mb-3">
            <Text className="text-gray-800 font-semibold text-base mb-1">🛡️ Safe & Secure</Text>
            <Text className="text-gray-600 text-sm">Your safety is our top priority</Text>
          </View>
        </View>

        <View className="bg-gradient-to-r bg-blue-600 rounded-2xl p-6 mb-4">
          <Text className="text-white text-xl font-bold mb-2">Ready to ride?</Text>
          <Text className="text-blue-100 text-sm mb-4">Check out available rides and book your next trip!</Text>
          <View className="bg-white rounded-xl p-3">
            <Text className="text-blue-600 text-center font-semibold">Go to Rides Tab →</Text>
          </View>
        </View>

        <View className="bg-white rounded-2xl p-6 shadow-sm">
          <Text className="text-xl font-bold text-gray-800 mb-2">📊 Statistics</Text>
          <View className="flex-row justify-between mt-4">
            <View className="items-center">
              <Text className="text-2xl font-bold text-blue-600">50K+</Text>
              <Text className="text-gray-600 text-xs mt-1">Happy Users</Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl font-bold text-blue-600">100K+</Text>
              <Text className="text-gray-600 text-xs mt-1">Rides Completed</Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl font-bold text-blue-600">4.8⭐</Text>
              <Text className="text-gray-600 text-xs mt-1">Average Rating</Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default PatientPage;
