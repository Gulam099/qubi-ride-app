import { View, Text, FlatList } from "react-native";
import React, { useEffect, useState } from "react";
import {
  RelativePathString,
  useLocalSearchParams,
  useRouter,
} from "expo-router";
import SpecialistCard from "@/features/account/components/SpecialistCard";
import { Input } from "@/components/ui/Input";
import { useQuery } from "@tanstack/react-query";
import { ApiUrl } from "@/const";

type ConsultType = {
  _id: string;
  full_name: string;
  specialization: string;
  profile_picture: string;
  fees: number;
  likes: number;
};

export default function ConsultPage() {
  const router = useRouter();
  const { type } = useLocalSearchParams();

  const [searchText, setSearchText] = useState("");
  const [todayDoctors, setTodayDoctors] = useState<ConsultType[] | null>(null);
  const [isLoadingToday, setIsLoadingToday] = useState(false);
  const [todayError, setTodayError] = useState<string | null>(null);

  // Fetch today's doctors manually if type === 'instant'
  const fetchUsersToday = async () => {
    setIsLoadingToday(true);
    setTodayError(null);

    try {
      const response = await fetch(`${ApiUrl}/users/today`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch today's doctors");
      }

      setTodayDoctors(data.users || []);
    } catch (err: any) {
      setTodayError(err.message);
    } finally {
      setIsLoadingToday(false);
    }
  };

  // Run this only if it's 'instant'
  useEffect(() => {
    if (type === "instant") {
      fetchUsersToday();
    }
  }, [type]);

  // Fetch all doctors (scheduled)
  const {
    data: allDoctors,
    isLoading: isLoadingAll,
    isError: isErrorAll,
  } = useQuery({
    queryKey: ["doctor"],
    queryFn: async () => {
      const response = await fetch(`${ApiUrl}/api/doctors/getall`);
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error("Failed to fetch consultants.");
      }
      return result.data;
    },
    enabled: type === "schedule", // only run when type === 'schedule'
  });

  // Choose correct data source based on type
  const dataSource = type === "instant" ? todayDoctors : allDoctors;

  const isLoading =
    (type === "instant" && isLoadingToday) ||
    (type === "schedule" && isLoadingAll);

  const isError =
    (type === "instant" && !!todayError) || (type === "schedule" && isErrorAll);

  const filteredConsult = dataSource?.filter((consultant: ConsultType) => {
    const name = consultant.full_name?.toLowerCase() || "";
    const specialization = consultant.specialization?.toLowerCase() || "";

    return (
      name.includes(searchText.toLowerCase()) ||
      specialization.includes(searchText.toLowerCase())
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
        <Text className="text-red-500">
          {type === "instant"
            ? todayError || "Failed to fetch today's consultants."
            : "Failed to fetch consultants."}
        </Text>
      </View>
    );
  }

  return (
    <View className="px-4 py-6 bg-blue-50/10 h-full w-full">
      <View className="flex-col gap-3">
        <Input
          placeholder="Search for a consultant"
          value={searchText}
          onChangeText={setSearchText}
        />

        {filteredConsult?.length > 0 ? (
          <FlatList
            data={filteredConsult}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <SpecialistCard
                key={item._id}
                name={item.full_name}
                title={item.specialization}
                price={item.fees}
                likes={item.likes}
                imageUrl={item.profile_picture}
                shareLink={`${item._id}`}
               onPress={() =>
                  router.push(`/consult/s/${item._id}` as RelativePathString)
                }
              />
            )}
            showsVerticalScrollIndicator={false}
            contentContainerClassName="flex flex-col gap-3 pb-16"
          />
        ) : (
          <Text className="text-center text-gray-500">
            No consultants match your search.
          </Text>
        )}
      </View>
    </View>
  );
}
