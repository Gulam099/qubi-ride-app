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
import axios from "axios";
import { ApiUrl } from "@/const";

type ReportProps = {
  _id: string;
  title: string;
  doctorName: string;
  date: string;
  number: string;
  type: "previous" | "current";
  category: "plan" | "prescription";
};

type TreatmentItem = {
  name: string;
  description: string;
  quantity: string;
  frequency: string;
  duration: string;
};

type Treatment = {
  _id: string;
  diagnosis: string;
  status: string;
  createdAt: string;
  doctorId: {
    _id: string;
    full_name: string;
    specialization: string;
  };
  treatmentItems: TreatmentItem[];
  isEmptyStomach: boolean;
};

// Mock Data for Medical Plan (keeping existing structure)
const mockMedicalPlanData = {
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
};

export default function AccountReportPage() {
  const { user } = useUser();
  const userId = user?.publicMetadata.dbPatientId as string;
  const [showReports, setShowReports] = useState<boolean>(
    (user?.unsafeMetadata.passcode as string) === null ? true : false
  );
  const [activeTab, setActiveTab] = useState("My Prescriptions");
  const [activeCategory, setActiveCategory] = useState("Current");
  const [reports, setReports] = useState<ReportProps[]>([]);
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(text: string): Promise<void> {
    try {
      const passcode = user?.unsafeMetadata?.passcode as string;
      const isPassCodeVerified = passcode.toString() === text;

      if (isPassCodeVerified) {
        toast.success("Passcode verified successfully!");
        setShowReports(true);
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

  // Fetch treatments from API
  const fetchTreatments = async () => {
    if (!userId) return;

    setLoading(true);
    try {
      const response = await axios.get(
        `${ApiUrl}/api/treatments/user/${userId}`
      );
      setTreatments(response.data.data || []);
    } catch (error) {
      console.error("Failed to fetch treatments:", error);
      toast.error("Failed to fetch treatments");
    } finally {
      setLoading(false);
    }
  };

  // Convert treatments to report format
  const convertTreatmentsToReports = (
    treatments: Treatment[],
    category: string
  ): ReportProps[] => {
    const currentDate = new Date();
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(currentDate.getMonth() - 6);

    return treatments
      .filter((treatment) => {
        const treatmentDate = new Date(treatment.createdAt);
        if (category === "Current") {
          return treatmentDate >= sixMonthsAgo;
        } else {
          return treatmentDate < sixMonthsAgo;
        }
      })
      .map((treatment) => ({
        _id: treatment._id,
        title: treatment.diagnosis || "Treatment Prescription",
        doctorName: treatment.doctorId?.full_name || "Unknown Doctor",
        date: new Date(treatment.createdAt)
          .toLocaleDateString("en-GB")
          .replace(/\//g, " / "),
        number: treatment._id.slice(-8), // Use last 8 characters of ID as number
        type: category === "Current" ? "current" : "previous",
        category: "prescription",
      }));
  };

  // Fetch reports based on tab and category
  useEffect(() => {
    const fetchReports = async () => {
      if (activeTab === "Medical Plan") {
        // Use mock data for Medical Plan
        const data = mockMedicalPlanData[activeTab][activeCategory] || [];
        setReports(data);
      } else if (activeTab === "My Prescriptions") {
        // Fetch treatments for prescriptions
        if (treatments.length === 0) {
          await fetchTreatments();
        } else {
          const convertedReports = convertTreatmentsToReports(
            treatments,
            activeCategory
          );
          setReports(convertedReports);
        }
      }
    };

    if (showReports) {
      fetchReports();
    }
  }, [activeTab, activeCategory, showReports, treatments]);

  // Convert treatments when they are fetched
  useEffect(() => {
    if (treatments.length > 0 && activeTab === "My Prescriptions") {
      const convertedReports = convertTreatmentsToReports(
        treatments,
        activeCategory
      );
      setReports(convertedReports);
    }
  }, [treatments, activeCategory, activeTab]);

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

          {loading ? (
            <View className="flex-1 justify-center items-center">
              <Text className="text-lg font-semibold text-gray-600">
                Loading treatments...
              </Text>
            </View>
          ) : (
            <FlatList
              data={reports}
              keyExtractor={(item) => item._id}
              renderItem={({ item }) => (
                <View className="mb-4">
                  <ReportCard
                    type={item.type}
                    category={item.category}
                    title={item.title}
                    doctorName={item.doctorName}
                    date={item.date}
                    number={item.number}
                    _id={item._id}
                  />
                </View>
              )}
              ListEmptyComponent={
                <Text className="text-center text-gray-500 mt-4">
                  {activeTab === "My Prescriptions" &&
                  activeCategory === "Current"
                    ? "No current prescriptions available."
                    : activeTab === "My Prescriptions" &&
                      activeCategory === "Previous"
                    ? "No previous prescriptions available."
                    : "No reports available."}
                </Text>
              }
            />
          )}
        </View>
      )}
    </View>
  );
}
