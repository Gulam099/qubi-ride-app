import { View, Text, FlatList } from "react-native";
import React, { useState } from "react";
import { RecordListData } from "@/features/scale/constScale";
import { Button } from "@/components/ui/Button";
import Drawer from "@/components/ui/Drawer";
import { H3 } from "@/components/ui/Typography";

export default function GeneralizedAnxietyDisorderScale() {
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [RecordActive, setRecordActive] = useState("1");

  function handleRecordActive(record_Id: string) {
    setRecordActive(record_Id);
    setIsDrawerVisible(true);
  }
  return (
    <View>
      <FlatList
        data={RecordListData}
        renderItem={({ item, index }) => (
          <Button
            key={item.record_Id}
            onPress={() => handleRecordActive(item.record_Id)}
            variant={"link"}
          >
            <Text className="">This todo appers after Payment</Text>
          </Button>
        )}
      />
      <View className="flex-1 justify-center items-center  mt-10 mb-20">
        <Drawer
          visible={isDrawerVisible}
          onClose={() => setIsDrawerVisible(false)}
          title="My Drawer"
          height="40%"
          className="max-h-[40%]"
        >
          <View className="flex flex-col flex-1 justify-center items-center w-full gap-4 px-6">
            <View className=" aspect-square  flex justify-center items-center relative overflow-visible  p-2">
              <View className="bg-blue-50/20 aspect-square rounded-full w-[5.5rem] absolute "></View>
            </View>

            <H3 className="border-none ">Payment Successful</H3>
          </View>
        </Drawer>
      </View>
    </View>
  );
}
