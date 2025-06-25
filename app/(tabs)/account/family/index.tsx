import React, { useState, useRef, useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import FamilyMemberCard from "@/features/family/components/FamilyMemberCard";
import { toast } from "sonner-native";
import { FamilyFormType, FamilyType } from "@/features/family/types/FamilyType";
import { Label } from "@/components/ui/Label";
import { useUser } from "@clerk/clerk-expo";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { X, ChevronDown } from "lucide-react-native";
import { ApiUrl } from "@/const";
import axios from "axios";

const relationshipOptions = [
  { label: "Spouse", value: "spouse" },
  { label: "Son", value: "son" },
  { label: "Daughter", value: "daughter" },
];

function FamilyPage() {
  const { user } = useUser();
  const phoneNumber = user?.phoneNumbers?.[0]?.phoneNumber;
  const [familyMembers, setFamilyMembers] = useState<FamilyType[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentMember, setCurrentMember] = useState<FamilyType | null>(null);
  const [showRelationshipDropdown, setShowRelationshipDropdown] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FamilyFormType>();

  const relationshipValue = watch("relationship");
  const AddFamilyMemberFormBottomSheetRef = useRef<BottomSheet>(null);

  useEffect(() => {
    if (phoneNumber) fetchFamilyMembers();
  }, [phoneNumber]);

  const fetchFamilyMembers = async () => {
    try {
      const res = await axios.get(`${ApiUrl}/api/user/${phoneNumber}/family`);
      setFamilyMembers(res.data);

      if (user) {
        await user.update({
          unsafeMetadata: {
            ...user.unsafeMetadata,
            family: res.data,
          },
        });
      }
    } catch (error) {
      console.error("Failed to fetch family members:", error);
      toast.error("Error fetching family members");
    }
  };

  const onSubmit = async (data: FamilyFormType) => {
    try {
      if (!phoneNumber || !user) return;

      if (isEditing && currentMember?._id) {
        await axios.put(`${ApiUrl}/api/edit-family-member`, {
          ...data,
          phoneNumber,
          familyMemberId: currentMember._id,
        });
        toast.success("Family member updated successfully");
      } else {
        await axios.post(`${ApiUrl}/api/add-family-member`, {
          ...data,
          phoneNumber,
        });
        toast.success("Family member added successfully");
      }

      const res = await axios.get(`${ApiUrl}/api/user/${phoneNumber}/family`);
      setFamilyMembers(res.data);

      await user.update({
        unsafeMetadata: {
          ...user.unsafeMetadata,
          family: res.data,
        },
      });

      reset();
      setIsEditing(false);
      setCurrentMember(null);
      setShowRelationshipDropdown(false);
      AddFamilyMemberFormBottomSheetRef.current?.close();
    } catch (error) {
      console.error("Error saving family member:", error);
      toast.error("Error saving family member");
    }
  };

  const handleDelete = async (item: FamilyType) => {
    try {
      if (!phoneNumber || !user) return;

      await axios.post(`${ApiUrl}/api/delete-family-member`, {
        phoneNumber,
        familyMemberId: item._id,
      });

      const res = await axios.get(`${ApiUrl}/api/user/${phoneNumber}/family`);
      setFamilyMembers(res.data);

      await user.update({
        unsafeMetadata: {
          ...user.unsafeMetadata,
          family: res.data,
        },
      });

      toast.success("Deleted family member");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete family member");
    }
  };

  const handleEdit = (member: FamilyType) => {
    setCurrentMember(member);
    setIsEditing(true);
    reset(member);
    AddFamilyMemberFormBottomSheetRef.current?.expand();
  };

  const handleRelationshipSelect = (value: string) => {
    setValue("relationship", value);
    setShowRelationshipDropdown(false);
  };

  const ListHeaderComponent = () => (
    <Button
      className="mb-4 w-full"
      onPress={() => {
        reset();
        setIsEditing(false);
        setCurrentMember(null);
        setShowRelationshipDropdown(false);
        AddFamilyMemberFormBottomSheetRef.current?.expand();
      }}
    >
      <Text className="text-white font-medium">Add a new member</Text>
    </Button>
  );

  const ListEmptyComponent = () => (
    <View className="flex-1 justify-center items-center mt-20">
      <Text className="font-semibold text-center">
        No Family Member Added
      </Text>
    </View>
  );

  const renderFamilyMember = ({ item }: { item: FamilyType }) => (
    <FamilyMemberCard
      item={item}
      handleEdit={() => handleEdit(item)}
      handleDelete={() => handleDelete(item)}
    />
  );

  return (
    <View className="flex-1 bg-blue-50/10">
      <FlatList
        data={familyMembers?.family || []}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ 
          padding: 16, 
          gap: 16,
          flexGrow: 1 
        }}
        renderItem={renderFamilyMember}
        ListHeaderComponent={ListHeaderComponent}
        ListEmptyComponent={ListEmptyComponent}
        showsVerticalScrollIndicator={false}
      />

      <BottomSheet
        ref={AddFamilyMemberFormBottomSheetRef}
        index={-1}
        enablePanDownToClose
        snapPoints={["70%", "100%"]}
      >
        <BottomSheetView className="w-full flex-1 bg-white">
          <View className="flex flex-col w-full gap-4 p-6 pt-12">
            <Button
              size="icon"
              variant="ghost"
              className="absolute top-2 right-2 rounded-full"
              onPress={() => {
                reset();
                setIsEditing(false);
                setCurrentMember(null);
                setShowRelationshipDropdown(false);
                AddFamilyMemberFormBottomSheetRef.current?.close();
              }}
            >
              <X size={20} color="#262626" />
            </Button>

            {/* Name Field */}
            <View>
              <Label>Name</Label>
              <Controller
                name="name"
                control={control}
                rules={{ required: "Name is required" }}
                render={({ field: { onChange, value } }) => (
                  <Input
                    placeholder="Name"
                    value={value}
                    onChangeText={onChange}
                    className="mb-3"
                  />
                )}
              />
              {errors?.name && (
                <Text className="text-red-500">{errors.name.message}</Text>
              )}
            </View>

            {/* ID Number Field */}
            <View>
              <Label>Id Number</Label>
              <Controller
                name="idNumber"
                control={control}
                rules={{ required: "Id Number is required" }}
                render={({ field: { onChange, value } }) => (
                  <Input
                    placeholder="54674832465854"
                    value={value}
                    onChangeText={onChange}
                    className="mb-3"
                  />
                )}
              />
              {errors?.idNumber && (
                <Text className="text-red-500">{errors.idNumber.message}</Text>
              )}
            </View>

            {/* Age Field */}
            <View>
              <Label>Age</Label>
              <Controller
                name="age"
                control={control}
                rules={{ required: "Age is required" }}
                render={({ field: { onChange, value } }) => (
                  <Input
                    placeholder="Example: 12 years old"
                    value={value?.toString()}
                    onChangeText={(text) => onChange(Number(text))}
                    className="mb-3"
                    keyboardType="numeric"
                  />
                )}
              />
              {errors?.age && (
                <Text className="text-red-500">{errors.age.message}</Text>
              )}
            </View>

            {/* File Number Field */}
            <View>
              <Label>File Number</Label>
              <Controller
                name="fileNo"
                control={control}
                rules={{ required: "File Number is required" }}
                render={({ field: { onChange, value } }) => (
                  <Input
                    placeholder="Example: 13234345"
                    value={value}
                    onChangeText={onChange}
                    className="mb-3"
                  />
                )}
              />
              {errors?.fileNo && (
                <Text className="text-red-500">{errors.fileNo.message}</Text>
              )}
            </View>

            {/* Relationship Dropdown Field */}
            <View>
              <Label>Relative Relation</Label>
              <Controller
                name="relationship"
                control={control}
                rules={{ required: "Relationship is required" }}
                render={({ field: { onChange, value } }) => (
                  <View className="relative">
                    <TouchableOpacity
                      onPress={() => setShowRelationshipDropdown(!showRelationshipDropdown)}
                      className="border border-gray-300 rounded-md p-3 mb-3 flex-row justify-between items-center bg-white"
                    >
                      <Text className={`${value ? 'text-black' : 'text-gray-400'}`}>
                        {value ? relationshipOptions.find(opt => opt.value === value)?.label : "Select relationship"}
                      </Text>
                      <ChevronDown size={20} color="#666" />
                    </TouchableOpacity>
                    
                    {showRelationshipDropdown && (
                      <View className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-md shadow-lg z-50">
                        {relationshipOptions.map((option) => (
                          <TouchableOpacity
                            key={option.value}
                            onPress={() => handleRelationshipSelect(option.value)}
                            className="p-3 border-b border-gray-100 last:border-b-0"
                          >
                            <Text className="text-black">{option.label}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                  </View>
                )}
              />
              {errors?.relationship && (
                <Text className="text-red-500">{errors.relationship.message}</Text>
              )}
            </View>

            <Button className="mt-4" onPress={handleSubmit(onSubmit)}>
              <Text className="text-white font-medium">
                {isEditing ? "Update" : "Add"}
              </Text>
            </Button>
          </View>
        </BottomSheetView>
      </BottomSheet>
    </View>
  );
}

export default FamilyPage;