import React, { useState } from "react";
import { View, Platform } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { Input } from "@/components/ui/Input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/RadioGroup";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import { updateUser } from "@/store/user/user";
import PhoneInput, {
  ICountry,
  getCountryByCca2,
} from "react-native-international-phone-number";
import { ArrowDown2 } from "iconsax-react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { toast } from "sonner-native";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";
import { Text } from "@/components/ui/Text";
import { H2, H3 } from "@/components/ui/Typography";

export default function ProfilePage() {
  const dispatch = useDispatch();
  const user = useSelector((state: any) => state.user);
  const { t } = useTranslation();
  const language = useSelector((state: any) => state.appState.language);
  const { email, name, phoneNumber, dob, gender, country } = user;

  const countryData = () => getCountryByCca2(country);

  const [selectedCountry, setSelectedCountry] = useState<ICountry | undefined>(
    countryData
  );
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(dob);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name,
      phoneNumber,
      email,
      dob,
      gender,
    },
  });

  const onSubmit = (data: any) => {
    dispatch(updateUser({ country: selectedCountry?.cca2, ...data }));
    toast.success("Operation successful!", {
      className: "bg-green-500",
      style: { backgroundColor: "blue" },
      description: "Everything worked as expected.",
      duration: 5000, // Adjust duration here
    });
  };

  function RadioGroupItemWithLabel({
    value,
    label,
    onChange,
  }: {
    value: any;
    label: any;
    selectedValue: any;
    onChange: any;
  }) {
    return (
      <View className="flex-row items-center gap-2">
        <RadioGroupItem
          aria-labelledby={`label-for-${value}`}
          value={value}
          onPress={() => onChange(value)}
        />
        <Label nativeID={`label-for-${value}`} onPress={() => onChange(value)}>
          {t(label)}
        </Label>
      </View>
    );
  }

  const showDatePicker = () => setDatePickerVisible(true);
  const handleDateChange = (event: any, selectedDateValue: any) => {
    setDatePickerVisible(Platform.OS === "ios");
    if (selectedDateValue) {
      setSelectedDate(selectedDateValue);
    }
  };

  return (
    <View className="p-4 bg-blue-50/10 h-full flex flex-col gap-4">
      <H3 className=" text-xl mb-4">{t("MyProfile")}</H3>

      <View>
        <Text className="mb-2">{t("Name")}</Text>
        <Controller
          name="name"
          control={control}
          rules={{ required: t("Name") }}
          render={({ field: { onChange, value } }) => (
            <Input
              placeholder={t("Name")}
              value={value}
              onChangeText={onChange}
            />
          )}
        />
        {errors.name && (
          <Text className="text-red-500 text-sm py-1">
            {errors.name.message?.toString()}
          </Text>
        )}
      </View>

      <View>
        <Text className="mb-2">{t("PhoneNumber")}</Text>
        <Controller
          name="phoneNumber"
          control={control}
          rules={{ required: t("PhoneNumberRequired") }}
          render={({ field: { onChange, value } }) => (
            <PhoneInput
              value={value}
              onChangePhoneNumber={(number) => {
                onChange(number);
              }}
              selectedCountry={selectedCountry}
              onChangeSelectedCountry={setSelectedCountry}
              customCaret={<ArrowDown2 variant="Bold" size="18" color="#000" />}
              language={language}
              defaultCountry="SA"
            />
          )}
        />

        {errors.phoneNumber && (
          <Text className="text-red-500 text-sm py-1">
            {errors.phoneNumber.message?.toString()}
          </Text>
        )}
      </View>

      <View>
        <Text className="mb-2">{t("Email")}</Text>
        <Controller
          name="email"
          control={control}
          rules={{ pattern: /\S+@\S+\.\S+/ }}
          render={({ field: { onChange, value } }) => (
            <Input
              placeholder={t("Email")}
              value={value}
              onChangeText={onChange}
              keyboardType="email-address"
            />
          )}
        />
        {errors.email && (
          <Text className="text-red-500 text-sm py-1">
            {errors.email.message?.toString()}
          </Text>
        )}
      </View>

      <View>
        <Text className="mb-2">{t("DateOfBirth")}</Text>
        <Controller
          name="dob"
          control={control}
          render={({ field: { onChange } }) => (
            <View>
              <Button onPress={showDatePicker} className="bg-background p-2">
                <Text className="text-neutral-700">
                  {selectedDate === "Not selected"
                    ? format(selectedDate, "dd / mm / yyyy")
                    : t("SelectDate")}
                </Text>
              </Button>
              {datePickerVisible && (
                <DateTimePicker
                  value={
                    new Date(
                      selectedDate === "Not selected"
                        ? new Date()
                        : selectedDate
                    ) || new Date()
                  }
                  mode="date"
                  display="default"
                  onChange={(event, date) => {
                    handleDateChange(event, date);
                    onChange(date);
                  }}
                />
              )}
            </View>
          )}
        />
        {errors.dob && (
          <Text className="text-red-500">{errors.dob.message?.toString()}</Text>
        )}
      </View>

      <View>
        <Text className="mb-2">{t("Gender")}</Text>
        <Controller
          name="gender"
          control={control}
          render={({ field: { onChange, value } }) => (
            <RadioGroup
              value={value}
              onValueChange={onChange}
              className="gap-3 flex-row"
            >
              <RadioGroupItemWithLabel
                value="Male"
                label="Male"
                selectedValue={value}
                onChange={onChange}
              />
              <RadioGroupItemWithLabel
                value="Female"
                label="Female"
                selectedValue={value}
                onChange={onChange}
              />
            </RadioGroup>
          )}
        />
        {errors.gender && (
          <Text className="text-red-500">
            {errors.gender.message?.toString()}
          </Text>
        )}
      </View>

      <Button className="bg-purple-500 mt-4" onPress={handleSubmit(onSubmit)}>
        <Text className="text-white font-semibold">{t("Update")}</Text>
      </Button>
    </View>
  );
}
