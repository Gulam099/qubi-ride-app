import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Modal,
  Pressable,
  ScrollView,
  Image,
} from "react-native";
import axios from "axios";
import { useUser } from "@clerk/clerk-expo";
import { ApiUrl } from "@/const";
import { toast } from "sonner-native";
import { useTranslation } from "react-i18next";

const TreatmentsListScreen = () => {
  const { user } = useUser();
  const userId = user?.publicMetadata.dbPatientId as string;
  const [treatments, setTreatments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTreatment, setSelectedTreatment] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    fetchTreatments();
  }, []);

  const fetchTreatments = async () => {
    try {
      const response = await axios.get(
        `${ApiUrl}/api/treatments/user/${userId}`
      );
      setTreatments(response.data.data);
    } catch (error) {
      console.error("Failed to fetch treatments:", error);
    } finally {
      setLoading(false);
    }
  };

  console.log("treat>>", treatments);

  const openModal = (treatment) => {
    if (true) {
      setSelectedTreatment(treatment);
      setModalVisible(true);
    } else {
      // Show toast message (use your existing toast)
      toast.error("Please pay first to view treatment details.");
    }
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedTreatment(null);
  };

  // Group treatments by doctorId._id
  const groupByDoctor = () => {
    const grouped = treatments.reduce((acc, item) => {
      const doctorId = item.doctorId?._id || "unknown";
      if (!acc[doctorId]) {
        acc[doctorId] = {
          doctor: item.doctorId,
          treatments: [],
        };
      }
      acc[doctorId].treatments.push(item);
      return acc;
    }, {});
    return Object.values(grouped);
  };

  const groupedTreatments = groupByDoctor();

  const renderDoctorGroup = ({ item }) => (
    <View style={styles.card}>
      {/* Doctor Info */}
      {item.doctor?.profile_picture && (
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: item.doctor.profile_picture }}
            style={styles.doctorImage}
          />
        </View>
      )}
      <Text style={styles.doctorName}>
        {t("Doctor")}: {item.doctor?.full_name || t("unknown")}
      </Text>
      <Text style={styles.doctorDetail}>
        {t("Specialization")}:{" "}
        {item.doctor?.specialization || t("notAvailable")}
      </Text>
      <Text style={styles.doctorDetail}>
        {t("SubSpecialization")}:{" "}
        {item.doctor?.sub_specialization || t("notAvailable")}
      </Text>
      <Text style={styles.doctorDetail}>
        {t("Treatments")}:{" "}
        {item.doctor?.experience
          ? `${item.doctor.experience} years`
          : t("notAvailable")}
      </Text>

      {/* List Treatments for this Doctor */}
      <Text style={styles.treatmentTitle}>{t("Treatments")}:</Text>
      {item.treatments.map((treatment) => (
        <View key={treatment._id} style={styles.treatmentItem}>
          <Text style={styles.itemName}>
            • {treatment.diagnosis || t("notAvailable")}
          </Text>
          <Text style={styles.itemDetail}>
            {t("Status")}: {treatment.status || t("notAvailable")}
          </Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => openModal(treatment)}
          >
            <Text style={styles.buttonText}>{t("View Details")}</Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );

  if (loading) {
    return <ActivityIndicator size="large" style={{ marginTop: 40 }} />;
  }

  return (
    <View style={{ flex: 1 }}>
      {groupedTreatments.length > 0 ? (
        <FlatList
          data={groupedTreatments}
          keyExtractor={(item, index) => item.doctor?._id || `unknown-${index}`}
          renderItem={renderDoctorGroup}
          contentContainerStyle={{ padding: 16 }}
        />
      ) : (
        <View className="flex-1 justify-center items-center">
          <Text className="text-lg font-semibold text-gray-600">
            {t("No treatment found")}
          </Text>
        </View>
      )}

      {/* Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView>
              <Text style={styles.modalTitle}>{t("Treatment Details")}</Text>
              {selectedTreatment ? (
                <>
                  <Text>
                    {t("Diagnosis")}:{" "}
                    {selectedTreatment.diagnosis || t("notAvailable")}
                  </Text>
                  <Text>
                    {t("Empty Stomach")}:{" "}
                    {selectedTreatment.isEmptyStomach ? t("Yes") : t("No")}
                  </Text>
                  <Text style={styles.modalSubTitle}>
                    {t("Treatment Items")}:
                  </Text>
                  {selectedTreatment.treatmentItems &&
                  selectedTreatment.treatmentItems.length > 0 ? (
                    selectedTreatment.treatmentItems.map((item, idx) => (
                      <View key={idx} style={styles.treatmentItem}>
                        <Text style={styles.itemName}>
                          • {item.name || t("notAvailable")}
                        </Text>
                        <Text style={styles.itemDetail}>
                          {t("Description")}:{" "}
                          {item.description || t("notAvailable")}
                        </Text>
                        <Text style={styles.itemDetail}>
                          {t("Quantity")}:{item.quantity || t("notAvailable")}
                        </Text>
                        <Text style={styles.itemDetail}>
                          {t("Frequency")}:{" "}
                          {item.frequency || t("notAvailable")}
                        </Text>
                        <Text style={styles.itemDetail}>
                          {t("Duration")}: {item.duration || t("notAvailable")}
                        </Text>
                      </View>
                    ))
                  ) : (
                    <Text>{t("No treatment items available")}</Text>
                  )}
                  {selectedTreatment.photo && (
                    <Image
                      source={{ uri: selectedTreatment.photo }}
                      style={styles.treatmentImage}
                      resizeMode="contain"
                    />
                  )}
                </>
              ) : (
                <Text>{t("Loading treatment details...")}</Text>
              )}
              <Pressable style={styles.closeButton} onPress={closeModal}>
                <Text style={styles.buttonText}>{t("Close")}</Text>
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default TreatmentsListScreen;

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#f0f0f0",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  imageContainer: {
    alignItems: "center",
    marginBottom: 10,
  },
  doctorImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    resizeMode: "cover",
  },
  doctorName: {
    fontSize: 16,
    marginBottom: 4,
    fontWeight: "bold",
  },
  treatmentImage: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    marginVertical: 10,
  },

  doctorDetail: {
    fontSize: 14,
    marginBottom: 4,
    color: "#555",
  },
  treatmentTitle: {
    marginTop: 10,
    fontWeight: "bold",
    fontSize: 15,
  },
  treatmentItem: {
    backgroundColor: "#f8f9fa",
    padding: 10,
    marginVertical: 5,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#007bff",
  },
  itemName: {
    fontWeight: "bold",
    fontSize: 14,
    marginBottom: 4,
  },
  itemDetail: {
    fontSize: 12,
    color: "#555",
    marginBottom: 2,
  },
  button: {
    backgroundColor: "#007bff",
    padding: 8,
    marginTop: 4,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "white",
    width: "100%",
    maxHeight: "80%",
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  modalSubTitle: {
    marginTop: 12,
    fontWeight: "bold",
  },
  closeButton: {
    backgroundColor: "#007bff",
    marginTop: 20,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
});
