import { View, Text, FlatList } from "react-native";
import React, { useState, useEffect } from "react";
import NotificationCard from "@/features/account/components/NotificationCard";
import { useSelector } from "react-redux";

export default function AccountNotificationPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get the phone number from Redux
  const user = useSelector((state: any) => state.user);
  const phoneNumber = user.phoneNumber.trim();

  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `https://monkfish-app-6ahnd.ondigitalocean.app/api/notifications/${phoneNumber}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch notifications");
        }

        const data = await response.json();
        if (data.success) {
          setNotifications(data.data);
        } else {
          throw new Error("Failed to fetch notifications");
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    if (phoneNumber) {
      fetchNotifications();
    }
  }, [phoneNumber]);

  if (loading) {
    return (
      <View className="p-4">
        <Text className="text-center">Loading notifications...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="p-4">
        <Text className="text-center text-red-500">Error: {error}</Text>
      </View>
    );
  }

  if (notifications.length === 0) {
    return (
      <View className="p-4">
        <Text className="text-center">No notifications available.</Text>
      </View>
    );
  }

  return (
    <View className="p-4">
      <Text className="font-semibold text-xl">My Notifications</Text>
      <FlatList
        data={notifications}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <NotificationCard date={item.date} message={item.message} />
        )}
      />
    </View>
  );
}
