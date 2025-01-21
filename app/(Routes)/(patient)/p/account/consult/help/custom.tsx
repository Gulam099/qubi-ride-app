import { View, Text, FlatList } from "react-native";
import React, { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import SpecialistCard from "@/features/account/components/SpecialistCard";
import ScheduleSelector from "@/features/Home/Components/ScheduleSelector";

import { Button } from "@/components/ui/Button";

type Specialist = {
  id: number;
  name: string;
  title: string;
  price: string;
  likes: string;
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

  // Consolidated available times as ISO strings
  const availableTimes = [
    "2024-12-26T11:00:00Z",
    "2024-12-26T13:00:00Z",
    "2024-12-26T15:00:00Z",
    "2024-12-27T09:00:00Z",
    "2024-12-27T12:00:00Z",
    "2024-12-27T16:00:00Z",
    "2024-12-28T10:00:00Z",
    "2024-12-28T14:00:00Z",
    "2024-12-17T02:15:00Z",
  ];

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

  // Handle card press
  const onPressSpecialistCard = (item: Specialist) => {
    setSelectedSpecialist(item);
    console.log("Selected Specialist:", item);
  };

  return (
    <View className="px-4 py-6 bg-blue-50/10 h-full w-full ">
      {/* <Text>
        Search: {situation + " / " +  budget + " / " + type +  " / "  + language +  " / "  + gender +  " / "  + duration +  " / "  + ClosestAppointment}
      </Text> */}
      {!selectedSpecialist ? (
        <View className="flex-col gap-3">
          <Text className="text-lg font-medium">
            Based on your condition, we suggest that you book a session with any
            of the following specialists
          </Text>

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
                onPress={() => onPressSpecialistCard(item)}
              />
            )}
            showsVerticalScrollIndicator={false}
            contentContainerClassName="flex flex-col gap-3 "
          />
        </View>
      ) : (
        <View className="flex-col gap-3 justify-between pb-28 h-full">
          <View className="flex-col gap-3">
            <ScheduleSelector
              selectedDateTime={selectedDateTime}
              setSelectedDateTime={setSelectedDateTime}
              availableTimes={availableTimes}
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
                  specialistsId: selectedSpecialist.id,
                  schedule: selectedDateTime,
                  amount: selectedSpecialist.price
                },
              })
            }
          >
            <Text className=" text-background font-semibold">Next</Text>
          </Button>
        </View>
      )}
    </View>
  );
}
