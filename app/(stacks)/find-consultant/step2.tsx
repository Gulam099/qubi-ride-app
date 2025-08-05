
import { View, Text, FlatList } from "react-native";
import React, { useEffect, useState } from "react";
import {
  RelativePathString,
  useLocalSearchParams,
  useRouter,
} from "expo-router";
import SpecialistCard from "@/features/account/components/SpecialistCard";
import { toast } from "sonner-native";
import { ApiUrl } from "@/const";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useUser } from "@clerk/clerk-expo";

type ConsultType = {
  _id: string;
  full_name: string;
  specialization: string;
  specialist?: string; // Added this as it's used in filtering
  profile_picture: string;
  fees: number;
  likes: number;
  gender?: string;
  languages?: string[];
  sessionDurations?: string[];
};



export default function ConsultPage() {
  const router = useRouter();
  const { user } = useUser();
  const userId = user?.publicMetadata.dbPatientId as string;
  
  // Get all parameters from the previous page
  const {
    budget,
    consultantType,
    language,
    sessionDuration,
    gender,
   
  } = useLocalSearchParams();
  
  const { t } = useTranslation();
  const [favoriteDoctors, setFavoriteDoctors] = useState<string[]>([]);

  // Helper function to parse budget range
  const parseBudgetRange = (budgetStr: string) => {
    if (!budgetStr) return { min: 0, max: Infinity };
    
    if (budgetStr.includes("More than")) {
      return { min: 501, max: Infinity };
    }
    
    const matches = budgetStr.match(/(\d+)\s*-\s*(\d+)/);
    if (matches) {
      return { min: parseInt(matches[1]), max: parseInt(matches[2]) };
    }
    
    return { min: 0, max: Infinity };
  };

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
      fetchFavorites();
    }
  }, [userId]);

  // Enhanced filtering logic based on user requirements
  const filteredConsult = consultData?.filter((consultant: ConsultType) => {
    // User requirement filters from first component
    let matchesUserRequirements = true;

    // Budget filter
    if (budget) {
      const budgetRange = parseBudgetRange(budget as string);
      const doctorFees = consultant.fees || 0;
      matchesUserRequirements = matchesUserRequirements && 
        (doctorFees >= budgetRange.min && doctorFees <= budgetRange.max);
    }

    // Consultant type filter
    if (consultantType) {
      const requiredType = (consultantType as string).toLowerCase();
      const specialization = consultant.specialization?.toLowerCase() || "";
      matchesUserRequirements = matchesUserRequirements && 
        (specialization.includes(requiredType));
    }

    // Language filter (assuming doctor has languages array)
    if (language && consultant.languages) {
      const requiredLanguage = (language as string).toLowerCase();
      matchesUserRequirements = matchesUserRequirements && 
        consultant.languages.some(lang => lang.toLowerCase().includes(requiredLanguage));
    }

    // Gender filter (assuming doctor has gender field)
    if (gender && gender !== "Rather not say" && consultant.gender) {
      matchesUserRequirements = matchesUserRequirements && 
        consultant.gender.toLowerCase() === (gender as string).toLowerCase();
    }

    // // Session duration filter (assuming doctor has sessionDurations array)
    // if (sessionDuration && consultant.sessionDurations) {
    //   matchesUserRequirements = matchesUserRequirements && 
    //     consultant.sessionDurations.includes(sessionDuration as string);
    // }

    return matchesUserRequirements;
  });

  // Show applied filters
  const getAppliedFilters = () => {
    const filters = [];
    if (budget) filters.push(`${t("Budget")}: ${budget}`);
    if (consultantType) filters.push(`${t("Type")}: ${t(consultantType as string)}`);
    if (language) filters.push(`${t("Language")}: ${t(language as string)}`);
    if (gender && gender !== "Rather not say") filters.push(`${t("Gender")}: ${t(gender as string)}`);
    if (sessionDuration) filters.push(`${t("Duration")}: ${sessionDuration}`);
    return filters;
  };

  const appliedFilters = getAppliedFilters();

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
    <View className="px-4 py-6 bg-blue-50/20 h-full w-full">
      <View className="flex-col gap-3">
        {/* Applied Filters Display */}
        <Text className="text-lg">
          Based on your condition, we suggest that you book a session with any of the following specialists
        </Text>

        {/* Results Count */}
        <Text className="text-gray-600 text-sm">
          {filteredConsult?.length || 0} {t("doctors found")}
        </Text>

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
                  router.push(`/consult/s/${item._id}` as RelativePathString)
                }
                isFavorited={favoriteDoctors.includes(item._id)}
                onToggleFavorite={() => handleToggleFavorite(item._id)}
              />
            )}
            showsVerticalScrollIndicator={false}
            contentContainerClassName="flex flex-col gap-3 pb-16"
          />
        ) : (
          <View className="flex-1 justify-center items-center py-8">
            <Text className="text-center text-gray-500 text-lg mb-2">
              {t("No doctors match your criteria")}
            </Text>
            <Text className="text-center text-gray-400 text-sm">
              {t("Try adjusting your search or filters")}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}