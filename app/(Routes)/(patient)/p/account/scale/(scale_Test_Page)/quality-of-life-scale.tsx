import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Checkbox } from "@/components/ui/Checkbox";
import { Text } from "@/components/ui/Text";
import { CustomIcons } from "@/const";
import { moodOptions } from "@/features/scale/constScale";
import { cn } from "@/lib/utils";
import { toCapitalizeFirstLetter } from "@/utils/string.utils";
import React, { useState } from "react";
import { View, FlatList, TouchableOpacity, ScrollView } from "react-native";

type optionType = {
  id: string;
  title: string;
  description: string;
  type: {
    label: string;
    Icon: any;
  }[];
};

export default function QualityOfLifeScale() {
  const [currentScreen, setCurrentScreen] = useState("OptionSelectorScreen");
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [selectedReasons, setSelectedReasons] = useState<
    Record<string, string>
  >({});
  const [selectedMoods, setSelectedMoods] = useState("");

  const options: optionType[] = [
    {
      id: "1",
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
      id: "2",
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
      id: "3",
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
      id: "4",
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
      id: "5",
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
      id: "6",
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
      id: "7",
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
      id: "8",
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

  const handleReasonSelect = (optionId: string, reason: string) => {
    setSelectedReasons((prev) => ({ ...prev, [optionId]: reason }));
  };

  const handleSubmit = () => {
    setCurrentScreen("DataCollectScreen");
    console.log("Selected Options:", selectedOptions);
  };

  const handleFinalSubmit = () => {
    console.log("Final Submission:");
    console.log("Selected Moods:", selectedMoods);
    console.log("Selected Reasons:", selectedReasons);
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
            className="flex-1 border-none shadow-none"
            onPress={() => handleSelection(item.id)}
          >
            <Card className="flex-1 flex-col gap-2 items-start p-4 rounded-2xl bg-white h-32">
              <Checkbox
                checked={selectedOptions.includes(item.id)}
                onCheckedChange={() => handleSelection(item.id)}
              />
              <View>
                <Text className="text-base font-semibold text-gray-800">
                  {item.title}
                </Text>
                <Text className="text-sm text-gray-500">
                  {item.description}
                </Text>
              </View>
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
        <View className="flex-row gap-2 justify-center items-center relative overflow-visible p-2">
          {moodOptions.map(({ label, Icon }) => (
            <TouchableOpacity
              key={label}
              onPress={() => setSelectedMoods(label)}
              className={`flex-col items-center gap-3 ${
                selectedMoods === label ? "" : ""
              }`}
            >
              <Icon height={60} width={60} />
              <Text
                className={`font-semibold text-sm  ${
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
                  {option.type.map(({ label, Icon }) => {
                    const isSelected = selectedReasons[option.id] === label;
                    return (
                      <TouchableOpacity
                        key={label}
                        onPress={() => handleReasonSelect(option.id, label)}
                        className={cn(
                          "flex-col items-center gap-2 w-[22%]",
                          isSelected && "rounded-lg "
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
          className="mt-6 w-full py-3  text-white "
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
