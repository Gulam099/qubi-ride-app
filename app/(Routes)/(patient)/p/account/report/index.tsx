import { View, Text, FlatList } from "react-native";
import React, { useState } from "react";
import { OtpInput } from "react-native-otp-entry";
import colors from "@/utils/colors";
import { Stack } from "expo-router";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import ReportCard from "@/features/account/components/ReportCard";
import { H2, H3 } from "@/components/ui/Typography";
import { useSelector } from "react-redux";
import { AppStateType } from "@/features/setting/types/setting.type";
import { UserType } from "@/features/user/types/user.type";
import { toast } from "sonner-native";
import { apiBaseUrl } from "@/features/Home/constHome";

export default function AccountReportPage() {
  const appState: AppStateType = useSelector((state: any) => state.appState);
  const user: UserType = useSelector((state: any) => state.user);
  // const [ReportVerificationCode, setReportVerificationCode] = useState("1234");
  const [ShowReports, setShowReports] = useState(
    user.passcode === null ? true : false
  );

  const [ActiveTab, setActiveTab] = useState({
    report: "My Prescriptions",
    reportType: "Current",
  });

  async function handleSubmit(text: string): Promise<void> {
    const payload = {
      phoneNumber: user.phoneNumber,
      passcode: text,
    };

    try {
      const response = await fetch(`${apiBaseUrl}/api/verify-passcode`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success("Passcode verified successfully!");
        setShowReports(true); // Show reports or proceed with the next step
      } else {
        toast.error(result.message || "Invalid passcode. Please try again.");
        setShowReports(false);
      }
    } catch (error) {
      console.error("Error verifying passcode:", error);
      toast.error("Error verifying passcode. Please try again later.");
      setShowReports(false);
    }
  }

  const reportData = [
    {
      id: "1",
      title: "Prescription name",
      doctorName: "Mada Muhammad Al-Muhammad",
      date: "2023 / 12 / 30",
      number: "49575930",
    },
    {
      id: "2",
      title: "Prescription name",
      doctorName: "Mada Muhammad Al-Muhammad",
      date: "2023 / 12 / 30",
      number: "49575930",
    },
  ];

  return (
    <View className="bg-blue-50/10 w-full h-full">
      {!ShowReports ? (
        <View className="px-6 py-20 flex flex-col gap-16 ">
          <H3 className="border-none text-center text-neutral-600 text-3xl">
            Enter your secret code
          </H3>
          <OtpInput
            numberOfDigits={4}
            focusColor={colors.primary[500]}
            focusStickBlinkingDuration={500}
            secureTextEntry={true}
            // onTextChange={onChange}
            onFilled={(text: string) => handleSubmit(text)}
            textInputProps={{
              accessibilityLabel: "your secret code",
            }}
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
              filledPinCodeContainerStyle: {},
              pinCodeTextStyle: {
                fontSize: 40,
                textAlignVertical: "center",
              },
            }}
          />
          <View className="flex-col gap-4">
            <Button>
              <Text className="text-white font-semibold">Submit</Text>
            </Button>
            <Button variant={"ghost"}>
              <Text className=" font-medium text-sm text-neutral-500">
                Forgot your Password ?{" "}
              </Text>
            </Button>
          </View>
        </View>
      ) : (
        <View className="bg-blue-50/20 w-full h-full px-4 flex flex-col gap-2">
          <View className="py-4 flex flex-col gap-4">
            <Text className="font-semibold text-xl">My Reports</Text>
            <View className="w-full flex flex-row gap-2">
              {["Medical Plan", "My Prescriptions"].map((e, i) => {
                const isActiveTabThis = e === ActiveTab.report;
                return (
                  <Button
                    key={e + i}
                    size={"sm"}
                    className={cn(
                      isActiveTabThis ? "bg-blue-900" : "bg-white",
                      " rounded-xl  flex-1"
                    )}
                  >
                    <Text
                      className={cn(
                        isActiveTabThis ? "text-white" : "",
                        "font-medium"
                      )}
                    >
                      {e}
                    </Text>
                  </Button>
                );
              })}
            </View>
          </View>
          <View className="py-4 flex flex-col gap-4">
            <Text className="font-semibold text-xl">Report Type</Text>
            <View className="w-full flex flex-row gap-2">
              {["Previous", "Current"].map((e, i) => {
                const isActiveTabThis = e === ActiveTab.reportType;
                return (
                  <Button
                    key={e + i}
                    size={"sm"}
                    className={cn(
                      isActiveTabThis ? "bg-blue-900" : "bg-white",
                      " rounded-xl  flex-1"
                    )}
                  >
                    <Text
                      className={cn(
                        isActiveTabThis ? "text-white" : "",
                        "font-medium"
                      )}
                    >
                      {e}
                    </Text>
                  </Button>
                );
              })}
            </View>
          </View>
          <View className="flex gap-4">
            <Text className="font-semibold text-xl">All Reports</Text>
            <FlatList
              data={reportData}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => <ReportCard {...item} />}
              contentContainerClassName="flex flex-col gap-3"
            />
          </View>
        </View>
      )}
    </View>
  );
}
