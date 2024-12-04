import React, { useState } from "react";
import { View } from "react-native";
import { Text } from "@/components/ui/Text";
import LangToggleButton from "@/components/custom/LangToggle";
import Logo from "@/components/custom/Logo";
import PhoneInputLoginForm from "@/features/auth/components/phone-input-login";
import VerifyOtpInputLoginForm from "@/features/auth/components/verify-opt-input";
import {
  LogDataType,
  NationalIdVerificationDataType,
  VerificationDataType,
} from "@/features/auth/types/auth.types";
import NationalIdVerificationInputLoginForm from "@/features/auth/components/national-id-verification";

export default function SignInPage() {
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
      otpResendTime: 60,
    });

  const [NationalIdVerificationData, setNationalIdVerificationData] =
    useState<NationalIdVerificationDataType>({
      isNationalIdSubmittedSuccess: false,
      nationalId: "",
    });

  return (
    <View className=" bg-background  w-full py-24">
      {/* Language Toggle */}
      <View className="absolute top-16 z-50 flex flex-row w-full justify-between">
        <LangToggleButton className="rounded-none rounded-r-full px-8 w-24" />
      </View>

      {/* Logo */}
      <View className="flex justify-center items-center w-screen">
        <Logo className="w-32 h-32" />
        {/* <Text className="font-noto-medium" >لمّا كان الاعتراف</Text>
        <Text className="font-notoArabic font-medium" style={{fontFamily:'NotoKufiArabic_500Medium'}} >لمّا كان الاعتراف</Text> */}
      </View>

      {/* Forms */}
      {!LogData.isSubmittedSuccess ? (
        <PhoneInputLoginForm LogData={LogData} setLogData={setLogData} />
      ) : !VerificationData.isVerified ? (
        <VerifyOtpInputLoginForm
          VerificationData={VerificationData}
          setVerificationData={setVerificationData}
          LogData={LogData}
          setLogData={setLogData}
        />
      ) : !NationalIdVerificationData.isNationalIdSubmittedSuccess ? (
        <NationalIdVerificationInputLoginForm
          LogData={LogData}
          setLogData={setLogData}
          NationalIdVerificationData={NationalIdVerificationData}
          setNationalIdVerificationData={setNationalIdVerificationData}
        />
      ) : (
        <Text>Logeed in</Text>
      )
    }
    </View>
  );
}
