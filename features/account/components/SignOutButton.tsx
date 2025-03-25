import { Button } from "@/components/ui/Button";
import { Text } from "@/components/ui/Text";
import { H3 } from "@/components/ui/Typography";
import { CustomIcons } from "@/const";
import { useClerk } from "@clerk/clerk-expo";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { X } from "lucide-react-native";
import React, { useRef } from "react";
import { View } from "react-native";

export const SignOutButton = () => {
  const { signOut } = useClerk();
  const signoutbottomSheetRef = useRef<BottomSheet>(null);
  
  const handelOpenPress = () => signoutbottomSheetRef.current?.expand();
  const handelClosePress = () => signoutbottomSheetRef.current?.close();
  const handleSignOut = async () => {
    try {
      await signOut();
      handelClosePress();
    } catch (err) {
      console.error(JSON.stringify(err, null, 2));
    }
  };

  return (
    <>
      <Button variant={"default"} className="w-full my-2 z-0" onPress={handelOpenPress}>
        <Text>Sign out</Text>
      </Button>

      <BottomSheet
        ref={signoutbottomSheetRef}
        index={-1} // Start fully hidden
        enablePanDownToClose={true}
        style={{ zIndex: 500 }}
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
            <H3 className="border-none">Are you sure you want to Logout?</H3>
            <Button onPress={handleSignOut} className="w-full">
              <Text className="text-white font-semibold">Logout</Text>
            </Button>
          </View>
        </BottomSheetView>
      </BottomSheet>
    </>
  );
};
