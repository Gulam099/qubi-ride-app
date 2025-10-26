import { View } from "react-native";
import React, { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Text } from "@/components/ui/Text";
import { H3 } from "@/components/ui/Typography";
import { RadioGroup } from "@/components/ui/RadioGroup";
import { RadioGroupItemWithLabel } from "@/components/ui/RadioGroupItemWithLabel";
import { toast } from "sonner-native";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { X } from "lucide-react-native";
import { useMutation } from "@tanstack/react-query";
import useUserData from "@/hooks/userData";

type DeleteAccountSheetRef = {
  open: () => void;
  close: () => void;
};

export const DeleteAccountButton = ({ sheetRef }: { sheetRef: React.RefObject<DeleteAccountSheetRef> }) => {
  return (
    <Button
      onPress={() => sheetRef.current?.open()}
      variant={"secondary"}
      className="w-full my-2"
    >
      <Text className="text-neutral-600">Delete Account</Text>
    </Button>
  );
}

export const DeleteAccountSheet = forwardRef<DeleteAccountSheetRef>((_, ref) => {
  const [value, setValue] = useState("");
  const user = useUserData();

  
  const internalSheetRef = useRef<BottomSheet>(null);
  
  // expose methods to parent
  useImperativeHandle(ref, () => ({
    open: () => internalSheetRef.current?.expand(),
    close: () => internalSheetRef.current?.close(),
  }));

  const reasons = [
    "The services don't apply to me / I do not need the existing services.",
    "The application is not working properly.",
    "Not satisfied with the provided services.",
    "I have another account with a different phone number or ID.",
  ];

  const mutation = useMutation({
    mutationFn: async (feedback: string) => {
      const payload = {
        phoneNumber: user?.primaryPhoneNumber?.phoneNumber,
        feedback,
      };

      const res = await fetch(`${process.env}/api/delete-user-account`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (!res.ok) throw new Error(result.message || "Failed to delete account.");
      return result;
    },
    onSuccess: () => {
      toast.success("Account deleted successfully.");
      internalSheetRef.current?.close();
    },
    onError: (err: any) => {
      toast.error(err.message || "Error deleting account.");
    },
  });

  const handleSubmit = async () => {
    if (!value) {
      toast.error("Please select a reason for account deletion.");
      return;
    }

    try {
      mutation.mutate(value);
    } catch (error) {
      toast.error("Error during sign out.");
    }
  };

  return (
    <BottomSheet
      ref={internalSheetRef}
      index={-1}
      enablePanDownToClose={true}
    >
      <BottomSheetView className="w-full flex-1 bg-white">
        <View className="flex flex-col justify-center items-center w-[90%] gap-4 p-6 mx-auto">
          <Button
            size={"icon"}
            variant={"ghost"}
            className="absolute top-2 right-2 rounded-full p-0 text-neutral-800"
            onPress={() => internalSheetRef.current?.close()}
          >
            <X size={20} color={"#262626"} />
          </Button>

          <View className="aspect-square flex justify-center items-center relative overflow-visible p-2">
            <View className="bg-blue-50/20 aspect-square rounded-full w-[5.5rem] absolute" />
          </View>

          <H3 className="border-none">Are you sure you want to delete?</H3>
          <Text className="text-lg">Could you tell us why?</Text>

          <RadioGroup value={value} onValueChange={setValue} className="gap-6">
            {reasons.map((option) => (
              <RadioGroupItemWithLabel
                key={option}
                value={option}
                onLabelPress={() => setValue(option)}
              />
            ))}
          </RadioGroup>

          <Button onPress={handleSubmit} className="w-full">
            <Text className="text-white font-semibold">Submit</Text>
          </Button>
        </View>
      </BottomSheetView>
    </BottomSheet>
  );
});