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

type ConsultType = {
  _id: string;
  full_name: string;
  specialization: string;
  profile_picture: string;
};

export default function ConsultPage() {
  const router = useRouter();
  const {
    situation,
    budget,
    type,
    language,
    gender,
    duration,
    ClosestAppointment,
  } = useLocalSearchParams();

  const [searchText, setSearchText] = useState("");

  // Fetching consultants using `useQuery`
  const {
    data: consultData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["doctor"],
    queryFn: async () => {
      const response = await fetch(
        `${ApiUrl}/api/doctors/getall`
      );
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error("Failed to fetch consultants.");
      }
      return result.data;
    },
  });

  // Handle search filtering
  const filteredConsult = consultData?.filter((consultant: ConsultType) => {
    const name = consultant.full_name?.toLowerCase() || ""; // Default to an empty string
    const specialization = consultant.specialization?.toLowerCase() || ""; // Default to an empty string

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
        <Text className="text-red-500">Failed to fetch consultants.</Text>
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
                  router.push(
                    `/account/consult/s/${item._id}` as RelativePathString
                  )
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
