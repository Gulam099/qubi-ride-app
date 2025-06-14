import React, { useState, useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity,Image  } from "react-native";
import { RelativePathString, useRouter } from "expo-router";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import { Trash } from "iconsax-react-native";
import colors from "@/utils/colors";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiNewUrl } from "@/const";
import { useUser } from "@clerk/clerk-expo";

function ChatListPage() {
  const { user } = useUser();
  const [value, setValue] = useState("specific_specialists");
  const [doctors, setDoctors] = useState([]);
  const router = useRouter();
  const userId = user?.publicMetadata?.dbPatientId as string;
  console.log('userId',userId)
  useEffect(() => {
    const fetchdoctors = async () => {
      try {
        const response = await fetch(`${apiNewUrl}/api/doctor/chat/userId/${userId}`);
        const doctorData = await response.json();

        setDoctors(doctorData.doctors);
      } catch (error) {
        console.error("Error fetching doctors:", error.message);
      }
    };

    fetchdoctors();
  }, [userId]);

  const handleChatPress = (id: string) => {
      console.log("Navigating to doctor ID:", id)
      console.log("Navigating to:", `/tabs)/account/chat/c/${id}`);
    router.push(
      `/(tabs)/account/chat/c/${id}`
    );
  };

  
  const getInitials = (name: string) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map(word => word.charAt(0))
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };
  return (
    <View className="p-4 bg-blue-50/10 h-full">
      <Tabs
        value={value}
        onValueChange={setValue}
        className="w-full flex-col gap-2"
      >
        {/* <TabsList className="flex-row w-full bg-white rounded-2xl p-0 overflow-hidden">
          {[
            { title: "Specific Specialists", value: "specific_specialists" },
            { title: "Specialists", value: "specialists" },
            { title: "Customers", value: "customers" },
          ].map((e) => {
            const isActive = value === e.value;
            return (
              <TabsTrigger
                value={e.value}
                key={e.value}
                className={cn(
                  isActive ? "bg-blue-600" : "bg-white",
                  "rounded-2xl h-full grow justify-center items-center"
                )}
              >
                <Text
                  className={cn(
                    isActive ? "text-white" : "text-neutral-700",
                    "font-semibold text-sm leading-5"
                  )}
                >
                  {e.title}
                </Text>
              </TabsTrigger>
            );
          })}
        </TabsList> */}
        
        <TabsContent value="specific_specialists" className="h-full">
          <FlatList
            data={doctors}
            contentContainerClassName="gap-3 pb-4"
            showsVerticalScrollIndicator={false}
            keyExtractor={(item, index) => item.id ? item.id.toString() : `doctor-${index}`}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => handleChatPress(item.doctorId)}
                className="bg-white rounded-xl p-4 shadow-sm"
              >
                <View className="flex-row items-center gap-3">
                  {/* Avatar Section */}
                  <View className="relative">
                    {item?.profile_picture ? (
                      <Image
                        source={{ uri: item.profile_picture }}
                        className="w-16 h-16 rounded-full"
                        resizeMode="cover"
                      />
                    ) : (
                      <View className="w-16 h-16 rounded-full bg-blue-500 justify-center items-center">
                        <Text className="text-white font-bold text-lg">
                          {getInitials(item.full_name)}
                        </Text>
                      </View>
                    )}
                    {/* Online indicator (optional) */}
                    <View className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
                  </View>

                  {/* Content Section */}
                  <View className="flex-1">
                    <View className="flex-row justify-between items-start mb-1">
                      <Text className="font-semibold text-lg text-gray-900 flex-1" numberOfLines={1}>
                        {item.full_name || "Unknown Doctor"}
                      </Text>
                      <Text className="text-xs text-gray-500 ml-2">
                        {item.date || ""}
                      </Text>
                    </View>
                    
                    <Text className="text-sm text-gray-600 mb-1" numberOfLines={1}>
                      {item.specialization || "General Practitioner"}
                    </Text>
                    
                    {/* Experience or additional info */}
                    {item.experience && (
                      <Text className="text-xs text-gray-500">
                        {item.experience} years experience
                      </Text>
                    )}
                    
                    {/* Rating (if available) */}
                    {item.rating && (
                      <View className="flex-row items-center mt-1">
                        <Text className="text-xs text-yellow-600">★</Text>
                        <Text className="text-xs text-gray-600 ml-1">
                          {item.rating}
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Arrow or status indicator */}
                  <View className="justify-center">
                    <Text className="text-gray-400 text-lg">›</Text>
                  </View>
                </View>
              </TouchableOpacity>
            )}
            ListEmptyComponent={() => (
              <View className="flex-1 justify-center items-center py-10">
                <Text className="text-gray-500 text-center">
                  No doctors available
                </Text>
              </View>
            )}
          />
        </TabsContent>
        
        <TabsContent value="specialists" className="h-full">
          <View className="flex-1 justify-center items-center">
            <Text className="text-gray-500">Specialists content coming soon</Text>
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