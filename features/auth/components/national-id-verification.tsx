import React, { useRef, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  TextInput,
  Platform,
} from "react-native";
import { Controller, useForm } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import Animated, { FadeInDown, FadeOut } from "react-native-reanimated";
import { cn } from "@/lib/utils";
import {
  LogDataType,
  NationalIdVerificationDataType,
} from "../types/auth.types";

type FormData = {
  nationalId: string;
};

export default function NationalIdVerificationInputLoginForm(props: {
  NationalIdVerificationData: NationalIdVerificationDataType;
  setNationalIdVerificationData: React.Dispatch<
    React.SetStateAction<NationalIdVerificationDataType>
  >;
  LogData: LogDataType;
  setLogData: React.Dispatch<React.SetStateAction<LogDataType>>;
}) {
  const {
    NationalIdVerificationData,
    setNationalIdVerificationData,
    LogData,
    setLogData,
  } = props;
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      nationalId: NationalIdVerificationData.nationalId,
    },
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    const FinalData: NationalIdVerificationDataType = {
      ...data,
      isNationalIdSubmittedSuccess: true,
    };
    console.log("Form Data Submitted:", FinalData);

    // Simulate an API call
    setTimeout(() => {
      setLoading(false);
      setNationalIdVerificationData(FinalData);
    }, 2000);
  };

  const handelNationIdSkip = () => {
    setTimeout(() => {
      setLoading(false);
      setNationalIdVerificationData({
        nationalId: "",
        isNationalIdSubmittedSuccess: true,
      });
    }, 1000);
  };

  return (
    <View className="flex gap-4 justify-start items-start px-6 ">
      {/* National ID Input */}
      <View className="flex gap-2 w-full">
        <Controller
          name="nationalId"
          control={control}
          rules={{
            required: "National ID number is required",
            pattern: {
              value: /^[0-9]{10,15}$/,
              message: "Invalid National ID format",
            },
          }}
          render={({ field: { onChange, value } }) => (
            <>
              <Label
                className={cn(
                  errors.nationalId && "text-destructive",
                  "pb-2 native:pb-1 pl-0.5"
                )}
                nativeID="inputLabel"
                onPress={() => inputRef.current?.focus()}
              >
                National ID number
              </Label>
              <Input
                ref={inputRef}
                keyboardType="numeric"
                placeholder="Enter your National ID"
                value={value}
                onChangeText={onChange}
                aria-labelledby="inputLabel"
                aria-errormessage="inputError"
                className={cn(errors.nationalId && "border-destructive")}
              />
              {errors.nationalId && (
                <ErrorMessage msg={errors.nationalId.message || "Error"} />
              )}
            </>
          )}
        />
      </View>

      {/* Submit Button */}
      <Button
        onPress={handleSubmit(onSubmit)}
        disabled={loading}
        className={`mt-6 w-full ${
          loading ? "bg-gray-400" : "bg-primary-600"
        }  py-3 rounded-md`}
      >
        {loading ? <ActivityIndicator color="#000" /> : <Text className="text-white font-semibold">Submit</Text>}
      </Button>

      <Button onPress={handelNationIdSkip} variant={"ghost"} className="w-full">
        <Text>Skip</Text>
      </Button>
    </View>
  );
}

function ErrorMessage({ msg }: { msg: string }) {
  return Platform.OS === "web" ? (
    <Text
      className="text-destructive text-sm native:px-1 py-1.5 web:animate-in web:zoom-in-95"
      aria-invalid="true"
      id="inputError"
    >
      {msg}
    </Text>
  ) : (
    <Animated.Text
      entering={FadeInDown}
      exiting={FadeOut.duration(275)}
      className="text-destructive text-sm native:px-1 py-1.5"
      aria-invalid="true"
      id="inputError"
    >
      {msg}
    </Animated.Text>
  );
}
