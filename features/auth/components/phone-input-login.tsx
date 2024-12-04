import { View, Text, ActivityIndicator } from "react-native";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import PhoneInput, { ICountry } from "react-native-international-phone-number";
import { ArrowDown2 } from "iconsax-react-native";
import { Label } from "@/components/ui/Label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { AlertTriangle } from "lucide-react-native";
import { Switch } from "@/components/ui/Switch";
import { LogDataType } from "../types/auth.types";

type FormData = {
  phoneNumber: string;
  rememberMyDetails: boolean;
};

export default function PhoneInputLoginForm(props: {
  LogData: LogDataType;
  setLogData: React.Dispatch<React.SetStateAction<LogDataType>>;
}) {
  const { LogData, setLogData } = props;
  const [selectedCountry, setSelectedCountry] = useState<null | ICountry>(null);

  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      phoneNumber: LogData.phoneNumber,
      rememberMyDetails: LogData.rememberMyDetails,
    },
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    data.phoneNumber = `${data.phoneNumber}`;
    const finalData:LogDataType = {
      ...data,
      isSubmittedSuccess: true,
      countryCode: `${selectedCountry?.callingCode} `,
      country: `${selectedCountry?.cca2} `,
    };
    console.log("Form Data Submitted:", finalData);

    // Simulate an API call
    setTimeout(() => {
      setLoading(false);
      setLogData(finalData);
    }, 2000);
  };

  return (
    <View className="flex gap-4 justify-start items-start px-6 ">
      {/* Phone Number Input */}
      <View className="flex gap-2 w-full">
        <Text className="w-full text-left text-base font-semibold">
          Phone Number
        </Text>
        <Controller
          name="phoneNumber"
          control={control}
          rules={{
            required: "Phone number is required",
            validate: (value) =>
              value.length > 8 || "Phone number must be at least 8 digits",
          }}
          render={({ field: { onChange, value } }) => (
            <PhoneInput
              value={value}
              onChangePhoneNumber={onChange}
              selectedCountry={selectedCountry}
              onChangeSelectedCountry={setSelectedCountry}
              customCaret={<ArrowDown2 variant="Bold" size="18" color="#000" />}
              language="en"
              defaultCountry="SA"
            />
          )}
        />
        {errors.phoneNumber && (
          <Text className="text-red-500 text-sm mt-1">
            {errors.phoneNumber.message}
          </Text>
        )}
      </View>

      {/* Remember My Details */}
      <View className="flex-row items-center gap-2 w-full justify-between">
        <Controller
          name="rememberMyDetails"
          control={control}
          render={({ field: { value, onChange } }) => (
            <>
              <Label nativeID="rememberMyDetails">Remember My Details</Label>
              <Switch
                checked={value}
                onCheckedChange={onChange}
                nativeID="rememberMyDetails"
              />
            </>
          )}
        />
      </View>

      {/* Alert Message */}
      <Alert
        icon={AlertTriangle}
        variant="destructive"
        className="max-w-xl bg-orange-100 border-orange-300"
      >
        <AlertTitle>If you wish to apply for tax exemption,</AlertTitle>
        <AlertDescription>register your ID number.</AlertDescription>
      </Alert>

      {/* Submit Button */}
      <Button
        onPress={handleSubmit(onSubmit)}
        disabled={loading}
        className={`mt-6 w-full ${
          loading ? "bg-gray-400" : "bg-green-600"
        } text-white py-3 rounded-md`}
      >
        <Text>
          {loading ? <ActivityIndicator color="#fff" /> : "Sign in / Log in"}
        </Text>
      </Button>
    </View>
  );
}
