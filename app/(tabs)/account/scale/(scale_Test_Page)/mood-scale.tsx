import React, { useRef, useState } from "react";
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
import { useUser } from "@clerk/clerk-expo";
import BottomSheet, {
  BottomSheetScrollView,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { X } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { toast } from "sonner-native";

export default function MoodScale() {
  const moodScaleBottomSheetRef = useRef<BottomSheet>(null);
  const handelOpenPress = () => moodScaleBottomSheetRef.current?.expand();
  const handelClosePress = () => moodScaleBottomSheetRef.current?.close();
  const { t } = useTranslation();

  const [selectedMood, setSelectedMood] = useState("");
  const [selectedReason, setSelectedReason] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [checked, setChecked] = useState(false);
  const [dateTimeOnSelectMood, setDateTimeOnSelectMood] = useState(
    new Date().toISOString()
  );

  const router = useRouter();
  const { user } = useUser();
  const userId = user?.publicMetadata.dbPatientId as string;

  const handleReasonSelect = (label: string) => {
    setSelectedReason((prev) =>
      prev.includes(label)
        ? prev.filter((reason) => reason !== label)
        : [...prev, label]
    );
  };

  const handleSubmit = async () => {
    if (!selectedMood || selectedReason.length === 0 || !description) {
      console.error(t("error_all_fields_required"));
      return;
    }

    const payload = {
      userId: userId,
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
        router.push("/account/scale/record/mood-scale-record");
         toast.success(t("Data submitted successfully!"));
      } else {
        console.error(
          `${t("error_submitting_mood_scale")} ${
            result.message || t("unknown_error")
          }`
        );
         toast.error("Failed to submit data. Please try again.");
      }
    } catch (error) {
      console.error(`${t("error_submitting_mood_scale")} ${error}`);
    }
  };

  return (
    <View className="bg-blue-50/20 h-full w-full p-4 flex-col gap-2">
      <Text className="font-semibold text-lg text-gray-700">
        {t("how_is_your_mood_today")}
      </Text>
      <Text className=" text-sm text-gray-700">
        {t("description_of_feelings")}
      </Text>

      <View className="flex-row gap-2 justify-center items-center relative overflow-visible p-2">
        {moodOptions.map(({ label, Icon }) => (
          <TouchableOpacity
            key={label}
            onPress={() => {
              setSelectedMood(label);
              handelOpenPress();
            }}
            className="flex-col items-center gap-3"
          >
            <Icon height={60} width={60} />
            <Text className="font-semibold text-sm text-neutral-600">
              {t(label)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <BottomSheet
        ref={moodScaleBottomSheetRef}
        index={-1} // Start fully hidden
        enablePanDownToClose={true}
      >
        <BottomSheetScrollView className="w-full flex-1 bg-white ">
          <View className="flex flex-col flex-1 justify-start items-center w-full gap-4 px-4 pt-12">
            <Button
              size={"icon"}
              variant={"ghost"}
              className="absolute top-2 right-2 rounded-full p-0 text-neutral-800"
              onPress={handelClosePress}
            >
              <X size={20} color={"#262626"} />
            </Button>
            <Text className="text-neutral-700 font-bold text-2xl text-center">
              {t("what_are_the_reasons")}
            </Text>
            <Text className="text-neutral-600 text-sm text-center">
              {format(
                new Date(dateTimeOnSelectMood),
                "EEEE , dd MMM yyyy , hh:mm a"
              )}
            </Text>

            <View className="flex-row flex-wrap gap-8">
              {reasonOptions.map(({ label, Icon }) => {
                const isSelected = selectedReason.includes(label);
                return (
                  <TouchableOpacity
                    key={label}
                    onPress={() => handleReasonSelect(label)}
                    className={cn(
                      "flex-col items-center gap-3 rounded-xl pb-3"
                    )}
                  >
                    <Icon height={60} width={60} />
                    <Text
                      className={cn(
                        "font-medium text-sm ",
                        `${
                          isSelected ? "text-primary-500" : "text-neutral-600"
                        }`
                      )}
                    >
                      {t(label)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TextInput
              className="border border-gray-300 rounded-lg p-4 w-full"
              placeholder={t("describe_what_happened")}
              value={description}
              onChangeText={setDescription}
            />

            <View className="flex-row items-center justify-between gap-2 w-full">
              <View className="flex-1 py-3">
                <Label
                  nativeID="share-record"
                  onPress={() => setChecked((prev) => !prev)}
                >
                  {t("share_with_specialist_label")}
                </Label>
                <Text className="text-sm text-neutral-500">
                  {t("share_with_specialist_desc")}
                </Text>
              </View>
              <Switch
                checked={checked}
                onCheckedChange={setChecked}
                nativeID="share-record"
              />
            </View>

            <Button onPress={handleSubmit} className="w-full bg-purple-500">
              <Text className="text-white font-medium">
                {t("save_feeling")}
              </Text>
            </Button>
          </View>
        </BottomSheetScrollView>
      </BottomSheet>
    </View>
  );
}
