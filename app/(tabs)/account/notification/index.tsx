import { View, Text, FlatList } from "react-native";
import { apiBaseUrl } from "@/features/Home/constHome";
import { useUser } from "@clerk/clerk-expo";
import { useQuery } from "@tanstack/react-query";
import { Stack } from "expo-router";

export default function AccountNotificationPage() {
  const { user } = useUser();
  const phoneNumber = user?.phoneNumbers[0]?.phoneNumber;

  const fetchNotifications = async () => {
    try {
      const response = await fetch(
        `${apiBaseUrl}/api/notifications/${phoneNumber}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch notifications");
      }

      const data = await response.json();
      if (data.success) {
        return data.data;
      } else {
        throw new Error("Failed to fetch notifications");
      }
    } catch (error) {
      return error;
    }
  };

  const {
    data: notifications,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["notification"],
    queryFn: fetchNotifications,
  });

  if (isLoading) {
    return (
      <View className="p-4">
        <Text className="text-center">Loading notifications...</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View className="p-4">
        <Text className="text-center text-red-500">Error: {error.message}</Text>
      </View>
    );
  }

  if (notifications.length === 0) {
    return (
      <View className="p-4">
        <Text className="text-center">No notifications.</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: "Notifications",
        }}
      />
      <View className="p-4 bg-red-500 flex-1">
        <Text className="font-semibold text-xl">My Notifications</Text>
        <FlatList
          data={notifications}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <View className="shadow-sm bg-background rounded-xl p-3 my-4 ">
              <Text className="text-blue-600 font-semibold">{item.date}</Text>
              <Text className="text-neutral-700 text-base">{item.message}</Text>
            </View>
          )}
        />
      </View>
    </>
  );
}
