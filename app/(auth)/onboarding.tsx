import React, { useState } from "react";
import { View, Platform } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { Input } from "@/components/ui/Input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/RadioGroup";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import { updateUserState } from "@/store/user/user";
import { toast } from "sonner-native";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";
import { Text } from "@/components/ui/Text";
import { H3 } from "@/components/ui/Typography";
import { UserType } from "@/features/user/types/user.type";
import ProfileImage from "@/features/account/components/ProfileImage";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as ImagePicker from "expo-image-picker";
import { apiBaseUrl } from "@/features/Home/constHome";
import axios from "axios";
import { useUser } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
export default function ProfilePage() {
  const { user } = useUser();
  const router = useRouter();
  const { t } = useTranslation();

  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(
    user?.unsafeMetadata?.dob as string
  );

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      first_name: user?.firstName,
      last_name: user?.lastName,
      email: user?.primaryEmailAddress?.emailAddress,
      phoneNumber: user?.primaryPhoneNumber?.phoneNumber,
      dob: user?.unsafeMetadata?.dob,
      gender: user?.unsafeMetadata?.gender as string,
      // address: user?.unsafeMetadata?.address,
    },
  });

  const onSubmit = async (data: Partial<UserType>) => {
    await user?.update({
      firstName: data.first_name,
      lastName: data.last_name,
      unsafeMetadata: {
        dob: data.dob,
        gender: data.gender,
        // address: data.address,
        onboardingComplete: true,
      },
    });
    toast.success("Profile updated successfully!");
    router.replace("/");
  };

  const handleRemoveImage = () => {
    if (user?.imageUrl === "") {
      return;
    }

    toast.success("Image removed successfully!");
  };

  async function onPickImage() {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        toast.error("Permission to access media library is required.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [4, 4],
        quality: 0.1,
        base64: true,
      });

      if (!result.canceled && result.assets[0].base64) {
        const base64 = result.assets[0].base64;
        const mimeType = result.assets[0].mimeType;

        const image = `data:${mimeType};base64,${base64}`;

        await user?.setProfileImage({
          file: image,
        });
      }
    } catch (err: any) {
      alert(err.errors[0].message);
    }
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

      {/* Profile Image */}
      <View className="flex gap-4 items-center ">
        <ProfileImage
          imageUrl={user?.imageUrl || ""}
          name={user?.fullName || ""}
        />
        <View className="flex-row gap-2 mt-2">
          <Button
            onPress={handleRemoveImage}
            className="bg-red-500"
            disabled={user?.imageUrl === ""}
            size="sm"
          >
            <Text className="text-white">{t("Remove Image")}</Text>
          </Button>
          <Button onPress={onPickImage} className="bg-blue-500" size="sm">
            <Text className="text-white">{t("Select Image")}</Text>
          </Button>
        </View>
      </View>

      <View>
        <Label className="mb-2">{t("Name")}</Label>
        <Controller
          name="first_name"
          control={control}
          rules={{ required: t("First Name") }}
          render={({ field: { onChange, value } }) => (
            <Input
              placeholder={t("Name")}
              value={value ? (value as string) : undefined}
              onChangeText={onChange}
            />
          )}
        />
        {errors.first_name && (
          <Text className="text-red-500 text-sm py-1">
            {errors.first_name.message?.toString()}
          </Text>
        )}
      </View>

      <View>
        <Label className="mb-2">{t("Last Name")}</Label>
        <Controller
          name="last_name"
          control={control}
          rules={{ required: t("Name") }}
          render={({ field: { onChange, value } }) => (
            <Input
              placeholder={t("Name")}
              value={value ? (value as string) : undefined}
              onChangeText={onChange}
            />
          )}
        />
        {errors.last_name && (
          <Text className="text-red-500 text-sm py-1">
            {errors.last_name.message?.toString()}
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
            <Input
              editable={false}
              placeholder={t("Phone Number")}
              value={value}
              onChangeText={onChange}
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
              value={value ? (value as string) : undefined}
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
                    ? t("SelectDate")
                    : format(selectedDate, "dd  MMM  yyyy")}
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
              <RadioGroupItem
                value="Male"
                aria-labelledby="male-label"
                onPress={() => onChange("Male")}
              />
              <Label nativeID="male-label">{t("Male")}</Label>
              <RadioGroupItem
                value="Female"
                aria-labelledby="female-label"
                onPress={() => onChange("Female")}
              />
              <Label nativeID="female-label">{t("Female")}</Label>
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
