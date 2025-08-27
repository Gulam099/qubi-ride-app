import { View, Text, FlatList } from "react-native";
import React, { useEffect, useState } from "react";
import { RelativePathString, useRouter } from "expo-router";
import SpecialistCard from "@/features/account/components/SpecialistCard";
import { Input } from "@/components/ui/Input";
import { ApiUrl } from "@/const";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useUser } from "@clerk/clerk-expo";

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
  const [favoriteDoctors, setFavoriteDoctors] = useState<string[]>([]);
  const { user } = useUser();
  const userId = user?.publicMetadata.dbPatientId as string;
  const router = useRouter();
  const [searchText, setSearchText] = useState("");
  const { t } = useTranslation();

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

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const res = await fetch(`${ApiUrl}/api/favorites/${userId}`);
        const data = await res.json();
        if (res.ok && data?.favorites?.doctors) {
          const ids = data.favorites.doctors.map((doc) => doc._id);
          setFavoriteDoctors(ids);
        }
      } catch (e) {
        console.error("Error fetching favorites:", e);
      }
    };

    if (userId) fetchFavorites();
  }, [userId]);

  const handleToggleFavorite = async (specialist_Id: string) => {
    const isFav = favoriteDoctors.includes(specialist_Id);
    const url = `${ApiUrl}/api/favorites/${isFav ? "remove" : "add"}`;

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          itemId: specialist_Id,
          type: "doctors",
        }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Failed");

      setFavoriteDoctors((prev) =>
        isFav
          ? prev.filter((id) => id !== specialist_Id)
          : [...prev, specialist_Id]
      );
    } catch (e) {
      console.error("Favorite toggle error:", e);
    }
  };

  const getEmptyStateMessage = () => {
    if (!availableUsers || availableUsers.length === 0) {
      return t("noDoctorsAvailable");
    }
    if (searchText.trim() && filteredUsers.length === 0) {
      return t("noDoctorsMatchSearch");
    }
    return "";
  };

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-gray-500">{t("Loading")}</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-red-500">{t("errorFetchUsers")}</Text>
      </View>
    );
  }
  console.log("usersData schedule", filteredUsers);
  return (
    <View className="px-4 py-6 bg-blue-50/10 h-full w-full">
      <View className="flex-col gap-3">
        <Input
          placeholder={t("Search for a doctor")}
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
                likes={item.likes}
                imageUrl={item.image}
                shareLink={item.id}
                isFavorited={favoriteDoctors.includes(item.id)} 
                onToggleFavorite={() => handleToggleFavorite(item.id)} 
                onPress={() => {
                  router.push({
                    pathname:
                      `(tabs)/home/instant-booking/i/${item.id}` as RelativePathString,
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
