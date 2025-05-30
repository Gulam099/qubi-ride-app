import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { apiNewUrl } from "@/const";
import { useUser } from "@clerk/clerk-expo";
import CreateTreatmentDialog from "./createTreatment";

interface Treatment {
  isEmptyStomach: React.JSX.Element;
  _id: string;
  createdAt: string;
  diagnosis: string;
  status: string;
  treatmentItems: {
    isEmptyStomach: React.JSX.Element;
    duration: React.JSX.Element;
    frequency: React.JSX.Element;
    dosage: React.JSX.Element;
    name: string;
    quantity?: string;
  }[];
}

const TreatmentHistory: React.FC = () => {
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { user } = useUser();
  const doctorId = user?.publicMetadata?.dbUserId as string;
  const { patientId } = useLocalSearchParams();

  const fetchTreatments = async () => {
    try {
      const url = `${apiNewUrl}/api/treatments/all?doctorId=${patientId}&patientId=${doctorId}`;
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const json = await response.json();
        if (Array.isArray(json.data)) {
          setTreatments(json.data);
        } else {
          console.warn("Expected an array in 'data.data', got:", json.data);
          setTreatments([]);
        }
      } else {
        const error = await response.json();
        Alert.alert("Error", error.message || "Failed to fetch treatments.");
        setTreatments([]);
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Something went wrong.");
      setTreatments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTreatments();
  }, []);

  const handleTreatmentCreated = () => {
    setShowCreateModal(false);
    fetchTreatments(); // Refresh the list after creation
  };

  return (
    <View className="flex-1">
      <ScrollView className="bg-white px-4 py-5 mt-10">
        <View className="mb-4 mt-4">
          <View className="flex flex-row justify-between mb-6">
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: "/(tabs)/program",
                  params: { patientId },
                })
              }
              className="border border-red-200 p-3 rounded-lg items-center w-24"
            >
              <Text className="text-red-500 font-bold">Back</Text>
            </TouchableOpacity>

            {/* <TouchableOpacity
              onPress={() => setShowCreateModal(true)}
              className="bg-violet-700 p-3 rounded-lg items-center w-40"
            >
              <Text className="text-white font-bold">Create Treatment</Text>
            </TouchableOpacity> */}
          </View>
        </View>
        <Text className="text-lg font-bold text-violet-700 mb-4">
          Treatment History
        </Text>
        {loading ? (
          <ActivityIndicator size="large" color="#6B46C1" />
        ) : treatments.length === 0 ? (
          <Text className="text-center text-gray-600">
            No treatments found.
          </Text>
        ) : (
          treatments.map((treatment) => (
            <View
              key={treatment._id}
              className="bg-white rounded-2xl shadow-lg p-4 mb-4"
            >
              <Text className="font-bold text-violet-700 text-lg mb-1">
                🩺 Diagnosis:{" "}
                <Text className="text-black">{treatment.diagnosis}</Text>
              </Text>
              <Text className="text-gray-700 mb-2">
                📅 Date:{" "}
                <Text className="text-black">
                  {new Date(treatment.createdAt).toLocaleDateString()}
                </Text>
              </Text>

              <View className="bg-violet-50 rounded-xl p-3">
                <Text className="font-bold text-violet-600 mb-2">
                  💊 Medications:
                </Text>
                {treatment.isEmptyStomach && (
                  <View className="mb-4 p-2 bg-yellow-100 border-l-4 border-yellow-500 rounded">
                    <Text className="text-yellow-800 font-semibold">
                      ⚠️ This treatment requires an empty stomach!
                    </Text>
                  </View>
                )}
                {treatment.treatmentItems.map((item, idx) => (
                  <View key={idx} className="mb-2">
                    <Text className="font-semibold text-violet-700">
                      • {item.name}
                    </Text>
                    {item.isEmptyStomach && (
                      <View className="  ">
                        <Text className="px-2 py-1">
                          Take this medicine on an empty stomach.
                        </Text>
                      </View>
                    )}
                    {item.quantity && (
                      <Text className="text-sm text-gray-700">
                        {" "}
                        💉 Dosage:{" "}
                        <Text className="text-black">{item.quantity}</Text>
                      </Text>
                    )}
                    {item.frequency && (
                      <Text className="text-sm text-gray-700">
                        {" "}
                        ⏱️ Frequency:{" "}
                        <Text className="text-black">{item.frequency}</Text>
                      </Text>
                    )}
                    {item.duration && (
                      <Text className="text-sm text-gray-700">
                        {" "}
                        📆 Duration:{" "}
                        <Text className="text-black">{item.duration}</Text>
                      </Text>
                    )}
                  </View>
                ))}
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Modal for creating treatment */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View className="flex-1 bg-white">
          <CreateTreatmentDialog
            patientId={patientId as string}
            onCancel={() => setShowCreateModal(false)}
            onSuccess={handleTreatmentCreated}
          />
        </View>
      </Modal>
    </View>
  );
};

export default TreatmentHistory;
