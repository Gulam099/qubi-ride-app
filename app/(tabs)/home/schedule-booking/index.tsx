import { View, Text, FlatList, TouchableOpacity } from "react-native";
import React, { useEffect, useState } from "react";
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
import { SearchNormal1, ArrowDown2 } from "iconsax-react-native";
import { useTranslation } from "react-i18next";
import { useUser } from "@clerk/clerk-expo";

type ConsultType = {
  _id: string;
  full_name: string;
  specialization: string;
  profile_picture: string;
  fees: number;
  likes: number;
};

const SPECIALIST_TYPES = [
  "All Specialists",
  "Assistant Specialist",
  "Specialist",
  "First Specialist",
  "Consultant",
  "Deputy Specialist Doctor",
  "First Deputy Specialist Doctor",
  "Consultant Doctor",
  "First Consultant Doctor (Subspecialty)",
];

// Dropdown Component
const SpecialistDropdown = ({
  selectedValue,
  onValueChange,
  options,
}: {
  selectedValue: string;
  onValueChange: (value: string) => void;
  options: string[];
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();

  return (
    <View className="relative">
      <TouchableOpacity
        className="flex-row items-center justify-between bg-white border border-gray-200 rounded-lg px-4 py-3"
        onPress={() => setIsOpen(!isOpen)}
      >
        <Text className="text-gray-700 flex-1">{t(selectedValue)}</Text>
        <ArrowDown2 size={16} color="#6B7280" />
      </TouchableOpacity>

      {isOpen && (
        <View className="absolute top-full left-0 right-0 z-10 bg-white border border-gray-200 rounded-lg mt-1 max-h-48">
          <FlatList
            data={options}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                className={`px-4 py-3 border-b border-gray-100 ${
                  selectedValue === item ? "bg-blue-50" : ""
                }`}
                onPress={() => {
                  onValueChange(item);
                  setIsOpen(false);
                }}
              >
                <Text
                  className={`${
                    selectedValue === item
                      ? "text-blue-600 font-medium"
                      : "text-gray-700"
                  }`}
                >
                  {t(item)}
                </Text>
              </TouchableOpacity>
            )}
            showsVerticalScrollIndicator={false}
          />
        </View>
      )}
    </View>
  );
};

export default function ConsultPage() {
  const router = useRouter();
  const { user } = useUser();
  const userId = user?.publicMetadata.dbPatientId as string;
  const {
    situation,
    budget,
    type,
    language,
    gender,
    duration,
    ClosestAppointment,
  } = useLocalSearchParams();
  const { t } = useTranslation();
  const [favoriteDoctors, setFavoriteDoctors] = useState<string[]>([]);

  const [searchText, setSearchText] = useState("");
  const [selectedSpecialistType, setSelectedSpecialistType] =
    useState("All Specialists");

  // Fetching consultants using `useQuery`
  const {
    data: consultData,
    isLoading,
    isError,
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
  });

  const handleToggleFavorite = async (specialist_Id: string) => {
    try {
      const isAlreadyFav = favoriteDoctors.includes(specialist_Id);

      const url = `${ApiUrl}/api/favorites/${isAlreadyFav ? "remove" : "add"}`;
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          itemId: specialist_Id,
          type: "doctors",
        }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Failed to update");

      toast.success(
        isAlreadyFav
          ? t("Doctor removed from favorites!")
          : t("Doctor added to favorites!")
      );

      setFavoriteDoctors((prev) =>
        isAlreadyFav
          ? prev.filter((id) => id !== specialist_Id)
          : [...prev, specialist_Id]
      );
    } catch (err) {
      toast.error(err.message || "Something went wrong");
    }
  };

  // Fetch favorites on mount
  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const res = await fetch(`${ApiUrl}/api/favorites/${userId}`);
        const data = await res.json();
        if (res.ok && data?.favorites?.doctors) {
          const doctorIds = data.favorites.doctors.map((doc) => doc._id);
          setFavoriteDoctors(doctorIds);
        }
      } catch (e) {
        console.error("Error fetching favorites:", e);
      }
    };

    if (userId) {
      fetchFavorites(); // 🔁 call it on page mount
    }
  }, [userId]);
  // Handle search and dropdown filtering
  const filteredConsult = consultData?.filter((consultant: ConsultType) => {
    const name = consultant.full_name?.toLowerCase() || "";
    const specialization = consultant.specialist?.toLowerCase() || "";

    // Text search filter
    const matchesSearch =
      name.includes(searchText.toLowerCase()) ||
      specialization.includes(searchText.toLowerCase());

    // Specialist type filter
    const matchesSpecialistType =
      selectedSpecialistType === "All Specialists" ||
      specialization.includes(selectedSpecialistType.toLowerCase());

    return matchesSearch && matchesSpecialistType;
  });

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

  return (
    <View className="px-4 py-6 bg-blue-50/10 h-full w-full">
      <View className="flex-col gap-3">
        {/* Search Input */}
        <Input
          placeholder={t("Search for a doctor")}
          value={searchText}
          onChangeText={setSearchText}
        />

        {/* Specialist Type Dropdown */}
        <SpecialistDropdown
          selectedValue={selectedSpecialistType}
          onValueChange={setSelectedSpecialistType}
          options={SPECIALIST_TYPES}
        />

        {/* Results */}
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
                itemo={item}
                onPress={() =>
                  router.push(`/(tabs)/home/schedule-booking/s/${item._id}` as RelativePathString)
                }
                isFavorited={favoriteDoctors.includes(item._id)}
                onToggleFavorite={() => handleToggleFavorite(item._id)}
              />
            )}
            showsVerticalScrollIndicator={false}
            contentContainerClassName="flex flex-col gap-3 pb-16"
          />
        ) : (
          <Text className="text-center text-gray-500">
            {t("noDoctorsMatchSearch")}
          </Text>
        )}
      </View>
    </View>
  );
}
