import { View, Text, FlatList } from "react-native";
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
import { apiNewUrl } from "@/const";

type ConsultType = {
  id: string;
  name: string;
  title: string;
  price: string;
  likes: string;
  image: string;
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

  const [consult, setConsult] = useState<ConsultType[]>([]);
  const [filteredConsult, setFilteredConsult] = useState<ConsultType[]>([]);
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${apiNewUrl}/doctors/list`);
        const result = await response.json();

        if (response.ok && result.success) {
          const filteredConsultants = result.data
            .filter(
              (consultant: any) =>
                consultant.approvalStatus !== "Approval pending"
            )
            .map((consultant: any) => ({
              id: consultant._id,
              name: consultant.name,
              title: consultant.speciality || "N/A",
              price: consultant.fees || "0",
              likes: consultant.likes || "0",
              image: consultant.image || "https://via.placeholder.com/100",
            }));

          setConsult(filteredConsultants);
          setFilteredConsult(filteredConsultants); // Initialize filtered data
        } else {
          toast.error("Failed to fetch consultants.");
        }
      } catch (error) {
        console.error("Error fetching consultants:", error);
        toast.error("Error fetching consultants.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    // Filter consultants by name or specialty based on the search text
    const lowercasedText = searchText.toLowerCase();
    const filtered = consult.filter(
      (consultant) =>
        consultant.name.toLowerCase().includes(lowercasedText) ||
        consultant.title.toLowerCase().includes(lowercasedText)
    );
    setFilteredConsult(filtered);
  }, [searchText, consult]);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-gray-500">Loading...</Text>
      </View>
    );
  }

  return (
    <View className="px-4 py-6 bg-blue-50/10 h-full w-full">
      <View className="flex-col gap-3">
        <Input
          placeholder="Search for a consultant"
          value={searchText}
          onChangeText={setSearchText}
        />

        {filteredConsult.length > 0 ? (
          <FlatList
            data={filteredConsult}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <SpecialistCard
                name={item.name}
                title={item.title}
                price={item.price}
                likes={item.likes}
                imageUrl={item.image}
                shareLink={`${item.id}`}
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
        ) : (
          <Text className="text-center text-gray-500">
            No consultants match your search.
          </Text>
        )}
      </View>
    </View>
  );
}
