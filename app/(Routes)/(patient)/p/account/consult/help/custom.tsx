import { View, Text, FlatList } from "react-native";
import React, { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import SpecialistCard from "@/features/account/components/SpecialistCard";
import ScheduleSelector from "@/features/Home/Components/ScheduleSelector";

import { Button } from "@/components/ui/Button";
import { apiNewUrl } from "@/const";
import { toast } from "sonner-native";

type Specialist = {
  id: string;
  name: string;
  title: string;
  price: number;
  likes: number;
  imageUrl: string;
};

export default function CustomConsultPage() {
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
  const [selectedSpecialist, setSelectedSpecialist] = useState<
    Specialist | undefined
  >();
  const [selectedDateTime, setSelectedDateTime] = useState<string>("");

  // Fetch doctors and filter based on the query params
  useEffect(() => {
    const fetchSpecialists = async () => {
      try {
        const response = await fetch(`${apiNewUrl}/doctors/list`);
        const result = await response.json();

        if (response.ok && result.success) {
          const filteredSpecialists = result.data
            .filter(
              (doctor: any) =>
                doctor.approvalStatus === "Approved" &&
                (!type || doctor.speciality?.includes(type)) &&
                (!language || doctor.languagesKnown?.includes(language)) &&
                (!gender || doctor.gender === gender) &&
                (!budget || doctor.fees <= parseFloat(budget))
            )
            .map((doctor: any) => ({
              id: doctor._id,
              name: doctor.name,
              title: doctor.speciality || "Specialist",
              price: doctor.fees || 0,
              likes: doctor.likes || 0,
              imageUrl: doctor.image || "https://via.placeholder.com/100",
            }));

          setSpecialists(filteredSpecialists);
        } else {
          toast.error("Failed to fetch specialists.");
        }
      } catch (error) {
        console.error("Error fetching specialists:", error);
        toast.error("An error occurred while fetching specialists.");
      }
    };

    fetchSpecialists();
  }, [type, language, gender, budget]);

  const onPressSpecialistCard = (item: Specialist) => {
    setSelectedSpecialist(item);
  };

  return (
    <View className="px-4 py-6 bg-blue-50/10 h-full w-full">
      {!selectedSpecialist ? (
        <View className="flex-col gap-3">
          <Text className="text-lg font-medium">
            Based on your condition, we suggest that you book a session with any
            of the following specialists
          </Text>

          <FlatList
            data={specialists}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <SpecialistCard
                name={item.name}
                title={item.title}
                price={item.price}
                likes={item.likes}
                imageUrl={item.imageUrl}
                shareLink={`${item.id}`}
                onPress={() => onPressSpecialistCard(item)}
              />
            )}
            showsVerticalScrollIndicator={false}
            contentContainerClassName="flex flex-col gap-3"
            ListEmptyComponent={() => (
              <Text className="text-center text-gray-500">
                No specialists match your search criteria.
              </Text>
            )}
          />
        </View>
      ) : (
        <View className="flex-col gap-3 justify-between pb-28 h-full">
          <View className="flex-col gap-3">
            <ScheduleSelector
              selectedDateTime={selectedDateTime}
              setSelectedDateTime={setSelectedDateTime}
              availableTimes={
                specialists.length > 0 ? selectedSpecialist?.availableTimes : []
              }
              CalenderHeading={"Available Dates"}
              TimeSliderHeading={"Available Times"}
            />
          </View>
          <Button
            onPress={() =>
              router.push({
                pathname: "/p/account/payment",
                params: {
                  appointmentDuration: duration,
                  specialistsId: selectedSpecialist?.id,
                  schedule: selectedDateTime,
                  amount: selectedSpecialist?.price,
                },
              })
            }
            disabled={!selectedDateTime}
          >
            <Text className="text-white font-semibold">Next</Text>
          </Button>
        </View>
      )}
    </View>
  );
}
