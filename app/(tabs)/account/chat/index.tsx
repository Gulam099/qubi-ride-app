import React, { useState, useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { RelativePathString, useRouter } from "expo-router";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import { Trash } from "iconsax-react-native";
import colors from "@/utils/colors";

function ChatListPage() {
  const [chats, setChats] = useState<
    {
      id: string;
      name: string;
      date: string;
      isAvailable: boolean;
      image: string;
    }[]
  >([]);
  const router = useRouter();

  useEffect(() => {
    // Fetch chats from API (demo data for now)
    const fetchChats = async () => {
      const demoChats = [
        {
          id: "1",
          name: "DR.Mohammed Alabdulla",
          date: "April, 08",
          isAvailable: true,
          image: "https://via.placeholder.com/100",
        },
        {
          id: "2",
          name: "DR.Ahmed Khan",
          date: "April, 07",
          isAvailable: false,
          image: "https://via.placeholder.com/100",
        },
        {
          id: "3",
          name: "DR.Sara Ali",
          date: "April, 06",
          isAvailable: true,
          image: "https://via.placeholder.cdom/100",
        },
        // Add more data here
        {
          id: "4",
          name: "DR.John Doe",
          date: "April, 05",
          isAvailable: true,
          image: "https://via.placeholder.com/100",
        },
        {
          id: "5",
          name: "DR.Jane Smith",
          date: "April, 04",
          isAvailable: false,
          image: "https://via.placeholder.com/100",
        },
        {
          id: "6",
          name: "DR.Michael Brown",
          date: "April, 03",
          isAvailable: true,
          image: "https://via.placeholder.com/100",
        },
        {
          id: "7",
          name: "DR.Lisa Johnson",
          date: "April, 02",
          isAvailable: true,
          image: "https://via.placeholder.com/100",
        },
        {
          id: "8",
          name: "DR.Robert Wilson",
          date: "April, 01",
          isAvailable: false,
          image: "https://via.placeholder.com/100",
        },
        {
          id: "9",
          name: "DR.Sophia Davis",
          date: "March, 31",
          isAvailable: true,
          image: "https://via.placeholder.com/100",
        },
        {
          id: "10",
          name: "DR.William Thompson",
          date: "March, 30",
          isAvailable: true,
          image: "https://via.placeholder.com/100",
        },
      ];
      setChats(demoChats);
    };

    fetchChats();
  }, []);

  

  return (
    <View className="p-4 bg-blue-50/10 h-full">
      <Text className="text-xl font-bold mb-4">My Chats</Text>
      <FlatList
        data={chats}
        contentContainerClassName="gap-3"
        showsVerticalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            disabled={!item.isAvailable}
            onPress={() => router.push(`/account/chat/${item.id}`)}
            className={cn(
              "p-4 rounded-lg shadow-md flex-row justify-between items-center",
              item.isAvailable ? "bg-white" : "bg-gray-200"
            )}
          >
            <View className="flex-row gap-2">
              <Avatar alt="avatar-with-image" className="w-16 h-16">
                <AvatarImage
                  source={{
                    uri: item.image,
                  }}
                />
                <AvatarFallback className="bg-primary-500">
                  <Text className="text-lg font-semibold text-white">
                    {item.name.slice(3, 4)}
                  </Text>
                </AvatarFallback>
              </Avatar>
              <View className="flex-col gap-1">
                <Text
                  className={cn(
                    "font-medium text-lg",
                    !item.isAvailable && "text-gray-500"
                  )}
                >
                  {item.name}
                </Text>
                <Text
                  className={cn(
                    "text-sm",
                    !item.isAvailable && "text-gray-500"
                  )}
                >
                  {item.date}
                </Text>
              </View>
            </View>
            <Button
              disabled={!item.isAvailable}
              variant={"ghost"}
              className={cn(
                "flex-row gap-2",
                !item.isAvailable && "opacity-50"
              )}
            >
              <Text
                className={cn(
                  item.isAvailable ? "text-red-500" : "text-gray-500"
                )}
              >
                Delete
              </Text>
              <Trash
                size="20"
                color={item.isAvailable ? colors.red[500] : colors.gray[500]}
              />
            </Button>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

export default ChatListPage;
