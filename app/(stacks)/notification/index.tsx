import { View, Text, FlatList, ActivityIndicator } from "react-native";
import { Button } from "@/components/ui/Button";
import { apiBaseUrl } from "@/features/Home/constHome";
import { useUser } from "@clerk/clerk-expo";
import { Stack, useRouter } from "expo-router";
import { apiNewUrl } from "@/const";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

export default function AccountNotificationPage() {
  const { user } = useUser();
  const userId = user?.publicMetadata?.dbPatientId as string;
  const router = useRouter();
  const { t } = useTranslation();


  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!userId) {
        return;
      }
      const response = await fetch(`${apiNewUrl}/api/notifications/${userId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch notifications");
      }

      const data = await response.json();
      setNotifications(data.notifications || []);
    } catch (error: any) {
      setError(error.message || "An error occurred");
    } finally {
      setLoading(false);
    }
    
  };

  useEffect(() => {
    if (userId) {
      fetchNotifications();
    }
  }, [userId]);

  return (
    <>
      <View className="p-4 flex-1 bg-neutral-200">
        {loading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#0000ff" />
            <Text className="mt-2">{t("loadingNotifications")}</Text>
          </View>
        ) : error ? (
          <View className="flex-1 justify-center items-center">
            <Text className="text-red-500 text-center">{error}</Text>
          </View>
        ) : notifications.length === 0 ? (
          <View className="flex-1 justify-center items-center">
            <Text className="text-gray-500">{t("noNotifications")}</Text>
          </View>
        ) : (
          <FlatList
            data={notifications}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <View className="shadow-sm bg-white rounded-xl p-3 my-2">
                <Text className="text-blue-600 font-semibold">{item.date}</Text>
                <Text className="text-neutral-700 text-base">
                  {item.message}
                </Text>
                {item.roomId && (
                  <Button
                    variant="outline"
                    className="mt-2"
                    onPress={() => router.push(`/joinroom/${item.roomId}`)}
                  >
                    <Text className="font-medium text-neutral-700">
                      {t("openRoom")}
                    </Text>
                  </Button>
                )}
              </View>
            )}
          />
        )}
      </View>
    </>
  );
}
