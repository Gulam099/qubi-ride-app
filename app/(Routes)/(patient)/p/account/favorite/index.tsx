import { View, Text, ScrollView, FlatList } from "react-native";
import React, { useState } from "react";
import { H3 } from "@/components/ui/Typography";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import FavProgramCard from "@/features/favorite/components/FavProgramCard";
import FavConsultantCard from "@/features/favorite/components/FavConsultantCard";
import FavGroupCard from "@/features/favorite/components/FavGroupCard";

const programsData = [
  {
    title: "Program 1",
    subtitle: "Subtitle 1",
    price: "10",
    date: new Date("2022-10-01").toISOString(),
    image: "https://via.placeholder.com/100",
  },
  {
    title: "Program 2",
    subtitle: "Subtitle 2",
    price: "20",
    date: new Date("2022-10-02").toISOString(),
    image: "https://via.placeholder.com/100",
  },

  {
    title: "Program 3",
    subtitle: "Subtitle 3",
    price: "30",
    date: new Date("2022-10-03").toISOString(),
    image: "https://via.placeholder.com/100",
  },
  {
    title: "Program 4",
    subtitle: "Subtitle 4",
    price: "40",
    date: new Date("2022-10-04").toISOString(),
    image: "https://via.placeholder.com/100",
  },
  {
    title: "Program 5",
    subtitle: "Subtitle 5",
    price: "50",
    date: new Date("2022-10-05").toISOString(),
    image: "https://via.placeholder.com/100",
  },
  {
    title: "Program 6",
    subtitle: "Subtitle 6",
    price: "60",
    date: new Date("2022-10-06").toISOString(),
    image: "https://via.placeholder.com/100",
  },
  {
    title: "Program 7",
    subtitle: "Subtitle 7",
    price: "70",
    date: new Date("2022-10-07").toISOString(),
    image: "https://via.placeholder.com/100",
  },
];
const consultantsData = [
  {
    name: "DR. Deem Alabdullah",
    profession: "Psychologist",
    image: "https://via.placeholder.com/100",
  },
  {
    name: "DR. Khaled Alkahldi",
    profession: "Psychologist",
    image: "https://via.placeholder.com/100",
  },
];

const groupsData = [
  {
    title: "Group 1",
    date: "April, 08",
    price: "280",
    image: "https://via.placeholder.com/100",
  },
  {
    title: "Group 2",
    date: "April, 09",
    price: "300",
    image: "https://via.placeholder.com/100",
  },
];

export default function AccountFavoritePage() {
  const [activeTab, setActiveTab] = useState("Programs");

  const renderContent = () => {
    switch (activeTab) {
      case "Programs":
        return (
          <FlatList
            data={programsData}
            keyExtractor={(item) => item.title}
            renderItem={({ item }) => (
              <FavProgramCard
                title={item.title}
                price={item.price}
                image={item.image}
                subtitle={item.subtitle}
                date={item.date}
              />
            )}
            contentContainerClassName="gap-3"
            showsVerticalScrollIndicator={false}
          />
        );
      case "Consultants":
        return (
          <FlatList
            data={consultantsData}
            keyExtractor={(item) => item.name}
            renderItem={({ item }) => (
              <FavConsultantCard
                name={item.name}
                profession={item.profession}
                image={item.image}
              />
            )}
            showsVerticalScrollIndicator={false}
            contentContainerClassName="gap-3"
          />
        );
      case "Group":
        return (
          <FlatList
            data={groupsData}
            keyExtractor={(item) => item.title}
            renderItem={({ item }) => (
              <FavGroupCard
                title={item.title}
                date={item.date}
                price={item.price}
                image={item.image}
              />
            )}
            showsVerticalScrollIndicator={false}
            contentContainerClassName="gap-3"
          />
        );
      default:
        return null;
    }
  };

  return (
    <View className="p-4 bg-blue-50/10 h-full flex flex-col gap-4">
      <View className="flex flex-col gap-4">
        <H3>My Favorites</H3>

        <ScrollView
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="gap-3"
        >
          {["Programs", "Consultants", "Group"].map((tab) => {
            const isActiveTab = tab === activeTab;
            return (
              <Button
                key={tab}
                size={"sm"}
                onPress={() => setActiveTab(tab)}
                className={cn(
                  isActiveTab ? "bg-blue-900" : "bg-white",
                  "w-36 h-9 rounded-xl"
                )}
              >
                <Text
                  className={cn(isActiveTab ? "text-white" : "", "font-medium")}
                >
                  {tab}
                </Text>
              </Button>
            );
          })}
        </ScrollView>
      </View>

      {/* Render Content Based on Active Tab */}
      {renderContent()}
    </View>
  );
}
