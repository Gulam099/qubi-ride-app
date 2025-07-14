import { useSignIn } from "@clerk/clerk-expo";
import { Link, useRouter } from "expo-router";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import React from "react";
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
import { useTranslation } from "react-i18next";

export default function Page() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();
  const language = useSelector((state: any) => state.appState.language);
  const [phone, setPhone] = React.useState("");
  const [code, setCode] = React.useState("");
  const [selectedCountry, setSelectedCountry] = React.useState<null | ICountry>(
    null
  );
  const [verifying, setVerifying] = React.useState(false);
  const { t } = useTranslation();

  // Handle the submission of the sign-in form
  const onSignInPress = async () => {
    if (!isLoaded && !signIn) return null;

    try {
      const formattedPhone = removeSpaces(
        `${selectedCountry?.callingCode}${phone}`
      );
      const { supportedFirstFactors } = await signIn.create({
        identifier: formattedPhone,
      });

      const isPhoneCodeFactor = (
        factor: SignInFirstFactor
      ): factor is PhoneCodeFactor => {
        return factor.strategy === "phone_code";
      };
      const phoneCodeFactor = supportedFirstFactors?.find(isPhoneCodeFactor);

      if (phoneCodeFactor) {
        const { phoneNumberId } = phoneCodeFactor;
        await signIn.prepareFirstFactor({
          strategy: "phone_code",
          phoneNumberId,
        });
        setVerifying(true);
      }
    } catch (err: any) {
      // console.error("Error:", JSON.stringify(err, null, 2));
      toast.error(err.message || t("failedToSendOtp"));
      console.log(err.message);
    }
  };

  const handleVerification = async () => {
    if (!isLoaded && !signIn) return null;

    try {
      // Use the code provided by the user and attempt verification
      const signInAttempt = await signIn.attemptFirstFactor({
        strategy: "phone_code",
        code,
      });
      if (signInAttempt.status === "complete") {
        await setActive({ session: signInAttempt.createdSessionId });

        router.replace("/");
      } else {
        console.error(signInAttempt);
      }
    } catch (err: any) {
      console.error("Error:", JSON.stringify(err, null, 2));
      toast.error(err.message || t("failedToVerifyOtp"));
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
            {t("welcomeBack")}
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
                onPress={onSignInPress}
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
                <Text className="text-secondary font-semibold">
                  {t("verifyOtp")}
                </Text>
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
            <Text>{t("dontHaveAccount")}</Text>
            <Link href="/sign-up">
              <Text className="text-primary-500">{t("signUp")}</Text>
            </Link>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
