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
import Drawer from "@/components/ui/Drawer";
import { H3 } from "@/components/ui/Typography";
import { OtpInput } from "react-native-otp-entry";
import colors from "@/utils/colors";
import { UserType } from "@/features/user/types/user.type";
import { updateUserState } from "@/store/user/user";
import { AppStateType } from "@/features/setting/types/setting.type";
import { apiBaseUrl } from "@/features/Home/constHome";
import { toast } from "sonner-native";
import { SetPasscode } from "@/features/account/utils/passCode";

export default function SettingsPage() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();

  const appState: AppStateType = useSelector((state: any) => state.appState);
  const user: UserType = useSelector((state: any) => state.user);

  const [language, setLanguage] = useState(appState.language);
  const [accessibility, setAccessibility] = useState(appState.accessibility);
  const [activateCamera, setActivateCamera] = useState(appState.activateCamera);
  const [accessStudio, setAccessStudio] = useState(appState.accessStudio);
  const [notifications, setNotifications] = useState(appState.notifications);
  const [profilePasscode, setProfilePasscode] = useState(user.passcode);

  const [isPassCodeDrawer, setIsPassCodeDrawer] = useState(false);
  const [tempPasscode, setTempPasscode] = useState("");

  const updateState = (key: string, value: string | null | boolean) => {
    dispatch(updateAppState({ [key]: value }));
  };

  function onLabelPress(label: "en" | "ar") {
    return () => {
      if (language === label) {
        toast(
          label === "ar"
            ? "Language already is Arabic"
            : "Language already is English"
        );
        return;
      }
      try {
        dispatch(updateAppState({ language: label }));
        i18n.changeLanguage(label);
        setLayoutDirection(label);
        toast.success(
          label === "ar"
            ? "Language Changed Successful to Arabic"
            : "Language Changed Successful to English"
        );
      } catch (error) {
        toast.error("Error Changing in Language");
      }
    };
  }

  function PassCodeToggle(value: boolean) {
    if (value) {
      if (!profilePasscode) {
        setIsPassCodeDrawer(true);
      } else {
        handleSetPasscode(null); // Call API to set passcode
      }
    } else {
      handleSetPasscode(null); // Call API to clear passcode
    }
  }

  function handlePasscodeSubmit() {
    if (tempPasscode.trim().length === 4) {
      handleSetPasscode(tempPasscode); // Call API to set passcode
      setIsPassCodeDrawer(false);
      setTempPasscode("");
    } else {
      alert("Passcode must be 4 digits.");
    }
  }

  // Helper function to set or clear passcode using API
  async function handleSetPasscode(passcode: string | null) {
    try {
      const result = await SetPasscode(user.phoneNumber, passcode);

      if (result.success) {
        toast.success("Passcode updated successfully");
        dispatch(updateUserState({})); // Update Redux state
        setProfilePasscode(passcode);
      } else {
        toast.error("Failed to update passcode");
      }
    } catch (error) {
      console.error("Error setting passcode:", error);
      toast.error("Error setting passcode");
    }
  }

  return (
    <ScrollView>
      <View className="bg-blue-50/20 h-full p-4 flex-col gap-4">
        <Text className="font-semibold text-xl">My settings</Text>
        <View className="bg-background rounded-2xl p-4 flex-col gap-3">
          <Text className="text-lg font-semibold">Language</Text>

          <RadioGroup
            value={language === "ar" ? "Arabic" : "English"}
            onValueChange={() => setLanguage}
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
              setAccessibility(
                value as
                  | "Stop"
                  | "Dim Light"
                  | "Invert Colors"
                  | "White & Black"
              );
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
            onValueChange={(value: boolean) => {
              setActivateCamera(value);
              updateState("activateCamera", value);
            }}
          />
          <SwitchWithLabel
            label="Access the Studio"
            value={accessStudio}
            onValueChange={(value: boolean) => {
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
            onValueChange={(value: boolean) => {
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
            value={!!profilePasscode}
            onValueChange={(value: boolean) => PassCodeToggle(value)}
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
      <View className="flex-1 justify-center items-center">
        <Drawer
          visible={isPassCodeDrawer}
          onClose={() => setIsPassCodeDrawer(false)}
          title="Set Passcode"
          className="max-h-[50%]"
          height="70%"
        >
          <View className="flex flex-col flex-1 justify-center items-center w-full gap-4 px-6">
            <H3 className="border-none ">Enter your Passcode</H3>
            <OtpInput
              numberOfDigits={4}
              focusColor={colors.primary[500]}
              onTextChange={setTempPasscode}
              theme={{
                containerStyle: {},
                inputsContainerStyle: {
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "center",
                  gap: "10px",
                },
                pinCodeContainerStyle: {
                  aspectRatio: 1 / 1,
                  width: 60,
                  marginHorizontal: 10,
                  backgroundColor: "white",
                },
                pinCodeTextStyle: {
                  fontSize: 40,
                  textAlignVertical: "center",
                },
              }}
            />
            <Button onPress={handlePasscodeSubmit} className="w-full">
              <Text className="text-white font-semibold">Save Passcode</Text>
            </Button>
            <Button
              onPress={() => setIsPassCodeDrawer(false)}
              variant={"ghost"}
              className="w-full"
            >
              <Text className="text-neutral-500 font-semibold">Cancel</Text>
            </Button>
          </View>
        </Drawer>
      </View>
    </ScrollView>
  );
}

function RadioGroupItemWithLabel({ value, onLabelPress }: any) {
  return (
    <View className="flex-row gap-2 items-center">
      <RadioGroupItem aria-labelledby={`label-for-${value}`} value={value} />
      <Label nativeID={`label-for-${value}`} onPress={onLabelPress}>
        {value}
      </Label>
    </View>
  );
}

function SwitchWithLabel({ label, value, onValueChange }: any) {
  return (
    <View className="flex-row justify-between items-center mb-3">
      <Text className="text-neutral-800 font-medium">{label}</Text>
      <Switch checked={value} onCheckedChange={onValueChange} />
    </View>
  );
}
