import { View, Text, FlatList } from "react-native";
import React, { useState } from "react";
import {
  RelativePathString,
  useLocalSearchParams,
  useRouter,
} from "expo-router";
import SpecialistCard from "@/features/account/components/SpecialistCard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { toast } from "sonner-native";
import { ApiUrl } from "@/const";
import { useQuery } from "@tanstack/react-query";
import { SearchNormal1 } from "iconsax-react-native";

type UserTodayType = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  todaySchedule: any;
  image:String
};

export default function UsersTodayPage() {
  const router = useRouter();

  const [searchText, setSearchText] = useState("");

  // Fetching users with today's schedules using `useQuery`
  const {
    data: usersData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["users-today"],
    queryFn: async () => {
      const response = await fetch(`${ApiUrl}/users/today`);
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch users.");
      }
      return result.users; // Extract users array from response
    },
  });

  console.log("user", usersData);
  // Handle search filtering
  const filteredUsers = usersData?.filter((user: UserTodayType) => {
    const fullName = `${user.firstName || ""} ${user.lastName || ""}`
      .toLowerCase()
      .trim();
    const email = user.email?.toLowerCase() || "";

    return (
      fullName.includes(searchText.toLowerCase()) ||
      email.includes(searchText.toLowerCase())
    );
  });

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-gray-500">Loading...</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-red-500">Failed to fetch users.</Text>
      </View>
    );
  }

  return (
    <View className="px-4 py-6 bg-blue-50/10 h-full w-full">
      <View className="flex-col gap-3">
        <Input
          placeholder="Search for a user"
          value={searchText}
          onChangeText={setSearchText}
        />

        {filteredUsers?.length > 0 ? (
          <FlatList
            data={filteredUsers}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => {
              return (
                <SpecialistCard
                  key={item.id}
                  name={
                    `${item.firstName || ""} ${item.lastName || ""}`.trim() ||
                    "Unknown User"
                  }
                  title={item.email}
                  price={`${
                    Object.keys(item.allSchedules || {}).length
                  } schedules`}
                  likes={0}
                  imageUrl={item.image}
                  shareLink={`${item.id}`}
                  onPress={() => {
                    console.log("Navigating with ID:", item.id);
                    // FIX: Navigate to match your file structure [specialist_Id]
                    router.push({
                      pathname: `/instant-booking/s/${item.id}`, // second page
                      params: {
                        todaySchedule: JSON.stringify(item.todaySchedule), // safely pass as string
                      },
                    });
                  }}
                />
              );
            }}
            showsVerticalScrollIndicator={false}
            contentContainerClassName="flex flex-col gap-3 pb-16"
          />
        ) : (
          <Text className="text-center text-gray-500">
            No users match your search.
          </Text>
        )}
      </View>
    </View>
  );
}
