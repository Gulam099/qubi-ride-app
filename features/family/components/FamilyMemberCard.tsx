import { View, Text } from "react-native";
import React from "react";
import { Button } from "@/components/ui/Button";
import { Repeat, Trash } from "iconsax-react-native";
import colors from "@/utils/colors";
import { FamilyType } from "../types/FamilyType";
import { useTranslation } from "react-i18next";

interface FamilyMemberCardProps {
  item: FamilyType;
  handleEdit: (item: FamilyType) => void;
  handleDelete: (id: string) => void;
}

export default function FamilyMemberCard({
  
  item,
  handleEdit,
  handleDelete,
}: FamilyMemberCardProps) {
const { t } = useTranslation();

  return (
    <View className="p-4 bg-white rounded-2xl shadow-md flex-row ">
      <View className="flex-col gap-4 flex-1">
        <Text className="font-medium text-xl">{item.name}</Text>
        <Text>{t("age")}: {item.age}</Text>
        <Text>{t("fileNumber")}: {item.fileNo}</Text>
        <Text>{t("relationship")}: {item.relationship}</Text>
      </View>
      <View className="flex-col gap-1">
        <Button
          variant={"ghost"}
          className="flex-row gap-2"
          onPress={() => handleEdit(item)}
        >
          <Text className="">{t("edit")}</Text>
          <Repeat size="20" color={colors.red[500]} />
        </Button>
        <Button
          variant={"ghost"}
          className="flex-row gap-2"
          onPress={() => handleDelete(item._id)}
        >
          <Text className="">{t("delete")}</Text>
          <Trash size="20" color={"#000"} />
        </Button>
      </View>
    </View>
  );
}
