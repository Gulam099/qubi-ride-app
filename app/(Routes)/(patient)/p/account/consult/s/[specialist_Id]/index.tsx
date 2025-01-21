import { View, Text, FlatList, Image, ScrollView } from "react-native";
import React, { useState, useEffect } from "react";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import BackButton from "@/features/Home/Components/BackButton";
import { Button } from "@/components/ui/Button";
import { Separator } from "@/components/ui/Separator";
import { useSelector } from "react-redux";
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

export default function SpecialistConsultantPage() {
  const router = useRouter();
  const { specialist_Id } = useLocalSearchParams();
  const [specialistData, setSpecialistData] = useState<any>(null);

  const mockData = {
    name: "DR. Deem Alabdullah",
    title: "Consultant physician, certified by the Saudi Board in Psychiatry",
    rating: 4.8,
    experience: "10 Years",
    sessionType: "Psychological",
    responseTime: "Within an hour",
    specialties: [
      "Anxiety and stress",
      "Overthinking",
      "Psychological stress",
      "Panic",
      "Obsessive",
      "Dealing with remorse of conscience",
      "Social phobia",
    ],
    qualities: [
      { label: "Adherence to appointments", percentage: "100%" },
      { label: "Quiet environment", percentage: "100%" },
      { label: "Compassion and acceptance", percentage: "100%" },
      { label: "Respecting thoughts and opinions", percentage: "99%" },
      { label: "Attentiveness and listening", percentage: "100%" },
      { label: "Feeling safe during the session", percentage: "100%" },
    ],
    feedback: [
      { username: "a******", comment: "Good", date: "05 Sep 2023" },
      { username: "b******", comment: "Excellent", date: "05 Sep 2023" },
    ],
    price: "280 SAR",
    profileImage:
      "https://static.vecteezy.com/system/resources/thumbnails/026/375/249/small_2x/ai-generative-portrait-of-confident-male-doctor-in-white-coat-and-stethoscope-standing-with-arms-crossed-and-looking-at-camera-photo.jpg", // Replace with specialist image
  };

  // Fetch specialist data (mocked for now)
  useEffect(() => {
    // Replace with actual API call if necessary
    setSpecialistData(mockData);
  }, [specialist_Id]);

  if (!specialistData) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text>Loading...</Text>
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
              Consultant: {specialist_Id}
            </Text>
          ),
        }}
      />

      <ScrollView className="flex-1 bg-blue-50/10 px-2 ">
        {/* Header Section */}
        <View className="bg-white py-4 rounded-2xl flex items-center mt-2 relative overflow-hidden flex-col gap-2">
          <View className="absolute w-full h-24 bg-blue-900"></View>
          <ProfileImage
            imageUrl={specialistData.profileImage}
            name={specialistData.name}
            className="size-32"
          />
          <Text className="text-xl font-bold ">{specialistData.name}</Text>
          <Text className="text-sm text-neutral-600 text-center font-normal w-2/3">
            {specialistData.title}
          </Text>
          {/* Details Section */}
          <View className="mt-4 ">
            <View className=" flex-row  w-full">
              {[
                {
                  title: "Rating",
                  value: specialistData.rating,
                  icon: Star1,
                },
                {
                  title: "Experience",
                  value: specialistData.experience,
                  icon: IdCard,
                },
                {
                  title: "Session type",
                  value: specialistData.sessionType,
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
                  {specialistData.responseTime}
                </Text>
              </View>
            </View>
          </View>
          {/* Specialties Section */}
          <View className="mt-4 bg-white p-4 rounded-2xl gap-4">
            <View className="flex-row gap-2 items-center">
              <View className="bg-blue-50/30 rounded-full p-2">
                <ClipboardText size={22} color="#222" />
              </View>

              <Text className="text-lg font-bold ">My experience includes</Text>
            </View>
            <View className="flex-row flex-wrap gap-2">
              {specialistData.specialties.map((item: any, index: any) => (
                <Text
                  key={index}
                  className="bg-blue-50/20 text-blue-800 border border-blue-800 px-4 py-2 rounded-2xl text-sm font-medium leading-6"
                >
                  {item}
                </Text>
              ))}
            </View>
          </View>
          {/* Qualities Section */}
          <View className=" bg-white p-4 rounded-2xl w-full">
            <View className="flex-row gap-2 items-center">
              <View className="bg-blue-50/30 rounded-full p-2">
                <ClipboardText size={22} color="#222" />
              </View>

              <Text className="text-lg font-bold ">Why choose me?</Text>
            </View>
            <View className="gap-2 pt-4">
              {specialistData.qualities.map((quality: any, index: any) => (
                <View
                  key={index}
                  className="flex-row justify-between items-center mb-2"
                >
                  <View className="flex-row items-center gap-2">
                    <View className="bg-blue-800 size-3 rounded-full"></View>
                    <Text className="text-sm text-gray-600 ">
                      {quality.label}
                    </Text>
                  </View>
                  <Text className="text-sm font-bold">
                    {quality.percentage}
                  </Text>
                </View>
              ))}
            </View>
          </View>
          {/* Feedback Section */}
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
            {specialistData.feedback.map((item: any, index: any) => (
              <View
                key={index}
                className="flex-row justify-between items-center py-2 gap-2"
              >
                <View className="flex-row items-center">
                  <Avatar alt="avatar-without-image">
                    <AvatarFallback className="bg-primary-700">
                      <Text className="text-white font-semibold">
                        {toCapitalizeFirstLetter(item.username.slice(0, 1))}
                      </Text>
                    </AvatarFallback>
                  </Avatar>
                </View>
                <View className="flex-1 w-full">
                  <View className="flex-row justify-between">
                    <Text>{item.username}</Text>
                    <Text className="text-sm text-neutral-500">
                      {item.date}
                    </Text>
                  </View>

                  <Text className="text-sm text-blue-600">{item.comment}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Book Now Button */}
        <Button
          className="mt-4 bg-purple-600 mb-6"
          onPress={() =>
            router.push(`/p/account/consult/s/${specialist_Id}/session`)
          }
        >
          <Text className="text-white font-bold">
            Book now {currencyFormatter(specialistData.price)}
          </Text>
        </Button>
      </ScrollView>
    </>
  );
}
