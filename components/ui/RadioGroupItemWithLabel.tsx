import { View } from "react-native";
import { RadioGroupItem } from "./RadioGroup";
import { Label } from "./Label";

export function RadioGroupItemWithLabel({
    value,
    onLabelPress,
  }: Readonly<{
    value: string;
    onLabelPress: () => void;
  }>) {
    return (
      <View className={"flex-row gap-3 items-center "}>
        <RadioGroupItem aria-labelledby={"label-for-" + value} value={value} />
        <Label
          nativeID={"label-for-" + value}
          onPress={onLabelPress}
          className="text-lg"
        >
          {value}
        </Label>
      </View>
    );
  }
  