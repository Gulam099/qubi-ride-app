import { View, Text, FlatList, Image, ScrollView } from "react-native";
import React, { useState, useEffect } from "react";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import BackButton from "@/features/Home/Components/BackButton";
import { Button } from "@/components/ui/Button";
import { Separator } from "@/components/ui/Separator";
import ProfileImage from "@/features/account/components/ProfileImage";
import {
  ClipboardText,
  HeartSearch,
  Messages2,
  Star1,
} from "iconsax-react-native";
import { Hourglass, IdCard } from "lucide-react-native";
import { Avatar, AvatarFallback } from "@/components/ui/Avatar";
import { toCapitalizeFirstLetter } from "@/utils/string.utils";
import { currencyFormatter } from "@/utils/currencyFormatter.utils";
import { toast } from "sonner-native";
import { ApiUrl, apiNewUrl } from "@/const";
import { useQuery } from "@tanstack/react-query";

export default function SpecialistConsultantPage() {
  const router = useRouter();
  const { specialist_Id } = useLocalSearchParams();

  // Fetch function
  const fetchSpecialistData = async () => {
    if (!specialist_Id) throw new Error("Specialist ID is missing.");

    const response = await fetch(
      `${ApiUrl}/api/doctor/get-doctor/${specialist_Id}`
    );
    if (!response.ok) {
      const errorMessage = `Failed to fetch specialist data (ID: ${specialist_Id}).`;
      console.error(errorMessage);
      throw new Error(errorMessage);
    }

    const result = await response.json();

    if (!result) {
      throw new Error("Invalid data received from server.");
    }

    return result;
  };

  // Fetching data with useQuery
  const {
    data: specialistData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["doctor", specialist_Id],
    queryFn: fetchSpecialistData,
    enabled: !!specialist_Id, // Ensure specialist_Id exists before fetching
  });

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text>Loading...</Text>
      </View>
    );
  }

  if (error || !specialistData) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-red-500">
          {error?.message || "Specialist not found."}
        </Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerLeft: () => <BackButton />,
          headerTitle: () => (
            <Text className="font-semibold text-lg ">
              {specialistData.full_name}
            </Text>
          ),
        }}
      />

      <ScrollView className="flex-1 bg-blue-50/10 px-2">
        {/* Header Section */}
        <View className="bg-white py-4 rounded-2xl flex items-center mt-2 relative overflow-hidden flex-col gap-2">
          <View className="absolute w-full h-24 bg-blue-900"></View>
          <ProfileImage
            imageUrl={specialistData.profile_picture ?? ""}
            name={specialistData.full_name}
            className="size-32"
          />
          <Text className="text-xl font-semibold ">
            {specialistData.full_name ?? "No name found"}
          </Text>
          <Text className="text-sm text-neutral-600 text-center font-normal w-2/3">
            {specialistData.specialization ?? "Specialist"}
          </Text>

          {/* Details Section */}
          <View className="mt-4">
            <View className="flex-row w-full">
              {[
                {
                  title: "Rating",
                  value: specialistData.rating ?? "0",
                  icon: Star1,
                },
                {
                  title: "Experience",
                  value: specialistData.experience ?? "0",
                  icon: IdCard,
                },
                {
                  title: "Session Type",
                  value: specialistData.sessionType ?? "0",
                  icon: HeartSearch,
                },
              ].map((item) => (
                <View
                  className="flex-col justify-center items-center mb-4 flex-1 w-full"
                  key={item.title}
                >
                  <View className="bg-blue-50/30 rounded-full p-2">
                    <item.icon size={22} color="#222" />
                  </View>
                  <Text className="text-sm text-gray-600">{item.title}</Text>
                  <Text className="text-sm font-bold">{item.value}</Text>
                </View>
              ))}
            </View>
            <View className="flex-row gap-2 px-4">
              <View className="bg-blue-50/30 rounded-full p-2">
                <Hourglass size={22} color="#222" />
              </View>
              <View>
                <Text className="text-sm text-gray-600">Response time</Text>
                <Text className="text-sm font-bold">
                  {specialistData.responseTime ?? "N/A"}
                </Text>
              </View>
            </View>
          </View>

          {/* Specialties Section */}
          {specialistData.expertise && (
            <View className="mt-4 bg-white p-4 rounded-2xl gap-4 w-full">
              <View className="flex-row gap-2 items-center w-full">
                <View className="bg-blue-50/30 rounded-full p-2">
                  <ClipboardText size={22} color="#222" />
                </View>

                <Text className="text-lg font-bold ">
                  My expertise includes
                </Text>
              </View>
              <View className="flex-row flex-wrap gap-2">
                {specialistData.expertise.map((item: any, index: any) => (
                  <Text
                    key={index}
                    className="bg-blue-50/20 text-blue-800 border border-blue-800 px-4 py-2 rounded-2xl text-sm font-medium leading-6"
                  >
                    {item}
                  </Text>
                ))}
              </View>
            </View>
          )}

          {/* Feedback Section */}
          {specialistData.feedback && (
            <View className="mt-4 bg-white p-4 rounded-2xl w-full gap-2">
              <View className="flex-row justify-between items-center">
                <View className="flex-row gap-2 items-center">
                  <View className="bg-blue-50/30 rounded-full p-2">
                    <Messages2 size={22} color="#222" />
                  </View>
                  <Text className="text-lg font-bold ">Feedback</Text>
                </View>
                <Text className="text-sm text-blue-500">View All</Text>
              </View>
              <Separator />
              {specialistData.feedback.length !== 0 ? (
                specialistData.feedback.map((item: any, index: any) => (
                  <View
                    key={index}
                    className="flex-row justify-between items-center py-2 gap-2"
                  >
                    <View className="flex-row items-center">
                      <Avatar alt="avatar-without-image">
                        <AvatarFallback className="bg-primary-700">
                          <Text className="text-white font-semibold">
                            {toCapitalizeFirstLetter(item.slice(0, 1))}
                          </Text>
                        </AvatarFallback>
                      </Avatar>
                    </View>
                    <View className="flex-1 w-full">
                      <View className="flex-row justify-between">
                        <Text>{item.user || "Anonymous"}</Text>
                        <Text className="text-sm text-neutral-500">
                          {item.date || "N/A"}
                        </Text>
                      </View>
                      <Text className="text-sm text-blue-600">
                        {item.comment || ""}
                      </Text>
                    </View>
                  </View>
                ))
              ) : (
                <Text className="text-sm text-center text-neutral-600">
                  No feedback available
                </Text>
              )}
            </View>
          )}
        </View>

        {/* Book Now Button */}
        <Button
          className="mt-4 bg-purple-600 mb-6"
          onPress={() =>
            router.push(`/account/consult/s/${specialist_Id}/session`)
          }
        >
          <Text className="text-white font-bold">
            Book now {currencyFormatter(specialistData.fees ?? 0)}
          </Text>
        </Button>
      </ScrollView>
    </>
  );
}
