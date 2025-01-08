import { View, Text, ActivityIndicator } from "react-native";
import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { LogDataType, VerificationDataType } from "../types/auth.types";
import { OtpInput } from "react-native-otp-entry";
import colors from "@/utils/colors";
import { apiBaseUrl } from "@/features/Home/constHome";
import { toast } from "sonner-native";
import { useDispatch, useSelector } from "react-redux";
import { login } from "@/store/user/user";

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
  const user = useSelector((state: any) => state.user);

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

    const payload = {
      phoneNumber: `${LogData.countryCode}${LogData.phoneNumber}`,
    };

    try {
      const response = await fetch(`${apiBaseUrl}/api/auth/send-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || "Failed to resend OTP");
      }

      toast.success("OTP resent successfully");
      console.log("OTP resend successful:", responseData);
    } catch (error) {
      toast.error("Error resending OTP");
      console.error("Error resending OTP:", error);
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
    const payload = {
      phoneNumber: `${LogData.countryCode}${LogData.phoneNumber}`,
      otp: data.otp,
      role: "user",
    };
    console.log(payload);

    try {
      const response = await fetch(`${apiBaseUrl}/api/auth/verify-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const responseData = await response.json();
      if (!response.ok) {
        toast.error(responseData.error);
        console.log(responseData.error);
      }
      if (response.ok) {
        toast.success("OTP verification successful:", responseData);
        console.log("OTP verification successful:", responseData);
        if (responseData.user.name === null) {
          const response2 = await fetch(
            `${apiBaseUrl}/api/profile/update-profile`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                phoneNumber: responseData.user.phoneNumber,
                name: `User-${responseData.user.phoneNumber.slice(
                  responseData.user.phoneNumber.length,
                  responseData.user.phoneNumber.length - 4
                )}`,
              }),
            }
          );

          const responseData2 = await response2.json();

          if (!response2.ok) {
            toast.error(responseData2.message);
          }

          if (responseData2.user.id) {
            dispatch(
              login({
                ...responseData2.user,
                role: "patient",
              })
            );
          }
        }
        dispatch(
          login({
            ...responseData.user,
            role: "patient",
          })
        );
        setVerificationData({
          ...VerificationData,
          isVerified: true,
        });
        onSuccess();
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
          Enter the verification code sent to the number {LogData.countryCode}{" "}
          {LogData.phoneNumber}
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
