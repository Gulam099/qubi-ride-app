import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView, Image, Platform, Alert
} from 'react-native';
import { CheckBox } from 'react-native-elements';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useUser } from '@clerk/clerk-expo';
import { apiNewUrl } from '@/const';
import { toast } from 'sonner-native';

interface TreatmentItem {
  name: string;
  description?: string;
  quantity?: string;
  frequency?: string;
  duration?: string;
  isEmptyStomach?: boolean;
}

interface CreateTreatmentDialogProps {
  patientId: string;
  onCancel: () => void;
  onSuccess: () => void;
}

const CreateTreatmentDialog: React.FC<CreateTreatmentDialogProps> = ({
  patientId,
  onCancel,
  onSuccess
}) => {
  const { user } = useUser();
  const doctorId = user?.publicMetadata?.dbUserId as string;

  const [treatmentItems, setTreatmentItems] = useState<TreatmentItem[]>([{
    name: '',
    description: '',
    quantity: '',
    frequency: '',
    duration: '',
    isEmptyStomach: false,
  }]);

  const [image, setImage] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [date, setDate] = useState(new Date());
  const [formData, setFormData] = useState({
    type: '',
    status: 'in progress',
    diagnosis: '',
    isFollowUp: false,
    followUpDate: '',
  });

  const handleTreatmentItemChange = (index: number, field: keyof TreatmentItem, value: any) => {
    const updated = [...treatmentItems];
    updated[index][field] = value;
    setTreatmentItems(updated);
  };

  const addTreatmentItem = () => {
    setTreatmentItems([...treatmentItems, {
      name: '',
      description: '',
      quantity: '',
      frequency: '',
      duration: '',
      isEmptyStomach: false,
    }]);
  };

  const removeTreatmentItem = (index: number) => {
    if (treatmentItems.length > 1) {
      setTreatmentItems(treatmentItems.filter((_, i) => i !== index));
    }
  };

  const pickImageOrCamera = async () => {
    Alert.alert(
      'Select Image',
      'Choose an option',
      [
        {
          text: 'Camera',
          onPress: async () => {
            const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
            if (!permissionResult.granted) {
              Alert.alert('Permission required', 'We need permission to access your camera');
              return;
            }

            const result = await ImagePicker.launchCameraAsync({
              allowsEditing: true,
              aspect: [4, 3],
              quality: 1,
            });

            if (!result.canceled) setImage(result.assets[0].uri);
          },
        },
        {
          text: 'Gallery',
          onPress: async () => {
            const result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              allowsEditing: true,
              aspect: [4, 3],
              quality: 1,
            });
            if (!result.canceled) setImage(result.assets[0].uri);
          },
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ],
      { cancelable: true }
    );
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    const current = selectedDate || date;
    setShowDatePicker(Platform.OS === 'ios');
    setDate(current);
    setFormData({ ...formData, followUpDate: current.toISOString().split('T')[0] });
  };

  const handleCreateTreatment = async () => {
    if (!doctorId || !patientId) {
      Alert.alert('Error', 'Doctor or Patient information missing.');
      return;
    }

    try {
      const payload = {
        doctorId,
        patientId,
        createdBy: doctorId,
        type: formData.type || 'other',
        status: formData.status,
        diagnosis: formData.diagnosis,
        treatmentItems,
        photo: image,
        isFollowUp: formData.isFollowUp,
        followUpDate: formData.followUpDate,
      };

      const response = await fetch(`${apiNewUrl}/api/treatments/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast.success('Treatment created successfully.');

        // Reset the form
        setTreatmentItems([{
          name: '',
          description: '',
          quantity: '',
          frequency: '',
          duration: '',
          isEmptyStomach: false,
        }]);
        setImage(null);
        setFormData({
          type: '',
          status: 'in progress',
          diagnosis: '',
          isFollowUp: false,
          followUpDate: '',
        });
        setDate(new Date());
        setShowDatePicker(false);

        // Notify parent component
        onSuccess();
      } else {
        const error = await response.json();
        Alert.alert('Error', error.message || 'Failed to create treatment.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Something went wrong.');
    }
  };

  return (
    <ScrollView className="bg-white px-4 pt-10">
      <View className="mb-4">
        <Text className="text-lg font-bold text-violet-700 mb-4">Create Treatment</Text>

        {treatmentItems.map((item, index) => (
          <View key={index} className="mb-4 border-b border-violet-300 pb-3">
            <TextInput
              className="border border-violet-300 rounded-lg p-2 mb-2"
              placeholder="Medication Name"
              value={item.name}
              onChangeText={text => handleTreatmentItemChange(index, 'name', text)}
            />
            <TextInput
              className="border border-violet-300 rounded-lg p-2 mb-2"
              placeholder="Description"
              value={item.description}
              onChangeText={text => handleTreatmentItemChange(index, 'description', text)}
            />
            <TextInput
              className="border border-violet-300 rounded-lg p-2 mb-2"
              placeholder="Dosage"
              value={item.quantity}
              onChangeText={text => handleTreatmentItemChange(index, 'quantity', text)}
            />
            <TextInput
              className="border border-violet-300 rounded-lg p-2 mb-2"
              placeholder="Frequency"
              value={item.frequency}
              onChangeText={text => handleTreatmentItemChange(index, 'frequency', text)}
            />
            <TextInput
              className="border border-violet-300 rounded-lg p-2 mb-2"
              placeholder="Duration"
              value={item.duration}
              onChangeText={text => handleTreatmentItemChange(index, 'duration', text)}
            />
            <CheckBox
              title="Empty Stomach"
              checked={item.isEmptyStomach}
              onPress={() => handleTreatmentItemChange(index, 'isEmptyStomach', !item.isEmptyStomach)}
              containerStyle={{ backgroundColor: 'transparent', borderWidth: 0 }}
              textStyle={{ color: '#6B46C1' }}
            />
            {treatmentItems.length > 1 && (
              <TouchableOpacity onPress={() => removeTreatmentItem(index)} className="bg-red-600 p-2 rounded-lg mt-2">
                <Text className="text-white text-center">Remove</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}

        <TouchableOpacity onPress={addTreatmentItem} className="border border-violet-700 p-3 rounded-lg items-center my-3">
          <Text className="text-violet-700">Add More Medications</Text>
        </TouchableOpacity>

        <TextInput
          className="border border-violet-300 rounded-lg p-2 mb-3"
          placeholder="Diagnosis"
          value={formData.diagnosis}
          onChangeText={text => setFormData({ ...formData, diagnosis: text })}
        />

        <TouchableOpacity onPress={pickImageOrCamera} className="border border-violet-700 p-3 rounded-lg items-center my-3">
          <Text className="text-violet-700">Pick Image (Camera/Gallery) </Text>
        </TouchableOpacity>

        {image && <Image source={{ uri: image }} className="w-full h-40 mt-2 rounded-lg" resizeMode="cover" />}

        <View className="flex flex-row justify-between mt-6 mb-10">
          <TouchableOpacity
            onPress={onCancel}
            className="border border-red-500 rounded-full px-6 py-2"
          >
            <Text className="text-red-500">Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleCreateTreatment}
            className="bg-violet-700 rounded-full px-6 py-2"
          >
            <Text className="text-white">Create Treatment</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

export default CreateTreatmentDialog;