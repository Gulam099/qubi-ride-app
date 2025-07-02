import { Button } from "@/components/ui/Button";
import { Text } from "@/components/ui/Text";
import { H3 } from "@/components/ui/Typography";
import { CustomIcons } from "@/const";
import { useClerk } from "@clerk/clerk-expo";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { router } from "expo-router";
import { X } from "lucide-react-native";
import React, { forwardRef, useRef, useImperativeHandle } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

type SignOutSheetRef = {
  open: () => void;
  close: () => void;
};

export const SignOutButton = ({ sheetRef }: { sheetRef: React.RefObject<SignOutSheetRef> }) => {
    const { t } = useTranslation();
  
  return (
    <Button
      variant={"default"}
      className="w-full my-2 z-0"
      onPress={() => sheetRef.current?.open()}
    >
      <Text>{t("Signout")}</Text>
    </Button>
  );
};

export const SignOutSheet = forwardRef<SignOutSheetRef>((_, ref) => {
  const { signOut } = useClerk();
  const internalSheetRef = useRef<BottomSheet>(null);

  // expose methods to parent
  useImperativeHandle(ref, () => ({
    open: () => internalSheetRef.current?.expand(),
    close: () => internalSheetRef.current?.close(),
  }));

  const handleSignOut = async () => {
    try {
      await signOut();
      internalSheetRef.current?.close();
      router.push('/(auth)/sign-in');
    } catch (err) {
      console.error(JSON.stringify(err, null, 2));
    }
  };

  return (
    <BottomSheet
      ref={internalSheetRef}
      index={-1}
      enablePanDownToClose
      style={{ zIndex: 500 }}
    >
      <BottomSheetView className="w-full flex-1 bg-white">
        <View className="flex flex-col justify-center items-center w-[90%] gap-4 p-6 mx-auto">
          <Button
            size="icon"
            variant="ghost"
            className="absolute top-2 right-2 rounded-full p-0 text-neutral-800"
            onPress={() => internalSheetRef.current?.close()}
          >
            <X size={20} color={"#262626"} />
          </Button>
          <View className="aspect-square flex justify-center items-center relative overflow-visible p-2">
            <View className="bg-blue-50/20 aspect-square rounded-full w-[5.5rem] absolute" />
            <CustomIcons.BellAlert.Icon height={80} width={80} />
          </View>
          <H3 className="border-none">Are you sure you want to Logout?</H3>
          <Button onPress={handleSignOut} className="w-full">
            <Text className="text-white font-semibold">Logout</Text>
          </Button>
        </View>
      </BottomSheetView>
    </BottomSheet>
  );
});
