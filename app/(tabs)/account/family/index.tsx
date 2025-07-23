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
import BottomSheet, { BottomSheetScrollView, BottomSheetView } from "@gorhom/bottom-sheet";
import { X, ChevronDown } from "lucide-react-native";
import { ApiUrl } from "@/const";
import axios from "axios";
import { useTranslation } from "react-i18next";

function FamilyPage() {
  const { t } = useTranslation();

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

  const relationshipOptions = [
 { label: t("spouse"), value: "spouse" },
  { label: t("son"), value: "son" },
  { label: t("daughter"), value: "daughter" },
];
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
        toast.success(t("familyUpdated"));
      } else {
        await axios.post(`${ApiUrl}/api/add-family-member`, {
          ...data,
          phoneNumber,
        });
        toast.success(t("familyAdded"));
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
      toast.error(t("familySaveError"));
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

      toast.success(t("familyDeleted"));
    } catch (error) {
      console.error("Delete error:", error);
      toast.error(t("familyDeleteError"));
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

  const ListFooterComponent = () => (
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
      <Text className="text-white font-medium">{t("addNewMember")}</Text>
    </Button>
  );

  const ListEmptyComponent = () => (
    <View className="flex-1 justify-center items-center mt-20">
      <Text className="font-semibold text-center">
       {t("noFamilyMembers")}
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
        ListFooterComponent={ListFooterComponent}
        ListEmptyComponent={ListEmptyComponent}
        showsVerticalScrollIndicator={false}
      />

      <BottomSheet
        ref={AddFamilyMemberFormBottomSheetRef}
        index={-1}
        enablePanDownToClose
        snapPoints={["70%", "100%"]}
      >
        <BottomSheetScrollView className="w-full flex-1 bg-white">
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
              <Label>{t("name")}</Label>
              <Controller
                name="name"
                control={control}
                rules={{ required:  t("nameRequired") }}
                render={({ field: { onChange, value } }) => (
                  <Input
                    placeholder={t("namePlaceholder")}
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
              <Label>{t("idNumber")}</Label>
              <Controller
                name="idNumber"
                control={control}
                rules={{ required: t("idNumberRequired") }}
                render={({ field: { onChange, value } }) => (
                  <Input
                    placeholder={t("idPlaceholder")}
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
              <Label>{t("age")}</Label>
              <Controller
                name="age"
                control={control}
                rules={{ required: t("ageRequired") }}
                render={({ field: { onChange, value } }) => (
                  <Input
                    placeholder={t("agePlaceholder")}
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
              <Label>{t("fileNumber")}</Label>
              <Controller
                name="fileNo"
                control={control}
                rules={{ required: t("fileNumberRequired") }}
                render={({ field: { onChange, value } }) => (
                  <Input
                    placeholder={t("filePlaceholder")}
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
              <Label>{t("relationship")}</Label>
              <Controller
                name="relationship"
                control={control}
                rules={{ required: t("relationshipRequired") }}
                render={({ field: { onChange, value } }) => (
                  <View className="relative">
                    <TouchableOpacity
                      onPress={() => setShowRelationshipDropdown(!showRelationshipDropdown)}
                      className="border border-gray-300 rounded-md p-3 mb-3 flex-row justify-between items-center bg-white"
                    >
                      <Text className={`${value ? 'text-black' : 'text-gray-400'}`}>
                        {value ? relationshipOptions.find(opt => opt.value === value)?.label :  t("selectRelationship")}
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
               {isEditing ? t("update") : t("add")}
              </Text>
            </Button>
          </View>
        </BottomSheetScrollView>
      </BottomSheet>
    </View>
  );
}

export default FamilyPage;