import {
  View,
  Text,
  FlatList,
  Modal,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import React, { useState, useEffect, useCallback } from "react";
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
import { useTranslation } from "react-i18next";

type ReportProps = {
  _id: string;
  title: string;
  doctorName: string;
  date: string;
  number: string;
  type: "previous" | "current";
  category: "plan" | "prescription";
  // Add treatment data for prescriptions
  treatmentData?: Treatment;
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

// Mock data for Medical Plan (since treatments should only show in prescriptions)
const mockMedicalPlanData = {
  "Medical Plan": {
    Current: [
      {
        _id: "plan_current_1",
        title: "Diabetes Management Plan",
        doctorName: "Dr. Sarah Johnson",
        date: "15 / 01 / 2025",
        number: "MP001234",
        type: "current",
        category: "plan",
      },
      {
        _id: "plan_current_2",
        title: "Hypertension Treatment Plan",
        doctorName: "Dr. Michael Chen",
        date: "10 / 01 / 2025",
        number: "MP001235",
        type: "current",
        category: "plan",
      },
    ],
    Previous: [
      {
        _id: "plan_previous_1",
        title: "Post-Surgery Recovery Plan",
        doctorName: "Dr. Emma Williams",
        date: "20 / 08 / 2024",
        number: "MP000987",
        type: "previous",
        category: "plan",
      },
    ],
  },
};

export default function AccountReportPage() {
  const { user } = useUser();
  const userId = user?.publicMetadata.dbPatientId as string;
  const { t } = useTranslation();

  const userPasscode = user?.unsafeMetadata?.passcode as string;
  const hasPasscode =
    userPasscode !== null && userPasscode !== undefined && userPasscode !== "";

  const [showReports, setShowReports] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState("My Prescriptions");
  const [activeCategory, setActiveCategory] = useState("Current");
  const [reports, setReports] = useState<ReportProps[]>([]);
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [loading, setLoading] = useState(false);

  // Modal state for showing treatment details
  const [selectedTreatment, setSelectedTreatment] = useState<Treatment | null>(
    null
  );
  const [modalVisible, setModalVisible] = useState(false);

  // Verify using custom passcode
  async function handleSubmit(text: string): Promise<void> {
    try {
      if (!hasPasscode) {
        toast.error(
          t("No passcode found. Please set up a passcode in settings first.")
        );
        return;
      }

      const isPassCodeVerified = userPasscode === text;

      if (isPassCodeVerified) {
        toast.success(t("Passcode verified successfully!"));
        setShowReports(true);
      } else {
        toast.error(t("Invalid passcode. Please enter your correct passcode."));
        setShowReports(false);
      }
    } catch (error) {
      console.error("Error verifying passcode:", error);
      toast.error(t("Error verifying passcode. Please try again later."));
      setShowReports(false);
    }
  }

  // Fetch treatments from API (only for prescriptions)
  const fetchTreatments = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    try {
      const response = await axios.get(
        `${ApiUrl}/api/treatments/user/${userId}`
      );
      setTreatments(response.data.data || []);
    } catch (error) {
      console.error(t("Failed to fetch treatments:"), error);
      toast.error(t("Failed to fetch treatments"));
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Convert treatments to report format (only for prescriptions)
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
        title: treatment.diagnosis || t("Treatment Prescription"),
        doctorName: treatment.doctorId?.full_name || t("Unknown Doctor"),
        date: new Date(treatment.createdAt)
          .toLocaleDateString("en-GB")
          .replace(/\//g, " / "),
        number: treatment._id.slice(-8),
        type: category === "Current" ? "current" : "previous",
        category: "prescription",
        treatmentData: treatment, // Include full treatment data
      }));
  };

  // Handle card press to show treatment details
  const handleCardPress = (report: ReportProps) => {
    if (report.category === "prescription" && report.treatmentData) {
      setSelectedTreatment(report.treatmentData);
      setModalVisible(true);
    }
    // For medical plans, you can add different logic here in the future
  };

  // Fetch reports based on tab and category
  useEffect(() => {
    const fetchReports = async () => {
      if (activeTab === "Medical Plan") {
        // Use mock data for Medical Plan - treatments should NOT appear here
        const data = mockMedicalPlanData["Medical Plan"][activeCategory] || [];
        setReports(data);
      } else if (activeTab === "My Prescriptions") {
        // Fetch treatments ONLY for prescriptions tab
        if (treatments.length === 0) {
          await fetchTreatments();
        }
      }
    };

    if (showReports) {
      fetchReports();
    }
  }, [activeTab, activeCategory, showReports]);

  // Convert treatments when they are fetched or category changes (ONLY for prescriptions)
  useEffect(() => {
    if (treatments.length > 0 && activeTab === "My Prescriptions") {
      const convertedReports = convertTreatmentsToReports(
        treatments,
        activeCategory
      );
      setReports(convertedReports);
    }
  }, [treatments, activeCategory, activeTab]);

  // Treatment Details Modal Component
  const TreatmentModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => setModalVisible(false)}
    >
      <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
        <View className="bg-white rounded-lg p-6 m-4 max-h-4/5 w-11/12">
          <ScrollView showsVerticalScrollIndicator={false}>
            <View className="mb-4">
              <Text className="text-xl font-bold text-gray-800 mb-2">
                {t("Treatment Details")}
              </Text>

              {selectedTreatment && (
                <>
                  <View className="mb-4">
                    <Text className="font-semibold text-gray-700 mb-1">
                      {t("Diagnosis")}:
                    </Text>
                    <Text className="text-gray-600">
                      {selectedTreatment.diagnosis || t("N/A")}
                    </Text>
                  </View>

                  <View className="mb-4">
                    <Text className="font-semibold text-gray-700 mb-1">
                      {t("Doctor")}:
                    </Text>
                    <Text className="text-gray-600">
                      {selectedTreatment.doctorId?.full_name ||
                        t("Unknown Doctor")}
                    </Text>
                    <Text className="text-gray-500 text-sm">
                      {selectedTreatment.doctorId?.specialization || ""}
                    </Text>
                  </View>

                  <View className="mb-4">
                    <Text className="font-semibold text-gray-700 mb-1">
                      {t("Status")}:
                    </Text>
                    <Text className="text-gray-600">
                      {selectedTreatment.status}
                    </Text>
                  </View>

                  <View className="mb-4">
                    <Text className="font-semibold text-gray-700 mb-1">
                      {t("Date")}:
                    </Text>
                    <Text className="text-gray-600">
                      {new Date(selectedTreatment.createdAt).toLocaleDateString(
                        "en-GB"
                      )}
                    </Text>
                  </View>

                  <View className="mb-4">
                    <Text className="font-semibold text-gray-700 mb-1">
                      {t("Empty Stomach")}:
                    </Text>
                    <Text className="text-gray-600">
                      {selectedTreatment.isEmptyStomach ? t("Yes") : t("No")}
                    </Text>
                  </View>

                  <View className="mb-4">
                    <Text className="font-semibold text-gray-700 mb-2">
                      {t("Medications")}:
                    </Text>
                    {selectedTreatment.treatmentItems?.length > 0 ? (
                      selectedTreatment.treatmentItems.map((item, index) => (
                        <View
                          key={index}
                          className="bg-gray-50 p-3 rounded-lg mb-2"
                        >
                          <Text className="font-medium text-gray-800 mb-1">
                            {item.name}
                          </Text>
                          {item.description && (
                            <Text className="text-gray-600 text-sm mb-1">
                              {item.description}
                            </Text>
                          )}
                          <Text className="text-gray-600 text-sm">
                            {t("Quantity")}: {item.quantity} | {t("Frequency")}:{" "}
                            {item.frequency} | {t("Duration")}: {item.duration}
                          </Text>
                        </View>
                      ))
                    ) : (
                      <Text className="text-gray-500">
                        {t("No medications prescribed")}
                      </Text>
                    )}
                  </View>
                </>
              )}
            </View>
          </ScrollView>

          <TouchableOpacity
            className="bg-blue-900 p-3 rounded-lg mt-4"
            onPress={() => setModalVisible(false)}
          >
            <Text className="text-white text-center font-semibold">
              {t("Close")}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <View className="bg-blue-50/10 w-full h-full">
      {!showReports ? (
        <View className="px-6 py-20 flex flex-col gap-16">
          <View className="text-center">
            <Text className="text-center text-2xl font-semibold text-gray-700">
              {t("Enter your secret code")}
            </Text>
          </View>
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
            <Text className="text-white font-semibold">{t("Log in")}</Text>
          </Button>
        </View>
      ) : (
        <View className="px-4 py-6">
          <View className="mb-6">
            <Text className="font-semibold text-xl">{t("My Reports")}</Text>
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
                    {t(tab)}
                  </Text>
                </Button>
              ))}
            </View>
          </View>
          <View className="mb-6">
            <Text className="font-semibold text-xl">{t("Report Type")}</Text>
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
                    {t(category)}
                  </Text>
                </Button>
              ))}
            </View>
          </View>

          {loading ? (
            <View className="flex-1 justify-center items-center">
              <Text className="text-lg font-semibold text-gray-600">
                {t("Loading treatments...")}
              </Text>
            </View>
          ) : (
            <FlatList
              data={reports}
              keyExtractor={(item) => item._id}
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => handleCardPress(item)}>
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
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <Text className="text-center text-gray-500 mt-4">
                  {activeTab === "My Prescriptions" &&
                  activeCategory === "Current"
                    ? t("No current prescriptions available.")
                    : activeTab === "My Prescriptions" &&
                      activeCategory === "Previous"
                    ? t("No previous prescriptions available.")
                    : activeTab === "Medical Plan" &&
                      activeCategory === "Current"
                    ? t("No current medical plans available.")
                    : activeTab === "Medical Plan" &&
                      activeCategory === "Previous"
                    ? t("No previous medical plans available.")
                    : t("No reports available.")}
                </Text>
              }
            />
          )}

          <TreatmentModal />
        </View>
      )}
    </View>
  );
}
