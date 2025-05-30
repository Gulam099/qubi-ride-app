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

const TreatmentsListScreen = () => {
  const { user } = useUser();
  const userId = user?.publicMetadata.dbPatientId as string;
  const [treatments, setTreatments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTreatment, setSelectedTreatment] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    fetchTreatments();
  }, []);

  const fetchTreatments = async () => {
    try {
      const response = await axios.get(`${ApiUrl}/api/treatments/user/${userId}`);
      setTreatments(response.data.data);
    } catch (error) {
      console.error("Failed to fetch treatments:", error);
    } finally {
      setLoading(false);
    }
  };


  const openModal = (treatment) => {
    console.log("first,", treatment);
    if (treatment?.bookingId?.paymentStatus === 'paid') {
      setSelectedTreatment(treatment);
      setModalVisible(true);
    } else {
      // Show toast message (use your existing toast)
      toast.error(
        'Please pay first to view treatment details.',
      );
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
          <Image source={{ uri: item.doctor.profile_picture }} style={styles.doctorImage} />
        </View>
      )}
      <Text style={styles.doctorName}>Doctor: {item.doctor?.full_name || "Unknown"}</Text>
      <Text style={styles.doctorDetail}>Specialization: {item.doctor?.specialization || "N/A"}</Text>
      <Text style={styles.doctorDetail}>SubSpecialization: {item.doctor?.sub_specialization || "N/A"}</Text>
      <Text style={styles.doctorDetail}>Experience: {item.doctor?.experience ? `${item.doctor.experience} years` : "N/A"}</Text>

      {/* List Treatments for this Doctor */}
      <Text style={styles.treatmentTitle}>Treatments:</Text>
      {item.treatments.map((treatment) => (
        <View key={treatment._id} style={styles.treatmentItem}>
          <Text style={styles.itemName}>• {treatment.diagnosis || "N/A"}</Text>
          <Text style={styles.itemDetail}>Status: {treatment.status || "N/A"}</Text>
          <TouchableOpacity style={styles.button} onPress={() => openModal(treatment)}>
            <Text style={styles.buttonText}>View Details</Text>
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
      <FlatList
        data={groupedTreatments}
        keyExtractor={(item, index) => item.doctor?._id || `unknown-${index}`}
        renderItem={renderDoctorGroup}
        contentContainerStyle={{ padding: 16 }}
      />

      {/* Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView>
              <Text style={styles.modalTitle}>Treatment Details</Text>
              {selectedTreatment ? (
                <>
                  <Text>Diagnosis: {selectedTreatment.diagnosis || 'N/A'}</Text>
                  <Text>Status: {selectedTreatment.status || 'N/A'}</Text>
                  <Text>Type: {selectedTreatment.type || 'N/A'}</Text>
                  <Text>Is Follow Up: {selectedTreatment.isFollowUp ? "Yes" : "No"}</Text>
                  <Text>Empty Stomach: {selectedTreatment.isEmptyStomach ? "Yes" : "No"}</Text>
                  <Text style={styles.modalSubTitle}>Treatment Items:</Text>
                  {selectedTreatment.treatmentItems && selectedTreatment.treatmentItems.length > 0 ? (
                    selectedTreatment.treatmentItems.map((item, idx) => (
                      <View key={idx} style={styles.treatmentItem}>
                        <Text style={styles.itemName}>• {item.name || 'N/A'}</Text>
                        <Text style={styles.itemDetail}>Description: {item.description || 'N/A'}</Text>
                        <Text style={styles.itemDetail}>Quantity: {item.quantity || 'N/A'}</Text>
                        <Text style={styles.itemDetail}>Frequency: {item.frequency || 'N/A'}</Text>
                        <Text style={styles.itemDetail}>Duration: {item.duration || 'N/A'}</Text>
                        <Text style={styles.itemDetail}>Instructions: {item.instructions || 'N/A'}</Text>
                      </View>
                    ))
                  ) : (
                    <Text>No treatment items available</Text>
                  )}
                </>
              ) : (
                <Text>Loading treatment details...</Text>
              )}
              <Pressable style={styles.closeButton} onPress={closeModal}>
                <Text style={styles.buttonText}>Close</Text>
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
    alignItems: 'center',
    marginBottom: 10,
  },
  doctorImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    resizeMode: 'cover',
  },
  doctorName: {
    fontSize: 16,
    marginBottom: 4,
    fontWeight: "bold",
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
