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
export default function ProfilePage() {
  const dispatch = useDispatch();
  const user: UserType = useSelector((state: any) => state.user);
  const { t } = useTranslation();
  const { email, name, phoneNumber, dob, gender, imageUrl } = user;

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

  const onSubmit = (data: Partial<UserType>) => {
    dispatch(updateUserState(data));
    toast.success("Profile updated successfully!");
  };

  const handleRemoveImage = () => {
    if (imageUrl === "") {
      return;
    }
    dispatch(updateUserState({ phoneNumber, imageUrl: "" }));
    toast.success("Image removed successfully!");
  };

  const handleSelectImage = async () => {
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
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled) {
        const selectedImage = result.assets[0];

        // Create a FormData object and append the required data
        const formData = new FormData();
        formData.append("phoneNumber", user.phoneNumber); // Add phoneNumber
        formData.append("image", {
          uri: selectedImage.uri,
          type: "image/png",
          name: `profile-image.jpg`, // Use fileName or fallback
        } as any); // Explicitly cast to match FormData type expectations

        const config = {
          headers: {
            "Content-Type": "multipart/form-data", // Header for file uploads
          },
          transformRequest: () => {
            return formData;
          },
        };

        // Make the API call to upload the image
        try {
          const response = await axios.put(
            `${apiBaseUrl}/api/profile/update-profile`,
            formData,
            config
          );

          const result = await response.data;

          if (response.status === 200) {
            toast.success("Image updated successfully!");
            dispatch(updateUserState({}));
          } else {
            toast.error(result.message || "Failed to update image.");
          }
        } catch (error) {
          console.error("Error uploading image:", error);
          toast.error("Error uploading image.");
        }
      }
    } catch (error) {
      console.error("Error selecting image:", error);
      toast.error("Error selecting image.");
    }
  };

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
        <ProfileImage imageUrl={imageUrl} name={name} />
        <View className="flex-row gap-2 mt-2">
          <Button
            onPress={handleRemoveImage}
            className="bg-red-500"
            disabled={imageUrl === ""}
            size="sm"
          >
            <Text className="text-white">{t("Remove Image")}</Text>
          </Button>
          <Button onPress={handleSelectImage} className="bg-blue-500" size="sm">
            <Text className="text-white">{t("Select Image")}</Text>
          </Button>
        </View>
      </View>

      <View>
        <Text className="mb-2">{t("Name")}</Text>
        <Controller
          name="name"
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
