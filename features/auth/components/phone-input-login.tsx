import { View, Text, ActivityIndicator } from "react-native";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import PhoneInput, { ICountry } from "react-native-international-phone-number";
import { ArrowDown2 } from "iconsax-react-native";
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/Button";
import { Switch } from "@/components/ui/Switch";
import { LogDataType } from "../types/auth.types";
import WarningToast from "@/features/Home/Components/warning";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";

type FormData = {
  phoneNumber: string;
  rememberMyDetails: boolean;
};

export default function PhoneInputLoginForm(props: {
  LogData: LogDataType;
  setLogData: React.Dispatch<React.SetStateAction<LogDataType>>;
}) {
  const { t } = useTranslation();
  const language = useSelector((state: any) => state.appState.language);
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
    const payload = {
      phoneNumber: `${selectedCountry?.callingCode}${data.phoneNumber}`,
    };

    try {
      const response = await fetch(
        "https://monkfish-app-6ahnd.ondigitalocean.app/api/auth/send-otp",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error(`Request failed with status code ${response.status}`);
      }

      const responseData = await response.json();
      console.log("OTP sent successfully:", responseData);

      const finalData: LogDataType = {
        ...data,
        isSubmittedSuccess: true,
        countryCode: `${selectedCountry?.callingCode}`,
        country: `${selectedCountry?.cca2}`,
      };
      setLogData(finalData);
    } catch (error) {
      console.error("Error sending OTP:", error);
    } finally {
      setLoading(false);
    }
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
              language={language}
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

      <WarningToast
        heading={"If you wish to apply for tax exemption,"}
        description={"register your ID number."}
      />

      {/* Submit Button */}
      <Button
        onPress={handleSubmit(onSubmit)}
        disabled={loading}
        className={`mt-6 w-full py-3 rounded-md ${
          loading ? "bg-gray-400" : "bg-primary-600"
        } `}
      >
        <Text className="text-white font-semibold">
          {loading ? <ActivityIndicator color="#fff" /> : t("Sign in / Log in")}
        </Text>
      </Button>
    </View>
  );
}
