import React, { useState } from "react";
import { View, Text, TouchableOpacity, TextInput } from "react-native";
import { Button } from "@/components/ui/Button";
import Drawer from "@/components/ui/Drawer";
import ExcellentFeeling from "@/assets/icon/ExcellentFeeling.svg";
import GoodFeeling from "@/assets/icon/GoodFeeling.svg";
import AverageFeeling from "@/assets/icon/AverageFeeling.svg";
import WeakFeeling from "@/assets/icon/WeakFeeling.svg";
import BadFeeling from "@/assets/icon/BadFeeling.svg";
import Relaxation from "@/assets/icon/Relaxation.svg";
import Relationships from "@/assets/icon/Relationships.svg";
import Work from "@/assets/icon/Work.svg";
import Study from "@/assets/icon/Study.svg";
import Family from "@/assets/icon/Family.svg";
import Sport from "@/assets/icon/Sport.svg";
import Travel from "@/assets/icon/Travel.svg";
import Weather from "@/assets/icon/Weather.svg";
import Friends from "@/assets/icon/Friends.svg";
import Health from "@/assets/icon/Health.svg";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/Switch";
import { Label } from "@/components/ui/Label";
import { format, set } from "date-fns";

const moodOptions = [
  { label: "Excellent", Icon: ExcellentFeeling },
  { label: "Good", Icon: GoodFeeling },
  { label: "Average", Icon: AverageFeeling },
  { label: "Weak", Icon: WeakFeeling },
  { label: "Bad", Icon: BadFeeling },
];

const reasonOptions = [
  { label: "Relaxation", Icon: Relaxation },
  { label: "Relationships", Icon: Relationships },
  { label: "Work", Icon: Work },
  { label: "Study", Icon: Study },
  { label: "Family", Icon: Family },
  { label: "Sport", Icon: Sport },
  { label: "Travel", Icon: Travel },
  { label: "Weather", Icon: Weather },
  { label: "Friends", Icon: Friends },
  { label: "Health", Icon: Health },
];

export default function MoodScale() {
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [selectedMood, setSelectedMood] = useState("");
  const [selectedReason, setSelectedReason] = useState("");
  const [description, setDescription] = useState("");
  const [checked, setChecked] = useState(false);
  const [dateTimeOnSelectMood, setDateTimeOnSelectMood] = useState(
    new Date().toISOString()
  );

  const handleSubmit = () => {
    console.log({
      mood: selectedMood,
      reason: selectedReason,
      description,
      share_record: checked,
      dateTimeOnSelectMood,
    });
    setIsDrawerVisible(false);
    setSelectedMood("");
    setSelectedReason("");
    setDescription("");
    setChecked(false);

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
              {label}
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
            {format(dateTimeOnSelectMood, "EEEE , dd MMM yyyy , hh:mm a")}
          </Text>

          <View className="flex-row flex-wrap gap-8">
            {reasonOptions.map(({ label, Icon }) => {
              const isSelected = selectedReason === label;
              return (
                <TouchableOpacity
                  key={label}
                  onPress={() => setSelectedReason(label)}
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
                nativeID="airplane-mode"
                onPress={() => {
                  setChecked((prev) => !prev);
                }}
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
              nativeID="airplane-mode"
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
