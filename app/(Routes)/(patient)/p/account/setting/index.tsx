import { ScrollView, View } from "react-native";
import React, { useState } from "react";
import { Text } from "@/components/ui/Text";
import { RadioGroup, RadioGroupItem } from "@/components/ui/RadioGroup";
import { Label } from "@/components/ui/Label";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { updateAppState } from "@/store/appState/appState";
import { setLayoutDirection } from "@/lib/layoutDirection";
import { Switch } from "@/components/ui/Switch";
import { Button } from "@/components/ui/Button";
import { useRouter } from "expo-router";

export default function SettingsPage() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();

  const appState = useSelector((state: any) => state.appState);

  const [language, setLanguage] = useState(appState.language);
  const [accessibility, setAccessibility] = useState(appState.accessibility);
  const [activateCamera, setActivateCamera] = useState(appState.activateCamera);
  const [accessStudio, setAccessStudio] = useState(appState.accessStudio);
  const [notifications, setNotifications] = useState(appState.notifications);
  const [profilePasscode, setProfilePasscode] = useState(
    appState.profilePasscode
  );

  const updateState = (key: any, value: any) => {
    dispatch(updateAppState({ [key]: value }));
  };

  function onLabelPress(label: "en" | "ar") {
    return () => {
      if (language === label) {
        return;
      }
      dispatch(updateAppState({ language: label }));
      i18n.changeLanguage(label);
      setLayoutDirection(label);
    };
  }

  return (
    <ScrollView>
      <View className="bg-blue-50/20 h-full p-4 flex-col gap-4">
        <Text className="font-semibold text-xl">My settings</Text>
        <View className="bg-background rounded-2xl p-4 flex-col gap-3">
          <Text className="text-lg font-semibold">Language </Text>

          <RadioGroup
            value={language === "ar" ? "Arabic" : "English"}
            onValueChange={setLanguage}
            className="gap-2"
          >
            <RadioGroupItemWithLabel
              value="Arabic"
              onLabelPress={onLabelPress("ar")}
            />
            <RadioGroupItemWithLabel
              value="English"
              onLabelPress={onLabelPress("en")}
            />
          </RadioGroup>
        </View>

        {/* Accessibility Settings */}
        <View className="bg-white rounded-2xl p-4 ">
          <Text className="text-lg font-semibold mb-3">Accessibility</Text>
          <RadioGroup
            value={accessibility}
            onValueChange={(value) => {
              setAccessibility(value);
              updateState("accessibility", value);
            }}
            className="gap-2"
          >
            <RadioGroupItemWithLabel
              value="Stop"
              onLabelPress={() => {
                setAccessibility("Stop");
                updateState("accessibility", "Stop");
              }}
            />
            <RadioGroupItemWithLabel
              value="Dim Light"
              onLabelPress={() => {
                setAccessibility("Dim Light");
                updateState("accessibility", "Dim Light");
              }}
            />
            <RadioGroupItemWithLabel
              value="Invert Colors"
              onLabelPress={() => {
                setAccessibility("Invert Colors");
                updateState("accessibility", "Invert Colors");
              }}
            />
            <RadioGroupItemWithLabel
              value="White & Black"
              onLabelPress={() => {
                setAccessibility("White & Black");
                updateState("accessibility", "White & Black");
              }}
            />
          </RadioGroup>
        </View>

        {/* Permissions Settings */}
        <View className="bg-white rounded-2xl p-4 ">
          <Text className="text-lg font-semibold mb-3">Permissions</Text>
          <SwitchWithLabel
            label="Activate Camera"
            value={activateCamera}
            onValueChange={(value) => {
              setActivateCamera(value);
              updateState("activateCamera", value);
            }}
          />
          <SwitchWithLabel
            label="Access the Studio"
            value={accessStudio}
            onValueChange={(value) => {
              setAccessStudio(value);
              updateState("accessStudio", value);
            }}
          />
        </View>

        {/* Notifications Settings */}
        <View className="bg-white rounded-2xl p-4 ">
          <Text className="text-lg font-semibold mb-3">Notifications</Text>
          <SwitchWithLabel
            label="Enable Notifications"
            value={notifications}
            onValueChange={(value) => {
              setNotifications(value);
              updateState("notifications", value);
            }}
          />
        </View>

        {/* Profile Passcode */}
        <View className="bg-white rounded-2xl p-4 ">
          <Text className="text-lg font-semibold mb-3">Profile Passcode</Text>
          <SwitchWithLabel
            label="Enable Passcode"
            value={profilePasscode}
            onValueChange={(value) => {
              setProfilePasscode(value);
              updateState("profilePasscode", value);
            }}
          />
        </View>

        {/* Additional Options */}
        <Button
          onPress={() => router.push("/")}
          variant={"secondary"}
          className="bg-white"
        >
          <Text className="text-neutral-700  font-semibold ">Rate the App</Text>
        </Button>
        <Button
          onPress={() => router.push("/(Routes)/(patient)/help")}
          variant={"secondary"}
          className="bg-white"
        >
          <Text className="text-neutral-700  font-semibold ">Help Center</Text>
        </Button>
      </View>
    </ScrollView>
  );
}

function RadioGroupItemWithLabel({
  value,
  onLabelPress,
}: Readonly<{
  value: string;
  onLabelPress: () => void;
}>) {
  return (
    <View className={"flex-row gap-2 items-center"}>
      <RadioGroupItem aria-labelledby={"label-for-" + value} value={value} />
      <Label nativeID={"label-for-" + value} onPress={onLabelPress}>
        {value}
      </Label>
    </View>
  );
}

function SwitchWithLabel({
  label,
  value,
  onValueChange,
}: {
  label: string;
  value: boolean;
  onValueChange: (val: boolean) => void;
}) {
  return (
    <View className="flex-row justify-between items-center mb-3">
      <Text className="text-neutral-800 font-medium">{label}</Text>
      <Switch checked={value} onCheckedChange={onValueChange} />
    </View>
  );
}
