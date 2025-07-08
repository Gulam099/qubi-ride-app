import {
  View,
  Text,
  ScrollView,
  FlatList,
  ActivityIndicator,
  Pressable,
} from "react-native";
import React, { useState, useEffect } from "react";
import { H3 } from "@/components/ui/Typography";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import FavProgramCard from "@/features/favorite/components/FavProgramCard";
import FavConsultantCard from "@/features/favorite/components/FavConsultantCard";
import FavGroupCard from "@/features/favorite/components/FavGroupCard";
import { toast } from "sonner-native";
import FavLibraryCard from "@/features/favorite/components/FavLibraryCard";
import { UserType } from "@/features/user/types/user.type";
import { useSelector } from "react-redux";
import { useUser } from "@clerk/clerk-expo";
import { ApiUrl } from "@/const";
import { useTranslation } from "react-i18next";

export default function AccountFavoritePage() {
  const { t } = useTranslation();

  const tabs = [
    // { type: "program", name: "Programs", api: "/api/favorites/programs/" },
    { type: "consult", name: t("consultants"), api: "/api/favorites/doctors/" },
    // { type: "group", name: "Groups", api: "/api/favorites/groups/" },
    {
      type: "culturalContent",
      name: t("libraries"),
      api: "/api/favorites/culturalContent/",
    },
  ];

  const { user } = useUser();
  const userId = user?.publicMetadata.dbPatientId as string;

  const [activeTab, setActiveTab] = useState(tabs[0].type);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData(activeTab);
  }, [activeTab]);

  const fetchData = async (tabType: string) => {
    const selectedTab = tabs.find((tab) => tab.type === tabType);
    if (!selectedTab) return;

    setLoading(true);
    try {
      const response = await fetch(`${ApiUrl}${selectedTab.api}${userId}`);
      const result = await response.json();

      if (response.ok) {
        setData(result.data || []);
      } else {
        toast.error(result.message || "Failed to fetch data");
        setData([]);
      }
    } catch (error) {
      toast.error("Error fetching data");
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  // const handleRemove = async (itemId: string, type: string) => {
  //   try {
  //     const response = await fetch(`${ApiUrl}/api/favorites/remove`, {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({ userId, itemId, type }),
  //     });

  //     const result = await response.json();
  //     if (!response.ok) throw new Error(result.message || "Failed to remove");

  //     toast.success("Removed from favorites");
  //     fetchData(type); // Refresh current tab
  //   } catch (err) {
  //     toast.error(err.message || "Something went wrong");
  //   }
  // };

  const renderContent = () => {
    if (loading) {
      return <ActivityIndicator size="large" color="#0000ff" />;
    }

    if (!data.length) {
      return (
        <View className="flex justify-center items-center mt-4">
          <Text className="text-neutral-500">{t("noItemAvailable")}</Text>
        </View>
      );
    }

    switch (activeTab) {
      // case "program":
      //   return data.map((item, index) => (
      //     <FavProgramCard
      //       key={item._id}
      //       title={item.title}
      //       price={item.cost}
      //       image={item.image} //missing in return Data
      //       subtitle={item.components}
      //       date={item.date} //missing in return Data
      //     />
      //   ));
      case "consult":
        return data.map((item) => (
          <FavConsultantCard
            key={item._id}
            name={item.full_name}
            profession={item.specialization}
            education={item.education}
            image={item.profile_picture}
            // onRemove={() => handleRemove(item._id, "doctors")}
          />
        ));
      case "culturalContent":
        return data.map((item) => (
          <FavLibraryCard
            key={item._id}
            title={item.title}
            category={item.category}
            link={`/library/${item._id}`}
            // date={item.addedAt}
            // price={item.cost}
            image={item.file}
            // onRemove={() => handleRemove(item._id, "culturalContent")}
          />
        ));
      // case "group":
      //   return data.map((item, index) => (
      //     <FavGroupCard
      //       key={item._id}
      //       title={item.title}
      //       date={item.date} //missing in return Data
      //       price={item.cost}
      //       image={item.image} //missing in return Data
      //     />
      //   ));
      default:
        return null;
    }
  };

  return (
    <View className="p-4 bg-blue-50/10 h-full flex flex-col gap-4">
      <View className="flex flex-col gap-4">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 12, paddingVertical: 4 }}
        >
          {tabs.map((tab) => {
            const isActive = tab.type === activeTab;
            return (
              <Pressable
                key={tab.type}
                onPress={() => setActiveTab(tab.type)}
                style={{
                  backgroundColor: isActive ? "#005153" : "#E5E7EB", // green-600 / gray-200
                  paddingHorizontal: 16,
                  height: 36,
                  borderRadius: 16,
                  justifyContent: "center",
                  alignItems: "center",
                  minWidth: 120,
                }}
              >
                <Text
                  style={{
                    color: isActive ? "#ffffff" : "#000000",
                    fontWeight: "500",
                  }}
                >
                  {tab.name}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <View className="flex-1">{renderContent()}</View>
    </View>
  );
}
