import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, Image } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Button } from "@/components/ui/Button";
import { H3, H2 } from "@/components/ui/Typography";
import { apiBaseUrl } from "@/features/Home/constHome"; // Replace with your base API URL if needed.
import { toast } from "sonner-native";

export default function SupportDetailPage() {
  const { support } = useLocalSearchParams();
  const [groupDetails, setGroupDetails] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // Mock data for now
  const mockDetails = {
    id: 1,
    title: "Psychological Health",
    category: "psychological",
    price: "280 SAR",
    recorded: 81,
    rating: 4.3,
    description:
      "Mental health is a state of psychological well-being that enables a person to cope with the stresses of life.",
    details: {
      goals: [
        "Increasing awareness about mental health disorders.",
        "Striving to keep the community mentally safe.",
      ],
      content: [
        "Understanding mental health.",
        "Explaining the concept of mental health and its importance.",
        "Providing strategies for dealing with psychological stress.",
      ],
      consultants: [
        {
          name: "Dr. Deem Abdulla",
          specialty: "Psychologist",
          image: "https://via.placeholder.com/100",
        },
      ],
      faq: [
        {
          question: "What results will the program achieve after completion?",
          answer: "Better understanding of mental health.",
        },
        {
          question: "How long is the program valid for?",
          answer: "Lifetime access.",
        },
      ],
    },
  };

  useEffect(() => {
    // Fetch group details dynamically based on the `support` parameter
    const fetchGroupDetails = async () => {
      try {
        setLoading(true);
        // Uncomment below for real API calls
        // const response = await fetch(`${apiBaseUrl}/api/support-groups/${support}`);
        // const data = await response.json();
        // if (response.ok) {
        //   setGroupDetails(data);
        // } else {
        //   toast.error(data.message || "Failed to fetch support group details");
        // }
        setGroupDetails(mockDetails); // Using mock data for now
      } catch (error) {
        console.error("Error fetching support group details:", error);
        toast.error("Error fetching support group details");
      } finally {
        setLoading(false);
      }
    };

    fetchGroupDetails();
  }, [support]);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-gray-500">Loading...</Text>
      </View>
    );
  }

  if (!groupDetails) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-red-500">Support Group Not Found</Text>
      </View>
    );
  }

  return (
    <ScrollView className="p-4 bg-blue-50/10 flex-1">
      {/* Group Header */}
      <View className="mb-6">
        <H2>{groupDetails.title}</H2>
        <Text className="text-gray-500 capitalize">{groupDetails.category}</Text>
        <Image
          source={{ uri: groupDetails.details.consultants[0]?.image }}
          className="w-full h-64 rounded-md mt-4"
          resizeMode="cover"
        />
        <View className="flex-row justify-between items-center mt-4">
          <Text className="text-gray-700">{groupDetails.recorded} Recorded</Text>
          <Text className="text-gray-700">{groupDetails.rating} ★ Rate</Text>
        </View>
        <Text className="text-gray-600 mt-4">{groupDetails.description}</Text>
      </View>

      {/* Support Group Goals */}
      <View className="mb-6">
        <H3>Support Group Goals</H3>
        {groupDetails.details.goals.map((goal: string, index: number) => (
          <Text key={`goal-${index}`} className="text-gray-700">
            • {goal}
          </Text>
        ))}
      </View>

      {/* Program Content */}
      <View className="mb-6">
        <H3>Program Content</H3>
        {groupDetails.details.content.map((content: string, index: number) => (
          <Text key={`content-${index}`} className="text-gray-700">
            • {content}
          </Text>
        ))}
      </View>

      {/* Consultants */}
      <View className="mb-6">
        <H3>Consultants</H3>
        <View className="flex-row gap-4">
          {groupDetails.details.consultants.map((consultant: any, index: number) => (
            <View key={`consultant-${index}`} className="items-center">
              <Image
                source={{ uri: consultant.image }}
                className="w-16 h-16 rounded-full"
              />
              <Text className="text-gray-700 mt-2 text-center">{consultant.name}</Text>
              <Text className="text-gray-500">{consultant.specialty}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* FAQ */}
      <View className="mb-6">
        <H3>Frequently Asked Questions (FAQ)</H3>
        {groupDetails.details.faq.map((faq: any, index: number) => (
          <View key={`faq-${index}`} className="mb-4">
            <Text className="font-semibold">{faq.question}</Text>
            <Text className="text-gray-700">{faq.answer}</Text>
          </View>
        ))}
      </View>

      {/* Action Button */}
      <Button className="w-full bg-purple-600 py-4 rounded-md">
        <Text className="text-white font-semibold">
          Pay {groupDetails.price}
        </Text>
      </Button>
    </ScrollView>
  );
}
