import { View, Text, FlatList, ScrollView } from "react-native";
import React, { useState, useEffect } from "react";
import { H3 } from "@/components/ui/Typography";
import SupportGroupCard from "@/features/supportGroup/components/SupportGroupCard";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { toast } from "sonner-native";
import { apiBaseUrl } from "@/features/Home/constHome";
import { apiNewUrl } from "@/const";
import { RelativePathString, router } from "expo-router";
import { useUser } from "@clerk/clerk-expo";
import { useTranslation } from "react-i18next";

export default function SupportPage() {
  const { user } = useUser();
  const userId = user?.publicMetadata.dbPatientId as string;
  const [favoriteGroups, setFavoriteGroups] = useState<string[]>([]);
  const { t } = useTranslation();

  const [activeTab, setActiveTab] = useState("All");
  const [programs, setPrograms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${apiNewUrl}/api/support-groups/all`);
        const result = await response.json();
        if (response.ok) {
          setPrograms(result?.data);
        } else {
          toast.error("Failed to fetch program.");
        }
      } catch (error) {
        console.error("Error fetching program:", error);
        toast.error("An error occurred while fetching program.");
      } finally {
        setLoading(false);
      }
    };

    fetchPrograms();
  }, []);

  const handleToggleFavorite = async (group_Id: string) => {
    try {
      const isAlreadyFav = favoriteGroups.includes(group_Id);

      const url = `${apiNewUrl}/api/favorites/${
        isAlreadyFav ? "remove" : "add"
      }`;
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          itemId: group_Id,
          type: "programs",
        }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || t("FailedToUpdate"));

      toast.success(
        isAlreadyFav
          ? t("ProgramRemovedFromFavorites")
        : t("ProgramAddedToFavorites")
      );

      setFavoriteGroups((prev) =>
        isAlreadyFav
          ? prev.filter((id) => id !== group_Id)
          : [...prev, group_Id]
      );
    } catch (err) {
      toast.error(err.message ||  t("SomethingWentWrong"));
    }
  };

  // Fetch favorites on mount
  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const res = await fetch(`${apiNewUrl}/api/favorites/${userId}`);
        const data = await res.json();
        if (res.ok && data?.favorites?.programs) {
          const groupIds = data.favorites.programs.map((doc) => doc._id);
          setFavoriteGroups(groupIds);
        }
      } catch (e) {
        console.error("Error fetching favorites:", e);
      }
    };

    if (userId) {
      fetchFavorites(); // 🔁 call it on page mount
    }
  }, [userId]);

  // Filter groups based on the active tab, status, and module
  const filteredGroups = programs.filter((group) => {
    // Filter by status: only approved groups
    const statusFilter = group.approval_status === true;

    // Filter by module: only program module
    const moduleFilter = group.module?.toLowerCase() === "program";

    // Filter by category tab
    const categoryFilter =
      activeTab === "All" ||
      group.group_type?.toLowerCase() === activeTab.toLowerCase();

    return statusFilter && moduleFilter && categoryFilter;
  });

  return (
    <View className="p-4 bg-blue-50/10 h-full flex flex-col gap-2">
      <H3>{t("Programs")}</H3>

      <ScrollView
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="gap-4 py-2"
      >
        {["All", "Family", "Health", "Psychological"].map((category) => {
          const isActive = category === activeTab;
          return (
            <Button
              key={category}
              size={"sm"}
              onPress={() => setActiveTab(category)}
              className={cn(
                isActive ? "bg-blue-600" : "bg-white",
                "w-36 h-9 rounded-xl"
              )}
            >
              <Text className={cn(isActive ? "text-white" : "", "font-medium")}>
                {t(category)}
              </Text>
            </Button>
          );
        })}
      </ScrollView>

      {/* List of Support Groups */}
      {loading ? (
        <Text className="text-center text-gray-500 mt-4">{t("Loading...")}</Text>
      ) : filteredGroups.length > 0 ? (
        <FlatList
          data={filteredGroups}
          showsVerticalScrollIndicator={false}
          keyExtractor={(item) => item._id}
          contentContainerClassName=""
          renderItem={({ item }) => (
            <SupportGroupCard
              title={item.title}
              category={item.type}
              price={item.cost}
              recorded={item.recordedCount || 0}
              rating={item.rating || 0}
              image={item.imageUrl}
              onPress={() =>
                router.push(`/program/p/${item._id}` as RelativePathString)
              }
              link={`/s/${item._id}`}
              isFavorited={favoriteGroups.includes(item._id)}
              onToggleFavorite={() => handleToggleFavorite(item._id)}
            />
          )}
          contentContainerStyle={{ gap: 16, paddingVertical: 10 }}
        />
      ) : (
        <View className="flex-1">
          <Text className="text-center text-gray-500 mt-4">
           {t("NoProgramsAvailable")}
          </Text>
        </View>
      )}
    </View>
  );
}
