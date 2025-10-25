import { Link, useRouter } from "expo-router";
import {
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
  Platform,
} from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import messaging from "@react-native-firebase/messaging";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";
import { useForm, Controller } from "react-hook-form";
import LangToggleButton from "@/components/custom/LangToggle";
import Logo from "@/features/Home/Components/Logo";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/RadioGroup";
import { Label } from "@/components/ui/Label";
import { useSelector } from "react-redux";
import { toast } from "sonner-native";
import { ApiUrl } from "@/const";
import { useTranslation } from "react-i18next";

export default function CombinedRegistrationPage() {
  const router = useRouter();
  const language = useSelector((state: any) => state.appState.language);
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // FCM Token state
  // const [fcmTokenFirebase, setfcmTokenFirebase] = useState("");

  // Loading states
  const [loading, setLoading] = useState(false);

  // Form control
  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      username: "",
      contact: "",
      age: "",
      gender: "",
    },
  });

  const watchedPassword = watch("password");

  // FCM Token setup
  // useEffect(() => {
  //   const getFcmToken = async () => {
  //     console.log("GET FCM STARTED");
  //     try {
  //       const authStatus = await messaging().requestPermission();
  //       const enabled =
  //         authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
  //         authStatus === messaging.AuthorizationStatus.PROVISIONAL;
  //       if (enabled) {
  //         const fcmToken = await messaging().getToken();
  //         if (fcmToken) {
  //           console.log("FCM Token:", fcmToken);
  //           setfcmTokenFirebase(fcmToken);
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

  //   getFcmToken();

  //   const unsubscribe = messaging().onTokenRefresh((token) => {
  //     console.log("New FCM Token:", token);
  //     setfcmTokenFirebase(token);
  //   });

  //   return unsubscribe;
  // }, []);

  // Combined registration submission
  const onSubmit = async (data: any) => {
    // Validation
    if (!data.email.trim()) {
      toast.error(t("emailRequired") || "Email is required");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      toast.error("Please enter a valid email");
      return;
    }

    if (!data.password.trim()) {
      toast.error("Password is required");
      return;
    }

    if (!data.confirmPassword.trim()) {
      toast.error("Please confirm your password");
      return;
    }

    if (data.password !== data.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (data.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    if (!data.username.trim()) {
      toast.error("Name is required");
      return;
    }

    if (!data.contact.trim()) {
      toast.error("Contact number is required");
      return;
    }

    setLoading(true);

    try {
      // Combined registration payload
      const registrationPayload = {
        email: data.email.toLowerCase().trim(),
        password: data.password,
        contact: data.contact,
        username: data.username,
        age: data.age,
        gender: data.gender,
      };

      console.log("Registration payload:", registrationPayload);

      // Single API call to create user with all data
      const response = await fetch(`${ApiUrl}/api/users/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(registrationPayload),
      });

      const result = await response.json();

      if (response.ok) {
        // Store JWT token and user data
        await AsyncStorage.setItem("jwt_token", result.token);
        await AsyncStorage.setItem("user_data", JSON.stringify(result.user));

        toast.success("Account created successfully!");
        router.replace("/(tabs)");
      } else {
        // Handle different error scenarios
        if (response.status === 409) {
          toast.error("Email already exists");
        } else if (response.status === 400) {
          toast.error(result.message || "Invalid data provided");
        } else {
          toast.error(result.message || "Registration failed");
        }
      }
    } catch (error: any) {
      console.error("Registration error:", error);
      if (error.username === "TypeError" && error.message.includes("Network")) {
        toast.error("Network connection error");
      } else {
        toast.error("Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="bg-blue-50/40 w-full flex-1">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View>
          <View className="flex justify-center items-center w-screen">
            <Logo size={150} />
          </View>

          <View className="bg-background min-h-screen pt-8 rounded-t-[50px] px-4 gap-4">
            <Text className="text-3xl font-medium text-center leading-10 text-neutral-700 mb-4">
              {t("createAccount") || "Create Account"}
            </Text>

            {/* Personal Information */}
            <View className="gap-4">
              {/* First Name */}
              <View>
                <Label className="mb-2">{"Full Name"}</Label>
                <Controller
                  name="username"
                  control={control}
                  rules={{
                    required: "Name is required",
                  }}
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      value={value}
                      onChangeText={onChange}
                      placeholder={"Enter your Name"}
                      placeholderTextColor="#555"
                      autoCapitalize="words"
                      autoComplete="username"
                      className="border border-gray-300 rounded-xl px-4 py-3 text-base"
                      style={{
                        fontSize: 16,
                        color: "#000",
                        textAlign: "left",
                        direction: "ltr",
                        writingDirection: "ltr",
                      }}
                    />
                  )}
                />
                {errors.username && (
                  <Text className="text-red-500 text-sm py-1">
                    {errors.username.message?.toString()}
                  </Text>
                )}
              </View>

              {/* Email */}
              <View>
                <Label className="mb-2">{"Email"}</Label>
                <Controller
                  name="email"
                  control={control}
                  rules={{
                    required: "Email is required",
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "Please enter a valid email",
                    },
                  }}
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      value={value}
                      onChangeText={onChange}
                      placeholder={"Enter your Email"}
                      placeholderTextColor="#555"
                      keyboardType="email-address"
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
                  )}
                />
                {errors.email && (
                  <Text className="text-red-500 text-sm py-1">
                    {errors.email.message?.toString()}
                  </Text>
                )}
              </View>

              {/* Gender */}
              <View>
                <Label className="mb-2">{t("Gender") || "Gender"}</Label>
                <Controller
                  name="gender"
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <RadioGroup
                      value={value}
                      onValueChange={onChange}
                      className="gap-3 flex-row"
                    >
                      <View className="flex-row items-center gap-2">
                        <RadioGroupItem
                          value="Male"
                          onPress={() => onChange("Male")}
                        />
                        <Label>{t("Male") || "Male"}</Label>
                      </View>
                      <View className="flex-row items-center gap-2">
                        <RadioGroupItem
                          value="Female"
                          onPress={() => onChange("Female")}
                        />
                        <Label>{t("Female") || "Female"}</Label>
                      </View>
                    </RadioGroup>
                  )}
                />
              </View>
              {/* age*/}
              <View>
                <Label className="mb-2">{"Age"}</Label>
                <Controller
                  name="age"
                  control={control}
                  rules={{
                    required: "Age is required",
                  }}
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      value={value}
                      onChangeText={onChange}
                      placeholder={"Enter your Age"}
                      placeholderTextColor="#555"
                      keyboardType="numeric"
                      className="border border-gray-300 rounded-xl px-4 py-3 text-base"
                      style={{
                        fontSize: 16,
                        color: "#000",
                        textAlign: "left",
                        direction: "ltr",
                        writingDirection: "ltr",
                      }}
                    />
                  )}
                />
                {errors.age && (
                  <Text className="text-red-500 text-sm py-1">
                    {errors.age.message?.toString()}
                  </Text>
                )}
              </View>

              {/* contact number */}
              <View>
                <Label className="mb-2">{"Contact Number"}</Label>
                <Controller
                  name="contact"
                  control={control}
                  rules={{
                    required: "Contact number is required",
                    pattern: {
                      value: /^[0-9]{10}$/, // Adjust if you want to allow international formats
                      message: "Please enter a valid 10-digit contact number",
                    },
                  }}
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      value={value}
                      onChangeText={onChange}
                      placeholder={"Enter your Contact Number"}
                      placeholderTextColor="#555"
                      keyboardType="phone-pad"
                      maxLength={10}
                      autoComplete="tel"
                      className="border border-gray-300 rounded-xl px-4 py-3 text-base"
                      style={{
                        fontSize: 16,
                        color: "#000",
                        textAlign: "left",
                        direction: "ltr",
                        writingDirection: "ltr",
                      }}
                    />
                  )}
                />
                {errors.contact && (
                  <Text className="text-red-500 text-sm py-1">
                    {errors.contact.message?.toString()}
                  </Text>
                )}
              </View>

              {/* Password */}
              <View>
                <Label className="mb-2">{"Password"}</Label>
                <Controller
                  name="password"
                  control={control}
                  rules={{
                    required: "Password is required",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters",
                    },
                  }}
                  render={({ field: { onChange, value } }) => (
                    <View className="relative">
                      <TextInput
                        value={value}
                        onChangeText={onChange}
                        placeholder={"Enter password"}
                        placeholderTextColor="#555"
                        secureTextEntry={!showPassword}
                        autoCapitalize="none"
                        autoComplete="new-password"
                        className="border border-gray-300 rounded-xl px-4 py-3 text-base pr-12"
                        style={{
                          fontSize: 16,
                          color: "#000",
                          textAlign: "left",
                          direction: "ltr",
                          writingDirection: "ltr",
                        }}
                      />
                      <TouchableOpacity
                        onPress={() => setShowPassword((prev) => !prev)}
                        style={{
                          position: "absolute",
                          right: 12,
                          top: 18,
                        }}
                      >
                        <Text style={{ color: "#000" }}>
                          {showPassword ? "🙈" : "👁️"}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                />
                {errors.password && (
                  <Text className="text-red-500 text-sm py-1">
                    {errors.password.message?.toString()}
                  </Text>
                )}
              </View>

              {/* Confirm Password */}
              <View>
                <Label className="mb-2">{"Confirm Password"}</Label>
                <Controller
                  name="confirmPassword"
                  control={control}
                  rules={{
                    required: "Please confirm your password",
                    validate: (value) =>
                      value === watchedPassword || "Passwords do not match",
                  }}
                  render={({ field: { onChange, value } }) => (
                    <View className="relative">
                      <TextInput
                        value={value}
                        onChangeText={onChange}
                        placeholder={"Confirm Password"}
                        placeholderTextColor="#555"
                        secureTextEntry={!showConfirmPassword}
                        autoCapitalize="none"
                        autoComplete="new-password"
                        className="border border-gray-300 rounded-xl px-4 py-3 text-base pr-12"
                        style={{
                          fontSize: 16,
                          color: "#000",
                          textAlign: "left",
                          direction: "ltr",
                          writingDirection: "ltr",
                        }}
                      />
                      <TouchableOpacity
                        onPress={() => setShowConfirmPassword((prev) => !prev)}
                        style={{
                          position: "absolute",
                          right: 12,
                          top: 18,
                        }}
                      >
                        <Text style={{ color: "#000" }}>
                          {showConfirmPassword ? "🙈" : "👁️"}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                />
                {errors.confirmPassword && (
                  <Text className="text-red-500 text-sm py-1">
                    {errors.confirmPassword.message?.toString()}
                  </Text>
                )}
              </View>
            </View>

            {/* Submit Button */}
            <Button
              onPress={handleSubmit(onSubmit)}
              className="rounded-xl py-3 px-4 mt-6"
              style={{ backgroundColor: "#000F8F" }}
              disabled={loading}
            >
              <Text className="text-white font-semibold">
                {loading
                  ? t("creatingAccount") || "Creating Account..."
                  : t("createAccount") || "Create Account"}
              </Text>
            </Button>

            {/* Sign In Link */}
            <View className="flex flex-row gap-2 mt-4 mb-8 justify-center">
              <Text>
                {t("alreadyHaveAccount") || "Already have an account?"}
              </Text>
              <Link href="/sign-in">
                <Text className="text-primary-500">
                  {t("signIn") || "Sign In"}
                </Text>
              </Link>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
