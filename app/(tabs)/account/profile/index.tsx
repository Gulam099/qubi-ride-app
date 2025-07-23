import React, { useCallback, useState } from "react";
import { View, Platform, ScrollView } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { Input } from "@/components/ui/Input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/RadioGroup";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import { toast } from "sonner-native";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";
import { Text } from "@/components/ui/Text";
import { UserType } from "@/features/user/types/user.type";
import ProfileImage from "@/features/account/components/ProfileImage";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as ImagePicker from "expo-image-picker";
import { useUser } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { Edit } from "iconsax-react-native";
import { ApiUrl } from "@/const";
export default function ProfilePage() {
  const { user } = useUser();
  const router = useRouter();
  const { t } = useTranslation();

  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(
    (user?.unsafeMetadata?.dob as string) ?? "Not selected"
  );

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      first_name: user?.firstName,
      last_name: user?.lastName,
      phoneNumber: user?.primaryPhoneNumber?.phoneNumber,
      email: user?.primaryEmailAddress?.emailAddress,
      dob: user?.unsafeMetadata?.dob,
      gender: user?.unsafeMetadata?.gender as string,
      // address: user?.unsafeMetadata?.address,
    },
  });

    const createUser = useCallback(async (userPayload: any) => {
      const userResponse = await fetch(`${ApiUrl}/api/users/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userPayload),
      });
  
      const userResult = await userResponse.json();
      console.log("userResult", userResult);
  
      if (!userResponse.ok)
        throw new Error(userResult?.message || "user creation failed.");
  
      return userResult;
    }, []);

  const onSubmit = async (data: Partial<UserType>) => {
    try {
      const formattedDob = data.dob
        ? format(new Date(data.dob), "yyyy-MM-dd")
        : null;

      await user?.update({
        firstName: data.first_name ?? "",
        lastName: data.last_name ?? "",
        unsafeMetadata: {
          ...user?.unsafeMetadata,
          dob: formattedDob,
          gender: data.gender || user?.unsafeMetadata?.gender,
        },
      });

      await createUser({
        userId: user?.id,
        clerkId: user?.id,
        name: `${data?.first_name} ${data?.last_name}`,
        gender: data?.gender,
        phoneNumber: user?.phoneNumbers[0]?.phoneNumber,
        fcmToken: user?.unsafeMetadata?.fcmToken,
        dob: formattedDob,
      });

      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Profile update error:", error);
      toast.error("Profile update failed!");
    }
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
    <ScrollView
      showsVerticalScrollIndicator={false} // Optional: hides the scroll bar
      contentContainerStyle={{ paddingBottom: 20 }} // Ensures some padding at the bottom
    >
      <View className="p-4 bg-blue-50/10 h-full flex flex-col gap-4">
        {/* Profile Image */}
        <View className="flex justify-center w-full items-center">
          <View className="flex items-center relative size-48 ">
            <ProfileImage
              imageUrl={user?.imageUrl || ""}
              name={user?.fullName || ""}
              className="size-48"
            />

            <Button
              onPress={onPickImage}
              className="bg-blue-800 text-white p-0 rounded-full absolute bottom-0 right-2"
              size="icon"
            >
              <Edit size={16} color={"#fff"} />
            </Button>
          </View>
        </View>

        <View>
          <Label className="mb-2">{t("FirstName")}</Label>
          <Controller
            name="first_name"
            control={control}
            rules={{ required: t("First Name required") }}
            render={({ field: { onChange, value } }) => (
              <Input
                placeholder={t("First name")}
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
          <Label className="mb-2">{t("LastName")}</Label>
          <Controller
            name="last_name"
            control={control}
            rules={{ required: t("Last name required") }}
            render={({ field: { onChange, value } }) => (
              <Input
                placeholder={t("Last name")}
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
            <Text className="text-red-500">
              {errors.dob.message?.toString()}
            </Text>
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

        <Button className="mt-4" onPress={handleSubmit(onSubmit)}
        style={{ backgroundColor: "#8A00FA" }}>
          <Text className="text-white font-semibold">{t("Update")}</Text>
        </Button>
      </View>
    </ScrollView>
  );
}
