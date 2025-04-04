import { View, Text, FlatList } from "react-native";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { OtpInput } from "react-native-otp-entry";
import { cn } from "@/lib/utils";
import ReportCard from "@/features/account/components/ReportCard";
import { toast } from "sonner-native";
import colors from "@/utils/colors";
import { useSelector } from "react-redux";
import { UserType } from "@/features/user/types/user.type";
import { apiBaseUrl } from "@/features/Home/constHome";
import { AppStateType } from "@/features/setting/types/setting.type";
import { useUser } from "@clerk/clerk-expo";

type ReportProps = {
  _id: string;
  title: string;
  doctorName: string;
  date: string;
  number: string;
  type: "previous" | "current";
  category: "plan" | "prescription";
};

// Mock Data
const mockReportData = {
  "Medical Plan": {
    Current: [
      {
        _id: "1",
        title: "Plan Report 1",
        doctorName: "Dr. Ahmad",
        date: "2024 / 01 / 01",
        number: "12345678",
        type: "current",
        category: "plan",
      },
    ],
    Previous: [
      {
        _id: "2",
        title: "Plan Report 2",
        doctorName: "Dr. Sarah",
        date: "2023 / 12 / 20",
        number: "98765432",
        type: "previous",
        category: "plan",
      },
    ],
  },
  "My Prescriptions": {
    Current: [
      {
        _id: "3",
        title: "Prescription 1",
        doctorName: "Dr. Yusuf",
        date: "2024 / 02 / 01",
        number: "56789012",
        type: "current",
        category: "prescription",
      },
    ],
    Previous: [
      {
        _id: "4",
        title: "Prescription 2",
        doctorName: "Dr. Adam",
        date: "2023 / 11 / 15",
        number: "34567890",
        type: "previous",
        category: "prescription",
      },
    ],
  },
};

export default function AccountReportPage() {
  const { user } = useUser();
  const [showReports, setShowReports] = useState<boolean>(
    (user?.unsafeMetadata.passcode as string) === null ? true : false
  );
  const [activeTab, setActiveTab] = useState("My Prescriptions");
  const [activeCategory, setActiveCategory] = useState("Current");
  const [reports, setReports] = useState<ReportProps[]>([]);

  async function handleSubmit(text: string): Promise<void> {
    try {
      const passcode = user?.unsafeMetadata?.passcode as string;
      const isPassCodeVerified = passcode.toString() === text;

      if (isPassCodeVerified) {
        toast.success("Passcode verified successfully!");
        setShowReports(true); // Show reports or proceed with the next step
      } else {
        toast.error("Invalid passcode. Please try again.");
        setShowReports(false);
      }
    } catch (error) {
      console.error("Error verifying passcode:", error);
      toast.error("Error verifying passcode. Please try again later.");
      setShowReports(false);
    }
  }

  // Fetch reports dynamically based on tab and category
  useEffect(() => {
    const fetchReports = async () => {
      const data = mockReportData[activeTab][activeCategory] || [];
      setReports(data);
    };

    fetchReports();
  }, [activeTab, activeCategory]);

  const handleOtpSubmit = async (otp: string) => {
    // Simulated verification
    if (otp === "1234") {
      toast.success("Passcode verified successfully!");
      setShowReports(true);
    } else {
      toast.error("Invalid passcode. Please try again.");
    }
  };

  return (
    <View className="bg-blue-50/10 w-full h-full">
      {!showReports ? (
        <View className="px-6 py-20 flex flex-col gap-16">
          <Text className="text-center text-2xl font-semibold text-gray-700">
            Enter your secret code
          </Text>
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
          <Button>
            <Text className="text-white font-semibold">Submit</Text>
          </Button>
        </View>
      ) : (
        <View className="px-4 py-6">
          <View className="mb-6">
            <Text className="font-semibold text-xl">My Reports</Text>
            <View className="flex flex-row gap-2 mt-4">
              {["Medical Plan", "My Prescriptions"].map((tab) => (
                <Button
                  key={tab}
                  className={cn(
                    tab === activeTab ? "bg-blue-900" : "bg-white",
                    "rounded-xl flex-1"
                  )}
                  onPress={() => setActiveTab(tab)}
                >
                  <Text
                    className={cn(
                      tab === activeTab ? "text-white" : "text-gray-700",
                      "font-medium"
                    )}
                  >
                    {tab}
                  </Text>
                </Button>
              ))}
            </View>
          </View>
          <View className="mb-6">
            <Text className="font-semibold text-xl">Report Type</Text>
            <View className="flex flex-row gap-2 mt-4">
              {["Current", "Previous"].map((category) => (
                <Button
                  key={category}
                  className={cn(
                    category === activeCategory ? "bg-blue-900" : "bg-white",
                    "rounded-xl flex-1"
                  )}
                  onPress={() => setActiveCategory(category)}
                >
                  <Text
                    className={cn(
                      category === activeCategory
                        ? "text-white"
                        : "text-gray-700",
                      "font-medium"
                    )}
                  >
                    {category}
                  </Text>
                </Button>
              ))}
            </View>
          </View>
          <FlatList
            data={reports}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <ReportCard
                type={item.type}
                category={item.category}
                title={item.title}
                doctorName={item.doctorName}
                date={item.date}
                number={item.number}
                _id={item._id}
              />
            )}
            ListEmptyComponent={
              <Text className="text-center text-gray-500 mt-4">
                No reports available.
              </Text>
            }
          />
        </View>
      )}
    </View>
  );
}
