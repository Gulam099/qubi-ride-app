import { View, Text } from "react-native";
import React from "react";
import { Button } from "@/components/ui/Button";
import { Repeat, Trash } from "iconsax-react-native";
import colors from "@/utils/colors";

interface FamilyMemberCardProps {
  item: {
    name: string;
    age: string;
    fileNumber: string;
    relationship: string;
    id: string;
  };
  handleEdit: (item: {
    name: string;
    age: string;
    fileNumber: string;
    relationship: string;
    id: string;
  }) => void;
  handleDelete: (id: string) => void;
}

export default function FamilyMemberCard({
  item,
  handleEdit,
  handleDelete,
}: FamilyMemberCardProps) {
  return (
    <View className="p-4 bg-white rounded-2xl shadow-md flex-row ">
      <View className="flex-col gap-4 flex-1">
        <Text className="font-medium text-xl">{item.name}</Text>
        <Text>Age: {item.age}</Text>
        <Text>File Number: {item.fileNumber}</Text>
        <Text>Relationship: {item.relationship}</Text>
      </View>
      <View className="flex-col gap-1">
        <Button
          variant={"ghost"}
          className="flex-row gap-2"
          onPress={() => handleEdit(item)}
        >
          <Text className="">Edit</Text>
          <Repeat size="20" color={colors.red[500]} />
        </Button>
        <Button
          variant={"ghost"}
          className="flex-row gap-2"
          onPress={() => handleDelete(item.id)}
        >
          <Text className="">Delete</Text>
          <Trash size="20" color={"#000"} />
        </Button>
      </View>
    </View>
  );
}
