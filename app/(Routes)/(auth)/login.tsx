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
  RoleType,
  VerificationDataType,
} from "@/features/auth/types/auth.types";
import NationalIdVerificationInputLoginForm from "@/features/auth/components/national-id-verification";
import UserRoleSelector from "@/features/auth/components/user-role-selector";
import { useDispatch, useSelector } from "react-redux";
import { Redirect } from "expo-router";
import { login, logout, updateUser } from "@/store/user/user";

export default function SignInPage() {
  const dispatch = useDispatch();
  const user = useSelector((state: any) => state.user);
  const [RoleData, setRoleData] = useState<RoleType>("default");
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

  useEffect(() => {
    if (
      RoleData != "default" &&
      LogData.isSubmittedSuccess &&
      VerificationData.isVerified &&
      NationalIdVerificationData.isNationalIdSubmittedSuccess
    ) {
      dispatch(
        login({
          country: LogData.country,
          phoneNumber: LogData.phoneNumber,
          firstName: LogData.phoneNumber,
          lastName: "",
          role: RoleData,
          nationalId: NationalIdVerificationData.nationalId,
          isAuthenticated: true,
        })
      );
    }
  }, [RoleData, LogData, VerificationData, NationalIdVerificationData]);

  if (user.isAuthenticated) {
    return <Redirect href="/" />;
  }

  return (
    <View className=" bg-background  w-full py-24">
      {/* Language Toggle */}
      <View className="absolute top-16 z-50 flex flex-row w-full justify-between">
        <LangToggleButton className="rounded-none rounded-r-full px-8 w-24" />
      </View>

      {/* Logo */}
      <View className="flex justify-center items-center w-screen">
        <Logo size={150} />
        {/* <Text className="font-noto-medium" >لمّا كان الاعتراف</Text>
        <Text className="font-notoArabic font-medium" style={{fontFamily:'NotoKufiArabic_500Medium'}} >لمّا كان الاعتراف</Text> */}
      </View>

      {/* Forms */}
      {RoleData === "default" ? (
        <UserRoleSelector RoleData={RoleData} setRoleData={setRoleData} />
      ) : !LogData.isSubmittedSuccess ? (
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
        <Text>Logged in</Text>
      )}
    </View>
  );
}
