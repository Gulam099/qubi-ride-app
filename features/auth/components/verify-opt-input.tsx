import { View, Text, ActivityIndicator } from "react-native";
import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { LogDataType, VerificationDataType } from "../types/auth.types";
import { OtpInput } from "react-native-otp-entry";
import colors from "@/utils/colors";

type FormData = {
  otp: string;
};

export default function VerifyOtpInputLoginForm(props: {
  VerificationData: VerificationDataType;
  setVerificationData: React.Dispatch<
    React.SetStateAction<VerificationDataType>
  >;
  LogData: LogDataType;
  setLogData: React.Dispatch<React.SetStateAction<LogDataType>>;
}) {
  const { VerificationData, setVerificationData, LogData, setLogData } = props;
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState<number>(VerificationData.otpResendTime);
  const [isDisabled, setIsDisabled] = useState<boolean>(true);

  useEffect(() => {
    if (timer > 0) {
      const countdown = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(countdown); // Cleanup on unmount
    } else {
      setIsDisabled(false); // Enable the button when the timer reaches 0
    }
  }, [timer]);

  const handleResendOtp = () => {
    setTimer(VerificationData.otpResendTime); // Reset timer to 30 seconds
    setIsDisabled(true); // Disable button again
    // Call your OTP resend function here
    console.log("OTP resend called");
  };

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      otp: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    console.log("Form Data Submitted:", data);

    // Simulate an API call
    setTimeout(() => {
      setLoading(false);
      setVerificationData({
        ...data,
        isVerified: true,
        otpLength: VerificationData.otpLength,
        otpResendTime: VerificationData.otpResendTime,
      });
    }, 2000);
  };

  return (
    <View className="flex gap-4 justify-start items-start px-6 ">
      {/* Phone Number Input */}
      <View className="flex gap-2 w-full">
        <Text className="w-full text-left text-lg font-semibold">
          Enter Verification Code
        </Text>
        <View className="flex flex-row gap-6  w-full ">
          <Text className="text-wrap flex-1">
            Enter the verification code sent to the number {LogData.countryCode} {LogData.phoneNumber}
          </Text>
          <Button
            onPress={() => {
              setLogData({
                phoneNumber: "",
                isSubmittedSuccess: false,
                rememberMyDetails: LogData.rememberMyDetails,
                country: "",
                countryCode: "",
              });
              console.log("Resend OTP");
            }}
            variant={"link"}
          >
            <Text>Edit</Text>
          </Button>
        </View>
        <Controller
          name="otp"
          control={control}
          rules={{
            required: "Otp is required",
            validate: (value) =>
              value.length >= VerificationData.otpLength ||
              `Otp must be at least ${VerificationData.otpLength} digits`,
          }}
          render={({ field: { onChange, value } }) => (
            <OtpInput
              numberOfDigits={VerificationData.otpLength}
              focusColor={colors.primary[500]}
              focusStickBlinkingDuration={500}
              onTextChange={onChange}
              onFilled={() => handleSubmit(onSubmit)}
              textInputProps={{
                accessibilityLabel: "One-Time Password",
              }}
            />
          )}
        />
        {errors.otp && (
          <Text className="text-red-500 text-sm mt-1">
            {errors.otp.message}
          </Text>
        )}
      </View>

      <Button
        variant={"outline"}
        disabled={isDisabled}
        onPress={handleResendOtp}
      >
        {isDisabled ? (
          <Text>{`Resend in ${timer}s`}</Text>
        ) : (
          <Text>Resend OTP</Text>
        )}
      </Button>

      {/* Submit Button */}
      <Button
        onPress={handleSubmit(onSubmit)}
        disabled={loading}
        className={`mt-6 w-full ${
          loading ? "bg-gray-400" : "bg-primary-600"
        } text-white py-3 rounded-md`}
      >
        <Text className="text-white font-semibold">
          {loading ? <ActivityIndicator color="#000" /> : "Submit"}
        </Text>
      </Button>
    </View>
  );
}
