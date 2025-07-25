import { View, Text, FlatList, ScrollView } from "react-native";
import React, { useState, useEffect } from "react";
import { H3 } from "@/components/ui/Typography";
import SupportGroupCard from "@/features/supportGroup/components/SupportGroupCard";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { toast } from "sonner-native";
import { apiBaseUrl } from "@/features/Home/constHome";

export default function SupportPage() {
  const [activeTab, setActiveTab] = useState("All");
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${apiBaseUrl}/group/list`);
        const result = await response.json();

        if (response.ok && result.success) {
          // Filter only "Approved" status groups
          const approvedGroups = result.data.filter(
            (group: any) => group.status === "Approved"
          );
          setGroups(approvedGroups);
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

  // Filter groups based on the active tab
  const filteredGroups =
    activeTab === "All"
      ? groups
      : groups.filter(
          (group) => group.category?.toLowerCase() === activeTab.toLowerCase()
        );

  return (
    <View className="p-4 bg-blue-50/10 h-full flex flex-col gap-2">
      <H3>Support Group</H3>

      <ScrollView
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="gap-4 py-2"
      >
        {["All",  "Family", "Health" , "Psychological"].map((category) => {
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
              <Text
                className={cn(
                  isActive ? "text-white" : "",
                  "font-medium"
                )}
              >
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
              category={item.category}
              price={item.price}
              recorded={item.recordedCount || 0}
              rating={item.rating || 0}
              image={item.image || "https://via.placeholder.com/150"}
              onPress={() => console.log("Group Selected:", item._id)}
              link={`/p/support/${item._id}`}
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
