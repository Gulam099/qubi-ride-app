import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { Text } from "@/components/ui/Text";
import LangToggleButton from "@/components/custom/LangToggle";
import Logo from "@/features/Home/Components/Logo";
import PhoneInputLoginForm from "@/features/auth/components/phone-input-login";
import VerifyOtpInputLoginForm from "@/features/auth/components/verify-opt-input";
import {
  LogDataType,
  NationalIdVerificationDataType,
  VerificationDataType,
} from "@/features/auth/types/auth.types";
import NationalIdVerificationInputLoginForm from "@/features/auth/components/national-id-verification";
import { useDispatch, useSelector } from "react-redux";
import { Link, Redirect } from "expo-router";
import { login } from "@/store/user/user";

export default function SignInPage() {
  const dispatch = useDispatch();
  const user = useSelector((state: any) => state.user);

  const [currentStep, setCurrentStep] = useState<number>(0);

  const [LogData, setLogData] = useState<LogDataType>({
    country: "",
    countryCode: "",
    phoneNumber: "",
    rememberMyDetails: false,
    isSubmittedSuccess: false,
  });

  const [VerificationData, setVerificationData] =
    useState<VerificationDataType>({
      isVerified: false,
      otp: "",
      otpLength: 4,
      otpResendTime: 30,
      otpExpiryTime: 30000,
    });

  const [NationalIdVerificationData, setNationalIdVerificationData] =
    useState<NationalIdVerificationDataType>({
      isNationalIdSubmittedSuccess: false,
      nationalId: "",
    });

  useEffect(() => {
    if (
      LogData.isSubmittedSuccess &&
      VerificationData.isVerified &&
      NationalIdVerificationData.isNationalIdSubmittedSuccess
    ) {
      dispatch(
        login({
          nationalId: NationalIdVerificationData.nationalId,
          isAuthenticated: true,
        })
      );
    }
  }, [LogData, VerificationData, NationalIdVerificationData]);

  if (user.isAuthenticated) {
    return <Redirect href="/" />;
  }

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <PhoneInputLoginForm
            LogData={LogData}
            setLogData={setLogData}
            onSuccess={() => setCurrentStep(1)}
          />
        );
      case 1:
        return (
          <VerifyOtpInputLoginForm
            VerificationData={VerificationData}
            setVerificationData={setVerificationData}
            LogData={LogData}
            setLogData={setLogData}
            onSuccess={() => setCurrentStep(2)}
          />
        );
      case 2:
        return (
          <NationalIdVerificationInputLoginForm
            LogData={LogData}
            setLogData={setLogData}
            NationalIdVerificationData={NationalIdVerificationData}
            setNationalIdVerificationData={setNationalIdVerificationData}
          />
        );
      default:
        return <Text>Logged in</Text>;
    }
  };

  return (
    <View className="bg-blue-50/40 w-full py-24">
      {/* Language Toggle */}
      <View className="absolute top-16 z-50 flex flex-row w-full justify-between">
        <LangToggleButton className="rounded-none rounded-r-full px-8 w-24" />
      </View>

      {/* Logo */}
      <View className="flex justify-center items-center w-screen">
        <Logo size={150} />
      </View>

      {/* <Link href={"/(Routes)/(patient)/help"}>HElp</Link> */}

      <View className="bg-background h-full pt-12 rounded-t-[50px]">
        {/* Render Current Step */}
        {renderStep()}
      </View>
    </View>
  );
}
