import { View } from "react-native";
import React, { useRef, useState } from "react";
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
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { X } from "lucide-react-native";
import { useClerk, useUser } from "@clerk/clerk-expo";

export default function AccountDeleteButton() {
  const bottomSheetRef = useRef<BottomSheet>(null);

  const PatientDeleteAccountOptions = [
    "The services don't apply to me / I do not need the existing services.",
    "The application is not working properly.",
    "Not satisfied with the provided services.",
    "I have another account with a different phone number or ID.",
  ];
  const [value, setValue] = useState("");

  const { user } = useUser();
  const { signOut } = useClerk();

  function onLabelPress(label: string) {
    return () => {
      setValue(label);
    };
  }

  const handelOpenPress = () => bottomSheetRef.current?.expand();
  const handelClosePress = () => bottomSheetRef.current?.close();

  const handleSubmit = async () => {
    if (!value) {
      toast.error("Please select a reason for account deletion.");
      return;
    }

    try {
      const payload = {
        phoneNumber: user?.primaryPhoneNumber?.phoneNumber,
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
        await signOut();
      } else {
        toast.error(result.message || "Failed to delete account.");
      }
    } catch (error) {
      console.error("Error deleting account:", error);
      toast.error("Error deleting account.");
    } finally {
      handelClosePress();
    }
  };

  return (
    <>
      <Button
        onPress={handelOpenPress}
        variant={"secondary"}
        className="w-full my-2 "
      >
        <Text className="text-neutral-600">Delete Account</Text>
      </Button>

      <BottomSheet
        ref={bottomSheetRef}
        index={-1} // Start fully hidden
        enablePanDownToClose={true}
      >
        <BottomSheetView className="w-full flex-1 bg-white ">
          <View className="flex flex-col justify-center items-center w-[90%] gap-4 p-6 mx-auto">
            <Button
              size={"icon"}
              variant={"ghost"}
              className="absolute top-2 right-2 rounded-full p-0 text-neutral-800"
              onPress={handelClosePress}
            >
              <X size={20} color={"#262626"} />
            </Button>
            <View className="aspect-square flex justify-center items-center relative overflow-visible p-2">
              <View className="bg-blue-50/20 aspect-square rounded-full w-[5.5rem] absolute"></View>
              <CustomIcons.BellAlert.Icon height={80} width={80} />
            </View>
            <H3 className="border-none">Are you sure you want to delete?</H3>
            <Text className="text-lg">Could you tell us why?</Text>
            <RadioGroup
              value={value}
              onValueChange={setValue}
              className="gap-6"
            >
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
        </BottomSheetView>
      </BottomSheet>
    </>
  );
}
