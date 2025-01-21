import { View, Text, FlatList } from "react-native";
import React, { useEffect, useState } from "react";
import {
  RelativePathString,
  useLocalSearchParams,
  useRouter,
} from "expo-router";
import SpecialistCard from "@/features/account/components/SpecialistCard";
import ScheduleSelector from "@/features/Home/Components/ScheduleSelector";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

type Specialist = {
  id: number;
  name: string;
  title: string;
  price: string;
  likes: string;
  imageUrl: string;
};
export default function ConsultPage() {
  const router = useRouter();
  const {
    situation,
    budget,
    type,
    language,
    gender,
    duration,
    ClosestAppointment,
  } = useLocalSearchParams<{
    situation: string[];
    budget: string;
    type: string;
    language: string;
    gender: string;
    duration: string;
    ClosestAppointment: string;
  }>();

  const [specialists, setSpecialists] = useState<Specialist[]>([]);

  // Mock API call
  useEffect(() => {
    const fetchData = async () => {
      // Simulated data (replace with real API fetch)
      const data = [
        {
          id: 1,
          name: "Dr. Deem Abdullah",
          title:
            "Consultant physician, certified by the Saudi Board in Psychiatry",
          price: "800",
          likes: "180",
          imageUrl: "https://via.placeholder.com/100", // Replace with real image
        },
        {
          id: 2,
          name: "Dr. Deem Abdullah",
          title:
            "Consultant physician, certified by the Saudi Board in Psychiatry",
          price: "1800",
          likes: "1850",
          imageUrl: "https://via.placeholder.com/100",
        },
        {
          id: 3,
          name: "Dr. Deem Abdullah",
          title:
            "Consultant physician, certified by the Saudi Board in Psychiatry",
          price: "2000",
          likes: "180",
          imageUrl: "https://via.placeholder.com/100",
        },
        {
          id: 4,
          name: "Dr. Deem Abdullah",
          title:
            "Consultant physician, certified by the Saudi Board in Psychiatry",
          price: "800",
          likes: "180",
          imageUrl: "https://via.placeholder.com/100", // Replace with real image
        },
        {
          id: 5,
          name: "Dr. Deem Abdullah",
          title:
            "Consultant physician, certified by the Saudi Board in Psychiatry",
          price: "1800",
          likes: "1850",
          imageUrl: "https://via.placeholder.com/100",
        },
        {
          id: 6,
          name: "Dr. Deem Abdullah",
          title:
            "Consultant physician, certified by the Saudi Board in Psychiatry",
          price: "2000",
          likes: "180",
          imageUrl: "https://via.placeholder.com/100",
        },
        {
          id: 7,
          name: "Dr. Deem Abdullah",
          title:
            "Consultant physician, certified by the Saudi Board in Psychiatry",
          price: "1800",
          likes: "1850",
          imageUrl: "https://via.placeholder.com/100",
        },
        {
          id: 8,
          name: "Dr. Deem Abdullah",
          title:
            "Consultant physician, certified by the Saudi Board in Psychiatry",
          price: "2000",
          likes: "180",
          imageUrl: "https://via.placeholder.com/100",
        },
      ];
      setSpecialists(data);
    };

    fetchData();
  }, []);

  return (
    <View className="px-4 py-6 bg-blue-50/10 h-full w-full ">
      <View className="flex-col gap-3">
        <Input placeholder="Search for a consultant" />

        <FlatList
          data={specialists}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <SpecialistCard
              name={item.name}
              title={item.title}
              price={item.price}
              likes={item.likes}
              imageUrl={item.imageUrl}
              shareLink={`item.id`}
              onPress={() =>
                router.push(
                  `/p/account/consult/s/${item.id}` as RelativePathString
                )
              }
            />
          )}
          showsVerticalScrollIndicator={false}
          contentContainerClassName="flex flex-col gap-3 pb-16"
        />
      </View>
    </View>
  );
}
