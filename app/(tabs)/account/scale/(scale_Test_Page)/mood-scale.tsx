import React, { useState } from "react";
import { View, Text, TouchableOpacity, TextInput } from "react-native";
import { Button } from "@/components/ui/Button";
import Drawer from "@/components/ui/Drawer";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/Switch";
import { Label } from "@/components/ui/Label";
import { format } from "date-fns";
import { moodOptions, reasonOptions } from "@/features/scale/constScale";
import { toCapitalizeFirstLetter } from "@/utils/string.utils";
import { useRouter } from "expo-router";
import { useSelector } from "react-redux";
import { UserType } from "@/features/user/types/user.type";
import { apiBaseUrl } from "@/features/Home/constHome";

export default function MoodScale() {
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [selectedMood, setSelectedMood] = useState("");
  const [selectedReason, setSelectedReason] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [checked, setChecked] = useState(false);
  const [dateTimeOnSelectMood, setDateTimeOnSelectMood] = useState(
    new Date().toISOString()
  );

  const router = useRouter();
  const user: UserType = useSelector((state: any) => state.user);

  const handleReasonSelect = (label: string) => {
    setSelectedReason((prev) =>
      prev.includes(label)
        ? prev.filter((reason) => reason !== label)
        : [...prev, label]
    );
  };

  const handleSubmit = async () => {
    if (!selectedMood || selectedReason.length === 0 || !description) {
      console.error("All fields are required.");
      return;
    }

    const payload = {
      userId: user._id,
      mood: toCapitalizeFirstLetter(selectedMood),
      reasons: selectedReason,
      description,
      shareWithSpecialist: checked,
    };

    try {
      const response = await fetch(`${apiBaseUrl}/api/mood-scale`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (response.ok) {
        router.push("/p/account/scale/record/mood-scale-record");
      } else {
        console.error("Error submitting mood scale:", result.message || "Unknown error");
      }
    } catch (error) {
      console.error("Error submitting mood scale:", error);
    }
  };

  return (
    <View className="bg-blue-50/20 h-full w-full p-4 flex-col gap-2">
      <Text className="font-semibold text-lg text-gray-700">
        How is your mood today
      </Text>
      <Text className=" text-sm text-gray-700">Description of feelings</Text>

      <View className="flex-row gap-2 justify-center items-center relative overflow-visible p-2">
        {moodOptions.map(({ label, Icon }) => (
          <TouchableOpacity
            key={label}
            onPress={() => {
              setSelectedMood(label);
              setIsDrawerVisible(true);
            }}
            className="flex-col items-center gap-3"
          >
            <Icon height={60} width={60} />
            <Text className="font-semibold text-sm text-neutral-600">
              {toCapitalizeFirstLetter(label)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Drawer
        visible={isDrawerVisible}
        onClose={() => setIsDrawerVisible(false)}
        title="What are the reasons for the current feeling"
        height="90%"
        className="max-h-[90%]"
      >
        <View className="flex flex-col flex-1 justify-start items-center w-full gap-4 px-4">
          <Text className="text-neutral-700 font-bold text-2xl text-center">
            What are the reasons for the current feeling
          </Text>
          <Text className="text-neutral-600 text-sm text-center">
            {format(new Date(dateTimeOnSelectMood), "EEEE , dd MMM yyyy , hh:mm a")}
          </Text>

          <View className="flex-row flex-wrap gap-8">
            {reasonOptions.map(({ label, Icon }) => {
              const isSelected = selectedReason.includes(label);
              return (
                <TouchableOpacity
                  key={label}
                  onPress={() => handleReasonSelect(label)}
                  className={cn("flex-col items-center gap-3 rounded-xl pb-3")}
                >
                  <Icon height={60} width={60} />
                  <Text
                    className={cn(
                      "font-medium text-sm ",
                      `${isSelected ? "text-primary-500" : "text-neutral-600"}`
                    )}
                  >
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <TextInput
            className="border border-gray-300 rounded-lg p-4 w-full"
            placeholder="Describe what happened"
            value={description}
            onChangeText={setDescription}
          />

          <View className="flex-row items-center justify-between gap-2 w-full">
            <View className="flex-1 py-3">
              <Label
                nativeID="share-record"
                onPress={() => setChecked((prev) => !prev)}
              >
                Share the record with my specialist
              </Label>
              <Text className="text-sm text-neutral-500">
                Share the record with the specialists with whom you will book
                consultation sessions
              </Text>
            </View>
            <Switch
              checked={checked}
              onCheckedChange={setChecked}
              nativeID="share-record"
            />
          </View>

          <Button onPress={handleSubmit} className="w-full bg-purple-500">
            <Text className="text-white font-medium">Save Feeling</Text>
          </Button>
        </View>
      </Drawer>
    </View>
  );
}
