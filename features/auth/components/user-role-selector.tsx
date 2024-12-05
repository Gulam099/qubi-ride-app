import { Label } from "@/components/ui/Label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/RadioGroup";
import * as React from "react";
import { View } from "react-native";
import { RoleType } from "../types/auth.types";
import { Text } from "@/components/ui/Text";
import { toCapitalizeFirstLetter } from "@/utils/string.utils";

export default function UserRoleSelector(props: {
  RoleData: RoleType;
  setRoleData: React.Dispatch<React.SetStateAction<RoleType>>;
}) {
  const { RoleData, setRoleData } = props;
  const RoleList: RoleType[] = ["patient", "specialist"];

  function onLabelPress(label: RoleType) {
    return () => {
      setRoleData(label);
    };
  }

  return (
    <View className="flex gap-4 justify-start items-start px-6 w-full">
      <Text className="w-full text-left text-base font-semibold">Login as</Text>
      <RadioGroup
        value={RoleData}
        onValueChange={
          setRoleData as React.Dispatch<React.SetStateAction<string>>
        }
        className="gap-6 w-full"
      >
        {RoleList.map((e, i) => (
          <RadioGroupItemWithLabel
            key={e}
            value={e}
            onLabelPress={onLabelPress(e)}
          />
        ))}
      </RadioGroup>
    </View>
  );
}

function RadioGroupItemWithLabel({
  value,
  onLabelPress,
}: Readonly<{
  value: RoleType;
  onLabelPress: () => void;
}>) {
  return (
    <View
      className={
        "flex flex-row gap-2 items-center border rounded-xl w-full  p-6 "
      }
      onTouchStart={onLabelPress}
    >
      <RadioGroupItem aria-labelledby={"label-for-" + value} value={value} />
      <Label nativeID={"label-for-" + value} onPress={onLabelPress}>
        <Text>{toCapitalizeFirstLetter(value)}</Text>
      </Label>
    </View>
  );
}
