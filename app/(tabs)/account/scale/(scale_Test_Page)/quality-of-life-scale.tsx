import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Checkbox } from "@/components/ui/Checkbox";
import { Text } from "@/components/ui/Text";
import { CustomIcons, apiNewUrl } from "@/const";
import { moodOptions } from "@/features/scale/constScale";
import { UserType } from "@/features/user/types/user.type";
import { cn } from "@/lib/utils";
import { toCapitalizeFirstLetter } from "@/utils/string.utils";
import { useUser } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { View, FlatList, TouchableOpacity, ScrollView } from "react-native";
import { useSelector } from "react-redux";
import { toast } from "sonner-native";

type OptionType = {
  id: string;
  title: string;
  description: string;
  type: {
    label: string;
    Icon: any;
  }[];
};

type ReasonType = {
  type: string;
  reason: string;
  score: number;
};

export default function QualityOfLifeScale() {
  const router = useRouter(); // Initialize router
  const {user} = useUser();
  const userId = user?.publicMetadata.dbPatientId as string;
  const [currentScreen, setCurrentScreen] = useState("OptionSelectorScreen");
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [selectedReasons, setSelectedReasons] = useState<ReasonType[]>([]);
  const [selectedMoods, setSelectedMoods] = useState("");

  const options: OptionType[] = [
    {
      id: "feeling",
      title: "Feeling",
      description: "Choose your mood for the day.",
      type: [
        CustomIcons.Tired,
        CustomIcons.Relaxed,
        CustomIcons.Grateful,
        CustomIcons.Excited,
        CustomIcons.Happy,
        CustomIcons.Stressed,
        CustomIcons.Angry,
        CustomIcons.Worried,
        CustomIcons.Sad,
        CustomIcons.NotSure,
      ],
    },
    {
      id: "sleep",
      title: "Sleep",
      description: "Track your sleep pattern.",
      type: [
        CustomIcons.LateSleep,
        CustomIcons.EarlySleep,
        CustomIcons.PoorSleep,
        CustomIcons.AverageSleep,
        CustomIcons.ExcellentSleep,
      ],
    },
    {
      id: "bestForMe",
      title: "Best for me",
      description: "Make a gift, donate, or do something meaningful.",
      type: [
        CustomIcons.Meditation,
        CustomIcons.Sympathy,
        CustomIcons.Pleasure,
        CustomIcons.Donation,
        CustomIcons.Gift,
      ],
    },
    {
      id: "health",
      title: "Health",
      description: "Track your health activities.",
      type: [
        CustomIcons.UnhealthyFood,
        CustomIcons.DrinkingWater,
        CustomIcons.HealthyFood,
        CustomIcons.Athletic,
      ],
    },
    {
      id: "communicate",
      title: "Communicating with others",
      description: "Engage with people in your community.",
      type: [
        CustomIcons.Study,
        CustomIcons.Work,
        CustomIcons.Parties,
        CustomIcons.Friends,
        CustomIcons.Family,
      ],
    },
    {
      id: "homework",
      title: "Homeworks",
      description: "Track your home-related activities.",
      type: [
        CustomIcons.Shopping,
        CustomIcons.Cooking,
        CustomIcons.Cleaning,
        CustomIcons.Laundry,
      ],
    },
    {
      id: "hobbies",
      title: "Hobbies",
      description: "Engage in activities you love.",
      type: [
        CustomIcons.Sports,
        CustomIcons.Game,
        CustomIcons.Reading,
        CustomIcons.Cinema,
      ],
    },
    {
      id: "productivity",
      title: "Productivity",
      description: "Track your productive activities.",
      type: [
        CustomIcons.StartedEarly,
        CustomIcons.Todo,
        CustomIcons.Focus,
        CustomIcons.TakingABreak,
      ],
    },
  ];
  const handleSelection = (id: string) => {
    setSelectedOptions((prev) =>
      prev.includes(id)
        ? prev.filter((optionId) => optionId !== id)
        : [...prev, id]
    );
  };

  const handleReasonSelect = (
    optionId: string,
    reason: string,
    index: number
  ) => {
    const optionLength = options.find((opt) => opt.id === optionId)?.type
      .length;
    if (!optionLength) return;

    const score = Math.round((index / (optionLength - 1)) * 100); // Calculate score
    setSelectedReasons((prev) => {
      const updatedReasons = prev.filter((reason) => reason.type !== optionId);
      return [...updatedReasons, { type: optionId, reason, score }];
    });
  };

  const handleSubmit = () => {
    if (selectedOptions.length === 0) {
      return toast.error("Please select at least one option.");
    }
    setCurrentScreen("DataCollectScreen");
  };

  const handleFinalSubmit = async () => {
    const payload = {
      mood: selectedMoods,
      activity: selectedReasons,
      userId: userId,
    };

    try {
      const response = await fetch(
        `${apiNewUrl}/api/life_scale/submit`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (response.ok) {
        console.log("Final Submission:", payload);
        toast.success("Data submitted successfully!");
        router.push("/account/scale/record/quality-of-life-scale-record"); // Navigate to the next page
      } else {
        const errorData = await response.json();
        console.error("Error submitting data:", errorData);
        toast.error("Failed to submit data. Please try again.");
      }
    } catch (error) {
      console.error("Error during submission:", error);
      toast.error("An error occurred while submitting data. Please try again.");
    }
  };

  const OptionSelectorScreen = () => (
    <View className="p-4 bg-blue-50/20 h-full">
      <Text className="text-lg font-bold text-gray-700 mb-2">
        Tracking activities and discovering lifestyle patterns
      </Text>
      <Text className="text-sm text-gray-600 mb-6">
        Choose the patterns in your day that affect your mood
      </Text>
      <FlatList
        data={options}
        numColumns={2}
        columnWrapperClassName="gap-3"
        contentContainerClassName="gap-3"
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            className="flex-1"
            onPress={() => handleSelection(item.id)}
          >
            <Card className="p-4 rounded-2xl bg-white h-32">
              <Checkbox
                checked={selectedOptions.includes(item.id)}
                onCheckedChange={() => handleSelection(item.id)}
              />
              <Text className="text-base font-semibold text-gray-800">
                {item.title}
              </Text>
              <Text className="text-sm text-gray-500">{item.description}</Text>
            </Card>
          </TouchableOpacity>
        )}
      />
      <Button
        onPress={handleSubmit}
        className="mt-6 w-full"
        disabled={selectedOptions.length === 0}
      >
        <Text className="text-white font-semibold">Submit</Text>
      </Button>
    </View>
  );

  const DataCollectScreen = () => (
    <ScrollView>
      <View className="p-4 bg-blue-50/20 h-full">
        <Text className="text-lg font-bold text-gray-700 mb-2">
          How are you today?
        </Text>
        <View className="flex-row gap-2 justify-center items-center relative p-2">
          {moodOptions.map(({ label, Icon }) => (
            <TouchableOpacity
              key={label}
              onPress={() => setSelectedMoods(label)}
              className={`flex-col items-center gap-3 ${
                selectedMoods === label ? "opacity-100" : "opacity-70"
              }`}
            >
              <Icon height={60} width={60} />
              <Text
                className={`font-semibold text-sm ${
                  selectedMoods === label ? "text-blue-500" : "text-neutral-600"
                }`}
              >
                {toCapitalizeFirstLetter(label)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <View className="mt-6">
          <Text className="text-lg font-bold text-gray-700 mb-2">
            Selected Activities
          </Text>
          {selectedOptions.map((optionId) => {
            const option = options.find((opt) => opt.id === optionId);
            if (!option) return null;

            return (
              <View
                key={option.id}
                className="mb-4 bg-white p-4 rounded-xl shadow"
              >
                <Text className="font-semibold text-lg mb-2">
                  {option.title}
                </Text>
                <View className="flex-row gap-3 flex-wrap">
                  {option.type.map(({ label, Icon }, index) => {
                    const isSelected = selectedReasons.some(
                      (reason) =>
                        reason.type === option.id && reason.reason === label
                    );
                    return (
                      <TouchableOpacity
                        key={label}
                        onPress={() =>
                          handleReasonSelect(option.id, label, index)
                        }
                        className={cn(
                          "flex-col items-center gap-2 w-[22%]",
                          isSelected && " p-2 rounded-lg"
                        )}
                      >
                        <Icon height={40} width={40} />
                        <Text
                          className={cn(
                            "font-medium text-sm",
                            isSelected ? "text-blue-500" : "text-gray-600"
                          )}
                        >
                          {label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            );
          })}
        </View>
        <Button
          onPress={handleFinalSubmit}
          className="mt-6 w-full py-3 bg-blue-600"
        >
          <Text className="text-white font-semibold">Save Feeling</Text>
        </Button>
      </View>
    </ScrollView>
  );

  return (
    <>
      {currentScreen === "OptionSelectorScreen" && <OptionSelectorScreen />}
      {currentScreen === "DataCollectScreen" && <DataCollectScreen />}
    </>
  );
}
