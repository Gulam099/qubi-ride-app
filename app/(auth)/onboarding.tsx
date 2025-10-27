import React, { useCallback, useState } from "react";
import { View, Platform, ScrollView } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { Input } from "@/components/ui/Input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/RadioGroup";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import { toast } from "sonner-native";
import { format } from "date-fns";
import { Text } from "@/components/ui/Text";
import ProfileImage from "@/features/account/components/ProfileImage";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { Edit } from "iconsax-react-native";

type RegisterFormData = {
  first_name: string;
  last_name: string;
  phoneNumber: string;
  email: string;
  gender: string;
  dateOfBirth?: string;
  profileImage?: string;
};

const RegisterForm = () => {
  const router = useRouter();

  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [profileImage, setProfileImage] = useState<string>("");

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<RegisterFormData>({
    defaultValues: {
      first_name: "",
      last_name: "",
      phoneNumber: "",
      email: "",
      gender: "",
      dateOfBirth: "",
      profileImage: "",
    },
  });

  const createUser = useCallback(async (userPayload: RegisterFormData) => {
    const response = await fetch(
      `${process.env.EXPO_PUBLIC_API_URL}/api/users/create`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userPayload),
      }
    );

    const result = await response.json();
    if (!response.ok) throw new Error(result?.message || "User creation failed.");
    return result;
  }, []);

  const onSubmit = async (data: RegisterFormData) => {
    try {
      const payload = {
        ...data,
        dateOfBirth: selectedDate ? format(selectedDate, "yyyy-MM-dd") : "",
        profileImage,
      };

      await createUser(payload);

      toast.success("Registration completed successfully!");
      router.replace({
        pathname: "/",
        params: { refresh: Date.now().toString() },
      });
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("Registration failed!");
    }
  };

  const onPickImage = async () => {
    try {
      const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!granted) {
        toast.error("Permission to access media library is required.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 4],
        quality: 0.5,
        base64: true,
      });

      if (!result.canceled && result.assets[0].base64) {
        const base64 = result.assets[0].base64;
        const image = `data:image/jpeg;base64,${base64}`;
        setProfileImage(image);
        setValue("profileImage", image);
        toast.success("Profile image selected!");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to select image");
    }
  };

  const showDatePicker = () => setDatePickerVisible(true);

  const handleDateChange = (_: any, selected?: Date) => {
    setDatePickerVisible(Platform.OS === "ios");
    if (selected) {
      setSelectedDate(selected);
      setValue("dateOfBirth", format(selected, "yyyy-MM-dd"));
    }
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
      <View className="p-4 bg-blue-50/10 flex flex-col gap-4">
        <View className="flex justify-center w-full items-center">
          <View className="flex items-center relative size-48">
            <ProfileImage
              imageUrl={profileImage}
              name={""}
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
          <Label className="mb-2">First Name</Label>
          <Controller
            name="first_name"
            control={control}
            rules={{ required: "First Name is required" }}
            render={({ field: { onChange, value } }) => (
              <Input placeholder="First Name" value={value} onChangeText={onChange} />
            )}
          />
          {errors.first_name && <Text className="text-red-500 text-sm">{errors.first_name.message}</Text>}
        </View>

        <View>
          <Label className="mb-2">Last Name</Label>
          <Controller
            name="last_name"
            control={control}
            rules={{ required: "Last Name is required" }}
            render={({ field: { onChange, value } }) => (
              <Input placeholder="Last Name" value={value} onChangeText={onChange} />
            )}
          />
          {errors.last_name && <Text className="text-red-500 text-sm">{errors.last_name.message}</Text>}
        </View>

        <View>
          <Label className="mb-2">Phone Number</Label>
          <Controller
            name="phoneNumber"
            control={control}
            rules={{ required: "Phone Number is required" }}
            render={({ field: { onChange, value } }) => (
              <Input
                placeholder="Phone Number"
                keyboardType="phone-pad"
                value={value}
                onChangeText={onChange}
              />
            )}
          />
          {errors.phoneNumber && <Text className="text-red-500 text-sm">{errors.phoneNumber.message}</Text>}
        </View>

        <View>
          <Label className="mb-2">Email</Label>
          <Controller
            name="email"
            control={control}
            rules={{
              required: "Email is required",
              pattern: { value: /\S+@\S+\.\S+/, message: "Invalid email format" },
            }}
            render={({ field: { onChange, value } }) => (
              <Input
                placeholder="Email"
                value={value}
                onChangeText={onChange}
                keyboardType="email-address"
              />
            )}
          />
          {errors.email && <Text className="text-red-500 text-sm">{errors.email.message}</Text>}
        </View>

        <View>
          <Label className="mb-2">Gender</Label>
          <Controller
            name="gender"
            control={control}
            rules={{ required: "Gender is required" }}
            render={({ field: { onChange, value } }) => (
              <RadioGroup value={value} onValueChange={onChange} className="gap-3 flex-row">
                <View className="flex-row items-center gap-2">
                  <RadioGroupItem value="Male" onPress={() => onChange("Male")} />
                  <Label>Male</Label>
                </View>
                <View className="flex-row items-center gap-2">
                  <RadioGroupItem value="Female" onPress={() => onChange("Female")} />
                  <Label>Female</Label>
                </View>
              </RadioGroup>
            )}
          />
          {errors.gender && <Text className="text-red-500 text-sm">{errors.gender.message}</Text>}
        </View>

        <View>
          <Label className="mb-2">Date of Birth</Label>
          <Button variant="outline" onPress={showDatePicker}>
            {selectedDate ? format(selectedDate, "dd MMM yyyy") : "Select Date"}
          </Button>
          {datePickerVisible && (
            <DateTimePicker
              value={selectedDate || new Date()}
              mode="date"
              display="default"
              onChange={handleDateChange}
            />
          )}
        </View>

        <Button className="mt-6 bg-blue-600" onPress={handleSubmit(onSubmit)}>
          <Text className="text-white font-semibold">Register</Text>
        </Button>
      </View>
    </ScrollView>
  );
};

export default RegisterForm;
