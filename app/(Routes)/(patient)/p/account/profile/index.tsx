import React, { useState } from "react";
import { View, Text, Platform } from "react-native";
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

export default function ProfilePage() {
  const dispatch = useDispatch();
  const user = useSelector((state: any) => state.user);
  const {
    email,
    firstName,
    lastName,
    phoneNumber,
    dateOfBirth,
    gender,
    country,
  } = user;

  const countryData = () => getCountryByCca2(country);

  const [selectedCountry, setSelectedCountry] = useState<ICountry | undefined>(
    countryData
  );
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(dateOfBirth);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      firstName,
      lastName,
      phoneNumber,
      email,
      dateOfBirth,
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
          {label}
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
      <Text className="font-bold text-xl mb-4">My Profile</Text>

      <View>
        <Text className="mb-2">Name</Text>
        <Controller
          name="firstName"
          control={control}
          rules={{ required: "First name is required" }}
          render={({ field: { onChange, value } }) => (
            <Input
              placeholder="First Name"
              value={value}
              onChangeText={onChange}
            />
          )}
        />
        {errors.firstName && (
          <Text className="text-red-500">
            {errors.firstName.message?.toString()}
          </Text>
        )}
      </View>

      <View>
        <Text className="mb-2">Phone Number</Text>
        <Controller
          name="phoneNumber"
          control={control}
          rules={{ required: "Phone number is required" }}
          render={({ field: { onChange, value } }) => (
            <PhoneInput
              value={value}
              onChangePhoneNumber={(number) => {
                onChange(number);
              }}
              selectedCountry={selectedCountry}
              onChangeSelectedCountry={setSelectedCountry}
              customCaret={<ArrowDown2 variant="Bold" size="18" color="#000" />}
              language="en"
              defaultCountry="SA"
            />
          )}
        />

        {errors.phoneNumber && (
          <Text className="text-red-500">
            {errors.phoneNumber.message?.toString()}
          </Text>
        )}
      </View>

      <View>
        <Text className="mb-2">Email</Text>
        <Controller
          name="email"
          control={control}
          rules={{ required: "Email is required", pattern: /\S+@\S+\.\S+/ }}
          render={({ field: { onChange, value } }) => (
            <Input
              placeholder="Email"
              value={value}
              onChangeText={onChange}
              keyboardType="email-address"
            />
          )}
        />
        {errors.email && (
          <Text className="text-red-500">
            {errors.email.message?.toString()}
          </Text>
        )}
      </View>

      <View>
        <Text className="mb-2">Date of Birth</Text>
        <Controller
          name="dateOfBirth"
          control={control}
          rules={{ required: "Date of birth is required" }}
          render={({ field: { onChange } }) => (
            <View>
              <Button onPress={showDatePicker} className="bg-primary-50 p-2">
                <Text>
                  {selectedDate ? selectedDate.toString() : "Select Date"}
                </Text>
              </Button>
              {datePickerVisible && (
                <DateTimePicker
                  value={new Date(selectedDate) || new Date()}
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
        {errors.dateOfBirth && (
          <Text className="text-red-500">
            {errors.dateOfBirth.message?.toString()}
          </Text>
        )}
      </View>

      <View>
        <Text className="mb-2">Gender</Text>
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
      </View>

      <Button className="bg-purple-500 mt-4" onPress={handleSubmit(onSubmit)}>
        <Text className="text-white font-semibold">Update</Text>
      </Button>
    </View>
  );
}
