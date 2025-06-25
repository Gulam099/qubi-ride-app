import { View, Text, FlatList } from "react-native";
import React, { useState } from "react";
import { useRouter } from "expo-router";
import SpecialistCard from "@/features/account/components/SpecialistCard";
import { Input } from "@/components/ui/Input";
import { ApiUrl } from "@/const";
import { useQuery } from "@tanstack/react-query";

type UserScheduleType = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  scheduleDate: string;
  schedule: {
    isHoliday: boolean;
    start: string;
    end: string;
    [key: string]: any;
  };
  image: string;
};

export default function UsersTodayPage() {
  const router = useRouter();
  const [searchText, setSearchText] = useState("");

  const {
    data: usersData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["users-scheduled"],
    queryFn: async () => {
      const res = await fetch(`${ApiUrl}/users/today`);
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed to fetch users.");
      return result.users; // Includes both today & tomorrow
    },
  });

  const getAvailableUsers = (users: UserScheduleType[]) => {
    if (!users) return [];

    const now = new Date();

    return users.filter((user) => {
      const { schedule } = user;
      if (!schedule || schedule.isHoliday) return false;
      const end = new Date(schedule.end);
      return end > now;
    });
  };

  const availableUsers = getAvailableUsers(usersData);

  // Optional: sort users by scheduleDate (today first)
  const sortedUsers = availableUsers.sort((a, b) =>
    a.scheduleDate.localeCompare(b.scheduleDate)
  );

  const filteredUsers = sortedUsers.filter((user) => {
    const fullName = `${user.firstName || ""} ${user.lastName || ""}`
      .toLowerCase()
      .trim();
    const email = user.email?.toLowerCase() || "";
    const search = searchText.toLowerCase();
    return fullName.includes(search) || email.includes(search);
  });

  const getEmptyStateMessage = () => {
    if (!availableUsers || availableUsers.length === 0) {
      return "No doctors available instantly please book scheduled appointment.";
    }
    if (searchText.trim() && filteredUsers.length === 0) {
      return "No doctors match your search.";
    }
    return "";
  };

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
  console.log("usersData schedule", filteredUsers);
  return (
    <View className="px-4 py-6 bg-blue-50/10 h-full w-full">
      <View className="flex-col gap-3">
        <Input
          placeholder="Search for a doctor"
          value={searchText}
          onChangeText={setSearchText}
        />

        {filteredUsers.length > 0 ? (
          <FlatList
            data={filteredUsers}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <SpecialistCard
                key={item.id}
                name={`${item.firstName} ${item.lastName}`.trim()}
                title={item.specialization}
                price={item.fees}
                likes={0}
                imageUrl={item.image}
                shareLink={item.id}
                onPress={() => {
                  router.push({
                    pathname: `/instant-booking/s/${item.id}`,
                    params: {
                      todaySchedule: JSON.stringify(item.schedule),
                      doctorFees: "0",
                    },
                  });
                }}
              />
            )}
            showsVerticalScrollIndicator={false}
            contentContainerClassName="flex flex-col gap-3 pb-16"
          />
        ) : (
          <Text className="text-center text-gray-500">
            {getEmptyStateMessage()}
          </Text>
        )}
      </View>
    </View>
  );
}
