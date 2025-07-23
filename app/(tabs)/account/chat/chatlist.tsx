import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import { RelativePathString, useRouter } from "expo-router";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import { Trash } from "iconsax-react-native";
import colors from "@/utils/colors";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiNewUrl } from "@/const";
import { useUser } from "@clerk/clerk-expo";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";

function ChatListPage() {
  const { user } = useUser();
  const [value, setValue] = useState("specific_specialists");
  const [doctors, setDoctors] = useState([]);
  const router = useRouter();
  const { t } = useTranslation();

  const userId = user?.publicMetadata?.dbPatientId as string;
  console.log("userId", userId);
  console.log("doctors", doctors);

  useEffect(() => {
    const fetchdoctors = async () => {
      try {
        const response = await fetch(
          `${apiNewUrl}/api/doctor/chat/userId/${userId}`
        );
        const doctorData = await response.json();

        setDoctors(doctorData.doctors);
      } catch (error) {
        console.error("Error fetching doctors:", error.message);
      }
    };

    fetchdoctors();
  }, [userId]);

  const handleChatPress = (id: string, name: string, canChat: boolean) => {
    console.log("Navigating to doctor ID:", id);
    console.log("Navigating to doctor name:", name);
    console.log("Navigating to:", `/tabs)/account/chat/c/${id}`);
    router.push(
      `/(tabs)/account/chat/c/${id}?name=${encodeURIComponent(
        name
      )}&canChat=${canChat}`
    );
  };

  const getInitials = (name: string) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  const handleDeleteChat = async (doctorId: string) => {
    Alert.alert(t("deleteChat.title"), t("deleteChat.confirmation"), [
      {
        text: t("deleteChat.cancel"),
        style: "cancel",
      },
      {
        text: t("deleteChat.delete"),
        style: "destructive",
        onPress: async () => {
          try {
            const res = await fetch(
              `${apiNewUrl}/api/doctor/chat/deleteChatForUser`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  userId,
                  doctorId,
                }),
              }
            );

            if (!res.ok) {
              const err = await res.json();
              throw new Error(err.message);
            }
          } catch (error) {
            console.error("Error deleting chat:", error.message);
            t("deleteChat.errorTitle"), t("deleteChat.errorMessage");
          }
        },
      },
    ]);
  };

  return (
    <View className="p-4 bg-blue-50/10 h-full">
      <Text className="text-xl font-bold text-gray-900 mb-4">
        {t("Mychats")}
      </Text>
      <Tabs
        value={value}
        onValueChange={setValue}
        className="w-full flex-col gap-2"
      >
        <TabsContent value="specific_specialists" className="h-full">
          <FlatList
            data={doctors}
            contentContainerClassName="gap-3 pb-4"
            showsVerticalScrollIndicator={false}
            keyExtractor={(item, index) =>
              item.id ? item.id.toString() : `doctor-${index}`
            }
            renderItem={({ item }) => (
              <View className="bg-white rounded-2xl px-4 py-3 flex-row items-center justify-between shadow-sm">
                {/* LEFT SECTION — tap to chat */}
                <TouchableOpacity
                  className="flex-row items-center gap-3 flex-1"
                  onPress={() =>
                    handleChatPress(item.doctorId, item.full_name, item.canChat)
                  }
                >
                  {/* Avatar */}
                  {item?.profile_picture ? (
                    <Image
                      source={{ uri: item.profile_picture }}
                      className="w-12 h-12 rounded-full"
                      resizeMode="cover"
                    />
                  ) : (
                    <View className="w-12 h-12 rounded-full bg-blue-500 justify-center items-center">
                      <Text className="text-white font-bold text-sm">
                        {getInitials(item.full_name)}
                      </Text>
                    </View>
                  )}

                  {/* Name & Date */}
                  <View>
                    <Text className="text-lg font-semibold text-black">
                      {item.full_name}
                    </Text>
                    <Text className="text-gray-500 text-sm">
                      {item.lastMessageDate
                        ? format(new Date(item.lastMessageDate), "MMMM, dd")
                        : ""}
                    </Text>
                  </View>
                </TouchableOpacity>

                {/* RIGHT SECTION — delete button */}
                <TouchableOpacity
                  onPress={() => handleDeleteChat(item.doctorId)}
                  className="flex-row items-center gap-1"
                >
                  <Trash size={16} color="red" />
                  <Text className="text-red-500 text-sm font-medium">
                    {t("deleteChat.title")}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
            ListEmptyComponent={() => (
              <View className="flex-1 justify-center items-center py-10">
                <Text className="text-gray-500 text-center">
                  {t("noDoctors")}
                </Text>
              </View>
            )}
          />
        </TabsContent>

        <TabsContent value="specialists" className="h-full">
          <View className="flex-1 justify-center items-center">
            <Text className="text-gray-500">
              Specialists content coming soon
            </Text>
          </View>
        </TabsContent>

        <TabsContent value="customers" className="h-full">
          <View className="flex-1 justify-center items-center">
            <Text className="text-gray-500">Customers content coming soon</Text>
          </View>
        </TabsContent>
      </Tabs>
    </View>
  );
}

export default ChatListPage;
