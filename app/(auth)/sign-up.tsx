import { useSignUp, useUser } from "@clerk/clerk-expo";
import { Link, useRouter } from "expo-router";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import React, { useCallback, useEffect, useState } from "react";
// import messaging from "@react-native-firebase/messaging";
import { SafeAreaView } from "react-native-safe-area-context";
import LangToggleButton from "@/components/custom/LangToggle";
import Logo from "@/features/Home/Components/Logo";
import { Button } from "@/components/ui/Button";
import PhoneInput, { ICountry } from "react-native-international-phone-number";
import { useSelector } from "react-redux";
import { ArrowDown2 } from "iconsax-react-native";
import { removeSpaces } from "@/utils/string.utils";
import { PhoneCodeFactor, SignInFirstFactor } from "@clerk/types";
import { OtpInput } from "react-native-otp-entry";
import colors from "@/utils/colors";
import { toast } from "sonner-native";
import { ApiUrl } from "@/const";
import { useTranslation } from "react-i18next";

export default function Page() {
  const { signUp, setActive, isLoaded } = useSignUp();
  const { user } = useUser();
  const router = useRouter();
  const language = useSelector((state: any) => state.appState.language);
  const [phone, setPhone] = React.useState("");
  const [code, setCode] = React.useState("");
  const [selectedCountry, setSelectedCountry] = React.useState<null | ICountry>(
    null
  );
  const [fcmTokenFirebase, setfcmTokenFirebase] = useState("this is");
  const [verifying, setVerifying] = React.useState(false);
  const [timer, setTimer] = React.useState(60);
  const [isResendDisabled, setIsResendDisabled] = React.useState(true);
  const { t } = useTranslation();

  // Timer effect for resend functionality
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (verifying && timer > 0) {
      interval = setInterval(() => {
        setTimer((prevTimer) => {
          if (prevTimer <= 1) {
            setIsResendDisabled(false);
            return 0;
          }
          return prevTimer - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [verifying, timer]);

  // Format timer to MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // useEffect(() => {
  //   const getFcmToken = async () => {
  //     console.log("GET FCM STARTED");
  //     try {
  //       // Request user permission for notifications (iOS & Android 13+)
  //       const authStatus = await messaging().requestPermission();
  //       const enabled =
  //         authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
  //         authStatus === messaging.AuthorizationStatus.PROVISIONAL;
  //       if (enabled) {
  //         const fcmToken = await messaging().getToken();
  //         if (fcmToken) {
  //           console.log("FCM Token:", fcmToken);
  //           setfcmTokenFirebase(fcmToken);
  //           // You can send this token to your backend server here
  //         } else {
  //           console.log("FCM No token received");
  //         }
  //       } else {
  //         console.log("FCM Notification permission not granted");
  //       }
  //     } catch (error) {
  //       console.error("FCM Error getting FCM token:", error);
  //     }
  //   };
  //   console.log("FCM USE EFFECT");
  //   getFcmToken();
  //   // Optional: Listen for token refresh
  //   const unsubscribe = messaging().onTokenRefresh((token) => {
  //     console.log("New FCM Token:", token);
  //     // Send updated token to server
  //   });
  //   return unsubscribe;
  // }, []);

  // Handle the submission of the sign-up form
  const onSignUpPress = async () => {
    if (!isLoaded && !signUp) return null;

    try {
      const formattedPhone = removeSpaces(
        `${selectedCountry?.callingCode}${phone}`
      );
      await signUp.create({
        phoneNumber: formattedPhone,
        unsafeMetadata: {
          fcmToken: fcmTokenFirebase,
        },
      });

      await signUp.preparePhoneNumberVerification();
      toast.success(t("otpSentSuccess"));

      setVerifying(true);
      setTimer(60); // Reset timer
      setIsResendDisabled(true); // Disable resend button
    } catch (err: any) {
      // console.error("Error:", JSON.stringify(err, null, 2));
      toast.error(err.message || t("failedToSendOtp"));
    }
  };

  // Handle resend OTP
  const handleResendOtp = async () => {
    if (!isLoaded && !signUp) return null;

    try {
      await signUp.preparePhoneNumberVerification();
      setTimer(60); // Reset timer
      setIsResendDisabled(true); // Disable resend button
      setCode(""); // Clear current code
      toast.success(t("otpSentSuccessfully") || "OTP sent successfully");
    } catch (err: any) {
      toast.error(err.message || t("failedToSendOtp"));
      console.log(err.message);
    }
  };

  console.log("fcmTokenFirebase>>", fcmTokenFirebase);

  const handleVerification = async () => {
    if (!isLoaded && !signUp) return null;

    try {
      // Use the code provided by the user and attempt verification
      const signUpAttempt = await signUp.attemptPhoneNumberVerification({
        code,
      });

      if (signUpAttempt.status === "complete") {
        console.log("if signUpAttempt>>", signUpAttempt.status);
        await setActive({ session: signUpAttempt.createdSessionId });
        await user?.update({
          unsafeMetadata: {
            ...user?.unsafeMetadata,
            onboardingComplete: false,
          },
        });

        router.replace("/(auth)/onboarding");
      } else {
        // If the status is not complete, check why. User may need to
        // complete further steps.
        console.error(signUpAttempt);
      }
    } catch (err: any) {
      console.error("Error:", JSON.stringify(err, null, 2));
      toast.error(err.message || t("failedToVerifyOtp"));
    }
  };

  return (
    <SafeAreaView className="bg-blue-50/40 w-full">
      <View>
        <View className="absolute top-16 z-50 flex flex-row w-full justify-between">
          <LangToggleButton className="rounded-none rounded-r-full px-8 w-24" />
        </View>
        <View className="flex justify-center items-center w-screen">
          <Logo size={150} />
        </View>
        <View className="bg-background h-full pt-16 rounded-t-[50px] px-4 gap-6">
          <Text className="text-3xl font-medium text-center leading-10 text-neutral-700">
            {t("createAccount")}
          </Text>
          {!verifying ? (
            <>
              <PhoneInput
                value={phone}
                onChangePhoneNumber={(phone) => setPhone(phone)}
                selectedCountry={selectedCountry}
                onChangeSelectedCountry={setSelectedCountry}
                customCaret={
                  <ArrowDown2 variant="Bold" size="16" color="#000" />
                }
                phoneInputStyles={{
                  container: {
                    flexDirection: "row",
                  },
                  input: {
                    direction: "ltr",
                    writingDirection: "ltr",
                    // textAlign: 'left',
                    fontSize: 16,
                    color: "#000",
                  },
                }}
                language={language}
                defaultCountry="SA"
              />
              <Button
                onPress={onSignUpPress}
                className="rounded-xl py-3 px-4"
                style={{ backgroundColor: "#8A00FA" }}
              >
                <Text className="text-secondary font-semibold">
                  {t("continue")}
                </Text>
              </Button>
            </>
          ) : (
            <>
              <Text className="text-lg font-semibold">
                {t("enterVerificationCode")}
              </Text>
              <TouchableOpacity onPress={() => setVerifying(false)}>
                <Text className="text-blue-600 underline">
                  {t("verificationSentTo", { phone })}
                </Text>
              </TouchableOpacity>
              <OtpInput
                numberOfDigits={6}
                focusColor={colors.primary[500]}
                onTextChange={(code) => setCode(code)}
                theme={{
                  pinCodeContainerStyle: {
                    width: 60,
                    backgroundColor: "white",
                  },
                  pinCodeTextStyle: {
                    direction: "ltr",
                    writingDirection: "ltr",
                    textAlign: "left",
                    fontSize: 20,
                    color: "#000",
                  },
                  // Optional: to help see where RTL might still apply
                  containerStyle: {
                    flexDirection: "row",
                    direction: "ltr",
                  },
                }}
              />

              <Button
                onPress={handleVerification}
                className="rounded-xl py-3 px-4"
                style={{ backgroundColor: "#8A00FA" }}
              >
                <Text className="text-white font-semibold">
                  {t("verifyOtp")}
                </Text>
              </Button>

              {/* Resend OTP Section */}
              <View className="flex flex-row justify-center items-center gap-2">
                <Text className="text-neutral-600">
                  {t("didntReceiveCode") || "Didn't receive the code?"}
                </Text>
                <TouchableOpacity
                  onPress={handleResendOtp}
                  disabled={isResendDisabled}
                  className={`${isResendDisabled ? 'opacity-50' : ''}`}
                >
                  <Text className={`font-semibold ${
                    isResendDisabled 
                      ? 'text-neutral-400' 
                      : 'text-primary-500 underline'
                  }`}>
                    {isResendDisabled 
                      ? `${t("resendWithin") || "Resend within"} ${formatTime(timer)}`
                      : t("resend") || "Resend"
                    }
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          )}
          <View className="flex flex-row gap-2 mt-8">
            <Text>{t("alreadyHaveAccount")}</Text>
            <Link href="/sign-in">
              <Text className="text-primary-500">{t("signIn")}</Text>
            </Link>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}