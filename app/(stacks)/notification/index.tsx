import { View, Text, FlatList, ActivityIndicator } from "react-native";
import { Button } from "@/components/ui/Button";
import { apiBaseUrl } from "@/features/Home/constHome";
import { useUser } from "@clerk/clerk-expo";
import { Stack, useRouter } from "expo-router";
import { apiNewUrl } from "@/const";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { formatDate, isValid } from "date-fns";

// Helper function to translate room types if needed
const getRoomTypeTranslation = (type: string, language: string): string => {
  const translations: Record<string, Record<string, string>> = {
    en: {
      video: "video",
      audio: "audio",
    },
    ar: {
      video: "فيديو",
      audio: "صوتي",
    },
  };

  return translations[language]?.[type] || type;
};

// Function to translate notification messages
const getTranslatedRoomMessage = (
  rawMessage: string,
  t: (key: string, options?: any) => string,
  language: string
): string => {
  if (!rawMessage) return "";

  // Pattern: "A video room has been scheduled for 7/4/2025, 7:00:00 AM"
  const scheduledMatch = rawMessage.match(
    /A (\w+) room has been scheduled for (.+)/i
  );
  if (scheduledMatch) {
    const [, typeRaw, time] = scheduledMatch;
    const type = getRoomTypeTranslation(typeRaw, language);
    const parsedDate = new Date(time);
    const formattedDate = isValid(parsedDate)
      ? formatDate(parsedDate, "PPPp")
      : time;
    return t("room.scheduled", { type, date: formattedDate });
  }

  // Pattern: "Your scheduled video room is now active and ready to join"
  const startedMatch = rawMessage.match(
    /Your scheduled (\w+) room is now active/i
  );
  if (startedMatch) {
    const [, typeRaw] = startedMatch;
    const type = getRoomTypeTranslation(typeRaw, language);
    return t("room.started", { type });
  }

  // Pattern: "Immediate video room is ready to join!"
  const readyMatch = rawMessage.match(/Immediate (\w+) room is ready/i);
  if (readyMatch) {
    const [, typeRaw] = readyMatch;
    const type = getRoomTypeTranslation(typeRaw, language);
    return t("room.ready", { type });
  }

  // Fallback 1: "A video room is scheduled for ..."
  const fallbackScheduled = rawMessage.match(
    /A (\w+) room is scheduled for (.+)/i
  );
  if (fallbackScheduled) {
    const [, typeRaw, time] = fallbackScheduled;
    const type = getRoomTypeTranslation(typeRaw, language);
    const parsedDate = new Date(time);
    const formattedDate = isValid(parsedDate)
      ? formatDate(parsedDate, "PPPp")
      : time;
    return t("room.scheduled", { type, date: formattedDate });
  }

  // Fallback 2: "Immediate video room is ready to join!"
  const fallbackReady = rawMessage.match(/Immediate (\w+) room is ready/i);
  if (fallbackReady) {
    const [, typeRaw] = fallbackReady;
    const type = getRoomTypeTranslation(typeRaw, language);
    return t("room.ready", { type });
  }

  // If no match, return the original
  return rawMessage;
};

export default function AccountNotificationPage() {
  const { user } = useUser();
  const userId = user?.publicMetadata?.dbPatientId as string;
  const router = useRouter();
  const { t, i18n } = useTranslation();

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
  console.log("notifications", notifications);
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
                <Text className="text-neutral-700 font-semibold">
                  {new Date(item.datetime).toLocaleDateString("en-US", {
                    month: "2-digit",
                    day: "2-digit",
                    year: "numeric",
                  })}
                </Text>

                <Text className="text-neutral-700 text-base mt-1">
                  {getTranslatedRoomMessage(item.message, t, i18n.language)}
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
