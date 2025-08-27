import {
  View,
  Text,
  FlatList,
  Image,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import React, { useState, useEffect } from "react";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import BackButton from "@/features/Home/Components/BackButton";
import { Button } from "@/components/ui/Button";
import { Separator } from "@/components/ui/Separator";
import ProfileImage from "@/features/account/components/ProfileImage";
import {
  ClipboardText,
  HeartSearch,
  Like1,
  Messages2,
  Star1,
} from "iconsax-react-native";
import { Hourglass, IdCard } from "lucide-react-native";
import { Avatar, AvatarFallback } from "@/components/ui/Avatar";
import { toCapitalizeFirstLetter } from "@/utils/string.utils";
import { currencyFormatter } from "@/utils/currencyFormatter.utils";
import { toast } from "sonner-native";
import { ApiUrl } from "@/const";
import { useQuery } from "@tanstack/react-query";
import { useUser } from "@clerk/clerk-expo";
import { useTranslation } from "react-i18next";

export default function SpecialistConsultantPage() {
  const router = useRouter();
  const { specialist_Id } = useLocalSearchParams();
  const { user } = useUser();
  const userId = user?.publicMetadata.dbPatientId as string;
  const [isFavorited, setIsFavorited] = useState(false);
  const { t } = useTranslation();

  const fetchSpecialistData = async () => {
    if (!specialist_Id) throw new Error(t("missingSpecialistId"));
    const response = await fetch(
      `${ApiUrl}/api/doctors/doctor/${specialist_Id}`
    );
    if (!response.ok) throw new Error(t("fetchSpecialistFailed"));
    return await response.json();
  };

  const {
    data: specialistData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["doctor", specialist_Id],
    queryFn: fetchSpecialistData,
    enabled: !!specialist_Id,
  });

  useEffect(() => {
    const checkFavorites = async () => {
      try {
        const res = await fetch(`${ApiUrl}/api/favorites/${userId}`);
        const data = await res.json();
        if (
          res.ok &&
          data?.favorites?.doctors?.some((doc) => doc._id === specialist_Id)
        ) {
          setIsFavorited(true);
        } else {
          setIsFavorited(false);
        }
      } catch (e) {
        console.error("Error checking favorites:", e);
      }
    };
    if (userId && specialist_Id) checkFavorites();
  }, [userId, specialist_Id]);

  const handleAddToFavorites = async () => {
    try {
      const response = await fetch(`${ApiUrl}/api/favorites/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          itemId: specialist_Id,
          type: "doctors",
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Failed to add");
      toast.success("Doctor added to favorites!");
      setIsFavorited(true);
    } catch (err) {
      toast.error(err.message || "Something went wrong");
    }
  };

  const handleRemoveFromFavorites = async () => {
    try {
      const response = await fetch(`${ApiUrl}/api/favorites/remove`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          itemId: specialist_Id,
          type: "doctors",
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Failed to remove");
      toast.success("Doctor removed from favorites!");
      setIsFavorited(false);
    } catch (err) {
      toast.error(err.message || "Something went wrong");
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text>{t("Loading")}</Text>
      </View>
    );
  }

  if (error || !specialistData) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-red-500">
          {error?.message || t("specialistNotFound")}
        </Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-blue-50/10 px-2">
      <View className="bg-white py-4 rounded-2xl items-center mt-2 relative">
        <View
          className="absolute w-full h-24"
          style={{ backgroundColor: "#000F8F" }}
        ></View>
        <ProfileImage
          imageUrl={specialistData?.data?.profile_picture ?? ""}
          name={specialistData?.data?.full_name}
          className="size-32"
        />
        <Text className="text-xl font-semibold ">
          {specialistData?.data?.full_name ?? "No name found"}
        </Text>
        <Text className="text-sm text-neutral-600 text-center font-normal w-2/3">
          {specialistData?.data?.specialization ?? "Specialist"}
        </Text>

        {/* <TouchableOpacity
          className="absolute top-3 right-3 bg-white rounded-full p-2 shadow-md"
          onPress={
            isFavorited ? handleRemoveFromFavorites : handleAddToFavorites
          }
        >
          <Like1
            size={24}
            color={isFavorited ? "#2563eb" : "#9ca3af"} // Blue or gray
            variant="Bold"
          />
        </TouchableOpacity> */}

        <View className="mt-4">
          <View className="flex-row w-full">
            {[
              {
                title: t("Rating"),
                value: specialistData?.data?.averageRating ?? "0",
                icon: Star1,
              },
              {
                title: t("Experience"),
                value: specialistData?.data?.experience ?? "0",
                icon: IdCard,
              },
              {
                title: t("Session Type"),
                value: specialistData?.data?.sessionType ?? "0",
                icon: HeartSearch,
              },
              {
                title: t("Response Time"),
                value: specialistData?.data?.responseTime ?? t("notAvailable"),
                icon: Hourglass,
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
          {/* <View className="flex-row gap-2 px-4">
            <View className="bg-blue-50/30 rounded-full p-2">
              <Hourglass size={22} color="#222" />
            </View>
            <View>
              <Text className="text-sm text-gray-600">Response time</Text>
              <Text className="text-sm font-bold">
                {specialistData?.data?.responseTime ?? "N/A"}
              </Text>
            </View>
          </View> */}
        </View>

        {/* Expertise Section */}
        {/* {specialistData.expertise && (
          <View className="mt-4 bg-white p-4 rounded-2xl gap-4 w-full">
            <View className="flex-row gap-2 items-center">
              <View className="bg-blue-50/30 rounded-full p-2">
                <ClipboardText size={22} color="#222" />
              </View>
              <Text className="text-lg font-bold">My expertise includes</Text>
            </View>
            <View className="flex-row flex-wrap gap-2">
              {specialistData.expertise.map((item, index) => (
                <Text key={index} className="bg-blue-50/20 text-blue-800 border border-blue-800 px-4 py-2 rounded-2xl text-sm font-medium">
                  {item}
                </Text>
              ))}
            </View>
          </View>
        )} */}

        {/* Feedback Section */}
        {/* {specialistData.feedback && (
          <View className="mt-4 bg-white p-4 rounded-2xl w-full gap-2">
            <View className="flex-row justify-between items-center">
              <View className="flex-row gap-2 items-center">
                <View className="bg-blue-50/30 rounded-full p-2">
                  <Messages2 size={22} color="#222" />
                </View>
                <Text className="text-lg font-bold">Feedback</Text>
              </View>
              <Text className="text-sm text-blue-500">View All</Text>
            </View>
            <Separator />
            {specialistData.feedback.length !== 0 ? (
              specialistData.feedback.map((item, index) => (
                <View key={index} className="flex-row items-center gap-2 py-2">
                  <Avatar alt="avatar">
                    <AvatarFallback className="bg-primary-700">
                      <Text className="text-white font-semibold">
                        {toCapitalizeFirstLetter(item.slice(0, 1))}
                      </Text>
                    </AvatarFallback>
                  </Avatar>
                  <View className="flex-1">
                    <View className="flex-row justify-between">
                      <Text>{item.user || "Anonymous"}</Text>
                      <Text className="text-sm text-neutral-500">{item.date || "N/A"}</Text>
                    </View>
                    <Text className="text-sm text-blue-600">{item.comment || ""}</Text>
                  </View>
                </View>
              ))
            ) : (
              <Text className="text-sm text-center text-neutral-600">No feedback available</Text>
            )}
          </View>
        )} */}
      </View>

      {/* Book Now */}
      <Button
        className="mt-4 mb-6"
        onPress={() =>
          router.push({
            pathname: `/(tabs)/home/schedule-booking/s/${specialist_Id}/session`,
            params: {
              doctorFees: specialistData?.data?.fees?.toString() || "0",
            },
          })
        }
      >
        <Text className="text-white font-bold">
          {t("Book now")}{" "}
          {specialistData?.data?.fees != 0
            ? currencyFormatter(specialistData?.data?.fees ?? 0)
            : t("for free")}
        </Text>
      </Button>
    </ScrollView>
  );
}
