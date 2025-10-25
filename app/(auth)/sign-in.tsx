import { Link, useRouter } from "expo-router";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Logo from "@/features/Home/Components/Logo";
import { Button } from "@/components/ui/Button";
import { toast } from "sonner-native";
import { useTranslation } from "react-i18next";
import { apiNewUrl } from "@/const";

export default function Page() {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [verifying, setVerifying] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const { t } = useTranslation();

  // Handle the submission of the sign-in form
  const onSignInPress = async () => {
    if (!email.trim()) {
      toast.error(t("emailRequired") || "Email is required");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error(t("invalidEmail") || "Please enter a valid email");
      return;
    }

    setVerifying(true);
  };

  const handleVerification = async () => {
    if (!password.trim()) {
      toast.error(t("passwordRequired") || "Password is required");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${apiNewUrl}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.toLowerCase().trim(),
          password: password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store JWT token and user data
        await AsyncStorage.setItem("jwt_token", data.token);
        await AsyncStorage.setItem("user_data", JSON.stringify(data.user));

        toast.success("Login successful!");
        router.replace("/");
      } else {
        // Handle different error scenarios
        if (response.status === 401) {
          toast.error("Invalid email or password");
        } else if (response.status === 404) {
          toast.error("User not found");
        } else if (response.status === 403) {
          toast.error("Account disabled");
        } else {
          toast.error(data.message || "Login failed");
        }
      }
    } catch (error: any) {
      console.error("Login error:", error);
      if (error.name === "TypeError" && error.message.includes("Network")) {
        toast.error("Network connection error");
      } else {
        toast.error("Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="bg-blue-50/40 w-full py-10">
      <View>
        <View className="flex justify-center items-center w-screen">
          <Logo size={130} />
        </View>
        <View className="bg-background h-full pt-16 rounded-t-[50px] px-4 gap-6">
          <Text className="text-3xl font-medium text-center leading-10 text-neutral-700">
            {t("welcomeBack")}
          </Text>
          {!verifying ? (
            <>
              <TextInput
                value={email}
                onChangeText={(text) => setEmail(text)}
                placeholder="Enter your Email"
                keyboardType="email-address"
                placeholderTextColor="#555"
                autoCapitalize="none"
                autoComplete="email"
                className="border border-gray-300 rounded-xl px-4 py-3 text-base"
                style={{
                  fontSize: 16,
                  color: "#000",
                  textAlign: "left",
                  direction: "ltr",
                  writingDirection: "ltr",
                }}
              />
              <Button
                onPress={onSignInPress}
                className="rounded-xl py-3 px-4"
                style={{ backgroundColor: "#000F8F" }}
                disabled={loading}
              >
                <Text className="text-secondary font-semibold">
                  {t("continue")}
                </Text>
              </Button>
            </>
          ) : (
            <>
              <TouchableOpacity onPress={() => setVerifying(false)}>
                <Text className="text-blue-600 underline">
                  {`Signing in as ${email}`}
                </Text>
              </TouchableOpacity>
              <TextInput
                value={password}
                onChangeText={(text) => setPassword(text)}
                placeholder="Enter your password"
                placeholderTextColor="#555"
                secureTextEntry
                autoCapitalize="none"
                autoComplete="password"
                className="border border-gray-300 rounded-xl px-4 py-3 text-base"
                style={{
                  fontSize: 16,
                  color: "#000",
                  textAlign: "left",
                  direction: "ltr",
                  writingDirection: "ltr",
                }}
              />

              <Button
                onPress={handleVerification}
                className="rounded-xl py-3 px-4"
                style={{ backgroundColor: "#000F8F" }}
                disabled={loading}
              >
                <Text className="text-secondary font-semibold">
                  {loading
                    ? t("signingIn") || "Signing In..."
                    : t("signIn") || "Sign In"}
                </Text>
              </Button>

              {/* Optional: Forgot Password Link */}
              <TouchableOpacity onPress={() => router.push("/forgot-password")}>
                <Text className="text-blue-600 text-center underline">
                  {t("forgotPassword") || "Forgot Password?"}
                </Text>
              </TouchableOpacity>
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
