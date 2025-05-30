// screens/TreatmentsListScreen.js
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
} from "react-native";
import axios from "axios";
import { useUser } from "@clerk/clerk-expo";
import { ApiUrl } from "@/const";

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

  console.log('treatments', treatments);

  const openModal = (treatment) => {
    setSelectedTreatment(treatment);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedTreatment(null);
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.doctorName}>
        Doctor: {item.doctorId?.full_name} ({item.doctorId?.specialization})
      </Text>

      <TouchableOpacity style={styles.button} onPress={() => openModal(item)}>
        <Text style={styles.buttonText}>View Treatment</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return <ActivityIndicator size="large" style={{ marginTop: 40 }} />;
  }

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={treatments}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
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
  doctorName: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: "bold",
  },
  button: {
    backgroundColor: "#007bff",
    padding: 10,
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
});