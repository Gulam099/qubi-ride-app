import React, { useState, useRef, useEffect } from "react";
import { View, Text, FlatList } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import FamilyMemberCard from "@/features/family/components/FamilyMemberCard";
import { toast } from "sonner-native";
import { FamilyFormType, FamilyType } from "@/features/family/types/FamilyType";
import { Label } from "@/components/ui/Label";
import { useUser } from "@clerk/clerk-expo";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { X } from "lucide-react-native";
import { ApiUrl } from "@/const";
import axios from "axios";

function FamilyPage() {
  const { user } = useUser();
  const phoneNumber = user?.phoneNumbers?.[0]?.phoneNumber?.replace("+91", "");
  const [familyMembers, setFamilyMembers] = useState<FamilyType[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentMember, setCurrentMember] = useState<FamilyType | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FamilyFormType>();

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

  return (
    <View className="p-4 bg-blue-50/10 h-full flex flex-col gap-4">
      {familyMembers.length === 0 ? (
        <Text className="font-semibold text-center mt-[80%]">
          No Family Member Added
        </Text>
      ) : (
        <FlatList
          data={familyMembers?.family}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ gap: 16, padding: 16 }}
          renderItem={({ item }) => (
            <FamilyMemberCard
              item={item}
              handleEdit={() => handleEdit(item)}
              handleDelete={() => handleDelete(item)}
            />
          )}
        />
      )}

      <Button
        className="mt-4 w-full"
        onPress={() => {
          reset();
          setIsEditing(false);
          setCurrentMember(null);
          AddFamilyMemberFormBottomSheetRef.current?.expand();
        }}
      >
        <Text className="text-white font-medium">Add a new member</Text>
      </Button>

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
                AddFamilyMemberFormBottomSheetRef.current?.close();
              }}
            >
              <X size={20} color="#262626" />
            </Button>

            {[
              {
                label: "Name",
                name: "name",
                placeholder: "Name",
              },
              {
                label: "Id Number",
                name: "idNumber",
                placeholder: "54674832465854",
              },
              {
                label: "Age",
                name: "age",
                placeholder: "Example: 12 years old",
                isNumeric: true,
              },
              {
                label: "File Number",
                name: "fileNo",
                placeholder: "Example: 13234345",
              },
              {
                label: "Relative Relation",
                name: "relationship",
                placeholder: "Example: Mother",
              },
            ].map(({ label, name, placeholder, isNumeric }) => (
              <View key={name}>
                <Label>{label}</Label>
                <Controller
                  name={name as keyof FamilyFormType}
                  control={control}
                  rules={{ required: `${label} is required` }}
                  render={({ field: { onChange, value } }) => (
                    <Input
                      placeholder={placeholder}
                      value={isNumeric ? value?.toString() : value}
                      onChangeText={(text) =>
                        isNumeric ? onChange(Number(text)) : onChange(text)
                      }
                      className="mb-3"
                      keyboardType={isNumeric ? "numeric" : "default"}
                    />
                  )}
                />
                {errors?.[name as keyof FamilyFormType] && (
                  <Text className="text-red-500">
                    {
                      errors?.[name as keyof FamilyFormType]
                        ?.message as string
                    }
                  </Text>
                )}
              </View>
            ))}

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
