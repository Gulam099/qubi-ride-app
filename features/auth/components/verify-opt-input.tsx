import { View, Text, ActivityIndicator } from "react-native";
import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { LogDataType, VerificationDataType } from "../types/auth.types";
import { OtpInput } from "react-native-otp-entry";
import colors from "@/utils/colors";
import { toast } from "sonner-native";
import { useDispatch } from "react-redux";
import { login } from "@/store/user/user";
import { sendOtp, verifyOtp } from "../utils/otpUtils";
import { updateUser } from "@/features/user/utils/userUtils";

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
  onSuccess: () => void;
}) {
  const {
    VerificationData,
    setVerificationData,
    LogData,
    setLogData,
    onSuccess,
  } = props;
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState<number>(VerificationData.otpResendTime);
  const [isDisabled, setIsDisabled] = useState<boolean>(true);

  const dispatch = useDispatch();

  useEffect(() => {
    if (timer > 0) {
      const countdown = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(countdown);
    } else {
      setIsDisabled(false);
    }
  }, [timer]);

  const handleResendOtp = async () => {
    setTimer(VerificationData.otpResendTime);
    setIsDisabled(true);

    try {
      const result = await sendOtp(`${LogData.phoneNumber}`);
      if (result.success) {
        toast.success("OTP resent successfully");
      } else {
        toast.error(result.message || "Failed to resend OTP");
      }
    } catch (error) {
      toast.error("Error resending OTP");
    }
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
    try {
      const result = await verifyOtp({
        phoneNumber: `${LogData.phoneNumber}`,
        otp: data.otp,
        role: "user",
      });

      if (result.success) {
        const userData = result.data;

        // Log the user in
        dispatch(login(userData));

        setVerificationData({
          ...VerificationData,
          isVerified: true,
        });

        onSuccess();
      } else {
        toast.error(result.message || "OTP verification failed");
      }
    } catch (error) {
      toast.error("Error verifying OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex gap-4 justify-start items-start px-6 ">
      <View className="flex gap-2 w-full">
        <Text className="w-full text-left text-lg font-semibold">
          Enter Verification Code
        </Text>
        <Text className="text-wrap flex-1">
          Enter the verification code sent to the number {LogData.phoneNumber}
        </Text>
        <Controller
          name="otp"
          control={control}
          rules={{
            required: "OTP is required",
            validate: (value) =>
              value.length >= VerificationData.otpLength ||
              `OTP must be at least ${VerificationData.otpLength} digits`,
          }}
          render={({ field: { onChange, value } }) => (
            <OtpInput
              numberOfDigits={VerificationData.otpLength}
              focusColor={colors.primary[500]}
              onTextChange={onChange}
              theme={{
                containerStyle: {},
                inputsContainerStyle: {
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "center",
                  gap: "10px",
                },
                pinCodeContainerStyle: {
                  aspectRatio: 1 / 1,
                  width: 60,
                  marginHorizontal: 10,
                  backgroundColor: "white",
                },
                pinCodeTextStyle: {
                  fontSize: 40,
                },
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

      <Button variant="outline" disabled={isDisabled} onPress={handleResendOtp}>
        {isDisabled ? (
          <Text>{`Resend in ${timer}s`}</Text>
        ) : (
          <Text>Resend OTP</Text>
        )}
      </Button>

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
