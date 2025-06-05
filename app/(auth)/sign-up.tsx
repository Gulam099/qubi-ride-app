import { useSignUp, useUser } from "@clerk/clerk-expo";
import { Link, useRouter } from "expo-router";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import messaging from "@react-native-firebase/messaging";
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
  const [fcmTokenFirebase, setfcmTokenFirebase] = useState("");
  const [verifying, setVerifying] = React.useState(false);

  useEffect(() => {
    const getFcmToken = async () => {
      console.log("GET FCM STARTED");
      try {
        // Request user permission for notifications (iOS & Android 13+)
        const authStatus = await messaging().requestPermission();
        const enabled =
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL;
        if (enabled) {
          const fcmToken = await messaging().getToken();
          if (fcmToken) {
            console.log("FCM Token:", fcmToken);
            setfcmTokenFirebase(fcmToken);
            // You can send this token to your backend server here
          } else {
            console.log("FCM No token received");
          }
        } else {
          console.log("FCM Notification permission not granted");
        }
      } catch (error) {
        console.error("FCM Error getting FCM token:", error);
      }
    };
    console.log("FCM USE EFFECT");
    getFcmToken();
    // Optional: Listen for token refresh
    const unsubscribe = messaging().onTokenRefresh((token) => {
      console.log("New FCM Token:", token);
      // Send updated token to server
    });
    return unsubscribe;
  }, []);

  // Handle the submission of the sign-in form
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
      toast.success("OTP sent successfully");

      setVerifying(true);
    } catch (err: any) {
      // console.error("Error:", JSON.stringify(err, null, 2));
      toast.error(err.message || "Failed to send OTP");
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
      toast.error(err.message || "Failed to verify OTP");
    }
  };

  return (
    <SafeAreaView>
      <View className="bg-blue-50/40 w-full py-24">
        <View className="absolute top-16 z-50 flex flex-row w-full justify-between">
          <LangToggleButton className="rounded-none rounded-r-full px-8 w-24" />
        </View>
        <View className="flex justify-center items-center w-screen">
          <Logo size={150} />
        </View>
        <View className="bg-background h-full pt-16 rounded-t-[50px] px-4 gap-6">
          <Text className="text-3xl font-medium text-center leading-10 text-neutral-700">
            Create account
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
                language={language}
                defaultCountry="SA"
              />
              <Button onPress={onSignUpPress}>
                <Text className="text-secondary font-semibold">Continue</Text>
              </Button>
            </>
          ) : (
            <>
              <Text className="text-lg font-semibold">
                Enter Verification Code
              </Text>
              <TouchableOpacity onPress={() => setVerifying(false)}>
                <Text className="text-blue-600 underline">
                  Verification code sent to {phone}
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
                }}
              />

              <Button onPress={handleVerification}>
                <Text className="text-secondary font-semibold">Verify OTP</Text>
              </Button>
              {/* <Button
            variant="outline"
            disabled={isDisabled}
            onPress={handleResendOtp}
          >
            <Text>{isDisabled ? `Resend in ${timer}s` : "Resend OTP"}</Text>
          </Button> */}
            </>
          )}
          <View className="flex flex-row gap-2 mt-8">
            <Text>Already have an account?</Text>
            <Link href="/sign-in">
              <Text className="text-primary-500">Sign in</Text>
            </Link>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
