import { View } from "react-native";
import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Text } from "@/components/ui/Text";
import Drawer from "@/components/ui/Drawer";
import { CustomIcons } from "@/const";
import { H3 } from "@/components/ui/Typography";
import { RadioGroup } from "@/components/ui/RadioGroup";
import { RadioGroupItemWithLabel } from "@/components/ui/RadioGroupItemWithLabel";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner-native";
import { logout } from "@/store/user/user";
import { apiBaseUrl } from "@/features/Home/constHome";

export default function AccountDeleteButton() {
  const PatientDeleteAccountOptions = [
    "The services don't apply to me / I do not need the existing services.",
    "The application is not working properly.",
    "Not satisfied with the provided services.",
    "I have another account with a different phone number or ID.",
  ];
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [value, setValue] = useState("");

  const dispatch = useDispatch();
  const user = useSelector((state: any) => state.user);

  function onLabelPress(label: string) {
    return () => {
      setValue(label);
    };
  }

  const handleSubmit = async () => {
    if (!value) {
      toast.error("Please select a reason for account deletion.");
      return;
    }

    try {
      const payload = {
        phoneNumber: user.phoneNumber,
        feedback: value,
      };

      const response = await fetch(`${apiBaseUrl}/api/delete-patient-account`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success("Account deleted successfully.");
        dispatch(logout()); // Log the user out
      } else {
        toast.error(result.message || "Failed to delete account.");
      }
    } catch (error) {
      console.error("Error deleting account:", error);
      toast.error("Error deleting account.");
    } finally {
      setIsDrawerVisible(false);
    }
  };

  return (
    <View className="flex-1 justify-center items-center">
      <Button
        onPress={() => setIsDrawerVisible(true)}
        variant={"link"}
        className="py-4"
      >
        <Text className="text-neutral-600">Delete Account</Text>
      </Button>

      <Drawer
        visible={isDrawerVisible}
        onClose={() => setIsDrawerVisible(false)}
        title="Delete Account"
        height="70%"
      >
        <View className="flex flex-col flex-1 justify-center items-center w-full gap-4 px-6">
          <View className="aspect-square flex justify-center items-center relative overflow-visible p-2">
            <View className="bg-blue-50/20 aspect-square rounded-full w-[5.5rem] absolute"></View>
            <CustomIcons.BellAlert.Icon height={80} width={80} />
          </View>
          <H3 className="border-none">Are you sure you want to delete?</H3>
          <Text className="text-lg">Could you tell us why?</Text>
          <RadioGroup value={value} onValueChange={setValue} className="gap-6">
            {PatientDeleteAccountOptions.map((option) => (
              <RadioGroupItemWithLabel
                key={option}
                value={option}
                onLabelPress={onLabelPress(option)}
              />
            ))}
          </RadioGroup>
          <Button onPress={handleSubmit} className="w-full">
            <Text className="text-white font-semibold">Submit</Text>
          </Button>
        </View>
      </Drawer>
    </View>
  );
}
