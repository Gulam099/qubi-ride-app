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

export default function SupportPage() {
  const { user } = useUser();
  const userId = user?.publicMetadata.dbPatientId as string;
  const [favoriteGroups, setFavoriteGroups] = useState<string[]>([]);

  const [activeTab, setActiveTab] = useState("All");
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${apiNewUrl}/api/support-groups/all`);
        const result = await response.json();

        console.log("result", result);
        if (response.ok) {
          setGroups(result?.data);
        } else {
          toast.error("Failed to fetch support groups.");
        }
      } catch (error) {
        console.error("Error fetching support groups:", error);
        toast.error("An error occurred while fetching support groups.");
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
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
          type: "groups",
        }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Failed to update");

      toast.success(
        isAlreadyFav
          ? "Group removed from favorites!"
          : "Group added to favorites!"
      );

      setFavoriteGroups((prev) =>
        isAlreadyFav
          ? prev.filter((id) => id !== group_Id)
          : [...prev, group_Id]
      );
    } catch (err) {
      toast.error(err.message || "Something went wrong");
    }
  };

  // Fetch favorites on mount
  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const res = await fetch(`${apiNewUrl}/api/favorites/${userId}`);
        const data = await res.json();
        if (res.ok && data?.favorites?.supportGroups) {
          const groupIds = data.favorites.supportGroups.map((doc) => doc._id);
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

  // Filter groups based on the active tab
  const filteredGroups =
    activeTab === "All"
      ? groups
      : groups.filter(
          (group) => group.group_type?.toLowerCase() === activeTab.toLowerCase()
        );

  return (
    <View className="p-4 bg-blue-50/10 h-full flex flex-col gap-2">
      <H3>Support Group</H3>

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
                {category}
              </Text>
            </Button>
          );
        })}
      </ScrollView>

      {/* List of Support Groups */}
      {loading ? (
        <Text className="text-center text-gray-500 mt-4">Loading...</Text>
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
                router.push(`/group/s/${item._id}` as RelativePathString)
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
            No Groups Available
          </Text>
        </View>
      )}
    </View>
  );
}
