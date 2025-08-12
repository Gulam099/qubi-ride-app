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
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();

  const options: OptionType[] = [
    {
      id: "feeling",
      title: "Feeling",
      description: "feeling_description",
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
      description: "sleep_description",
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
      description: "best_for_me_description",
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
      description: "health_description",
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
      description: "communicate_description",
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
      description: "homework_description",
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
      description: "hobbies_description",
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
      description: "productivity_description",
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
      return toast.error(t("Please select at least one option."));
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
        toast.success(t("Data submitted successfully!"));
        router.push("/account/scale/record/quality-of-life-scale-record"); // Navigate to the next page
      } else {
        const errorData = await response.json();
        console.error("Error submitting data:", errorData);
        toast.error("Failed to submit data. Please try again.");
      }
    } catch (error) {
      console.error("Error during submission:", error);
      toast.error(t("toast_submit_error"));
    }
  };

  const OptionSelectorScreen = () => (
    <View className="p-4 bg-blue-50/20 h-full">
      <Text className="text-lg font-bold text-gray-700 mb-2">
        {t("tracking_title")}
      </Text>
      <Text className="text-sm text-gray-600 mb-6">
        {t("tracking_subtitle")}
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
                {t(item.title)}
              </Text>
              <Text className="text-sm text-gray-500">{t(item.description)}</Text>
            </Card>
          </TouchableOpacity>
        )}
      />
      <Button
        onPress={handleSubmit}
        className="mt-6 w-full"
        disabled={selectedOptions.length === 0}
      >
        <Text className="text-white font-semibold">{t("Submit")}</Text>
      </Button>
    </View>
  );

  const DataCollectScreen = () => (
    <ScrollView>
      <View className="p-4 bg-blue-50/20 h-full">
        <Text className="text-lg font-bold text-gray-700 mb-2">
          {t("how_are_you_today")}
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
                {t(label)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <View className="mt-6">
          <Text className="text-lg font-bold text-gray-700 mb-2">
            {t("selected_activities_title")}
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
                  {t(option.title)}
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
                          {t(label)}
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
          <Text className="text-white font-semibold">{t("Save Feeling")}</Text>
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
