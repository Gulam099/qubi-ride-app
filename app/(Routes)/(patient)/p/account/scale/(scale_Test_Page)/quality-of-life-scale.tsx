import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Checkbox } from "@/components/ui/Checkbox";
import { Text } from "@/components/ui/Text";
import React, { useState } from "react";
import { View, FlatList, TouchableOpacity } from "react-native";

export default function QualityOfLifeScale() {
  const [selectedOptions, setSelectedOptions] = useState([] as any);
  const [next, setNext] = useState(false);

  const options = [
    { id: "1", title: "Feeling", description: "Happy, grateful, sad.." },
    { id: "2", title: "Sleep", description: "Good sleep, average sleep.." },
    { id: "3", title: "Best for me", description: "Make a gift, donate.." },
    { id: "4", title: "Health", description: "Healthy eating, drinks.." },
    {
      id: "5",
      title: "Communicating with others",
      description: "Family, friends, parties ..",
    },
    { id: "6", title: "Homeworks", description: "Shopping, cleaning, co.." },
    { id: "7", title: "Hobbies", description: "Games, sports, readers,.." },
    {
      id: "8",
      title: "Productivity",
      description: "Focus, prepare a list, take..",
    },
  ];

  const handleSelection = (id: any) => {
    setSelectedOptions((prev: any[]) =>
      prev.includes(id)
        ? prev.filter((optionId) => optionId !== id)
        : [...prev, id]
    );
  };

  const handleSubmit = () => {
    setNext(true);
    console.log("Selected Options:", selectedOptions);
    // Logic for rendering the next screen based on selection
  };

  const [selectedMoods, setSelectedMoods] = useState([] as any);

  const moods = [
    { id: 1, label: "Excellent", icon: "😊" },
    { id: 2, label: "Good", icon: "😀" },
    { id: 3, label: "Average", icon: "😐" },
    { id: 4, label: "Weak", icon: "😔" },
    { id: 5, label: "Bad", icon: "😠" },
  ];

  const handleMoodSelect = (id: any) => {
    setSelectedMoods((prev: any[]) =>
      prev.includes(id) ? prev.filter((moodId) => moodId !== id) : [...prev, id]
    );
  };

  const handleSave = () => {
    console.log("Selected Patterns:", selectedOptions);
    console.log("Selected Moods:", selectedMoods);
    // Submit selected data to server or render the next screen
  };

  return (
    <View className="p-4 bg-blue-50/20 h-full">
      {!next || selectedOptions.length === 0 ? (
        <>
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

          <Button onPress={handleSubmit} className="mt-6 w-full">
            <Text className="text-white font-semibold">Submit</Text>
          </Button>
        </>
      ) : (
        <>
          <Text className="text-lg font-bold text-gray-700 mb-2">
            How are you today?
          </Text>
          <FlatList
            data={moods}
            numColumns={5}
            columnWrapperClassName="justify-between"
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                className={`flex items-center justify-center p-2 border rounded-lg w-16 h-16 shadow-md ${
                  selectedMoods.includes(item.id) ? "bg-blue-500" : "bg-white"
                }`}
                onPress={() => handleMoodSelect(item.id)}
              >
                <Text className="text-2xl">{item.icon}</Text>
                <Text className="text-xs font-semibold text-gray-700">
                  {item.label}
                </Text>
              </TouchableOpacity>
            )}
          />

          <View className="mt-6">
            <Text className="text-lg font-bold text-gray-700 mb-2">
              Tracking activities and discovering lifestyle patterns
            </Text>
            <FlatList
              data={selectedOptions}
              numColumns={2}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <Card className="flex-1 flex-row gap-2 p-4 border rounded-lg bg-white mb-4">
                  <Text className="text-sm font-semibold text-gray-800">
                    {item.title}
                  </Text>
                </Card>
              )}
            />
          </View>

          <Button
            onPress={handleSave}
            className="mt-6 w-full py-3 bg-blue-500 text-white rounded-md shadow-md"
          >
            <Text className="text-white font-semibold">Save Feeling</Text>
          </Button>
        </>
      )}
    </View>
  );
}
