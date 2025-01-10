import React, { useState, useEffect } from "react";
import { View, Text, FlatList } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import FamilyMemberCard from "@/features/family/components/FamilyMemberCard";
import { z } from "zod";
import { toast } from "sonner-native";
import { apiBaseUrl } from "@/features/Home/constHome";
import { useSelector } from "react-redux";
import { FamilyFormType, FamilyType } from "@/features/family/types/FamilyType";

function FamilyPage() {
  const [familyMembers, setFamilyMembers] = useState<FamilyType[]>([]);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentMember, setCurrentMember] = useState<FamilyType | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FamilyType>();

  const userPhoneNumber = useSelector((state: any) => state.user.phoneNumber);

  useEffect(() => {
    fetchFamilyMembers();
  }, []);

  const fetchFamilyMembers = async () => {
    try {
      const response = await fetch(
        `${apiBaseUrl}/api/user/${userPhoneNumber}/family`
      );
      const result = await response.json();
      if (response.ok) {
        setFamilyMembers(result.family || []);
      } else {
        toast.error(result.message || "Failed to fetch family members");
      }
    } catch (error) {
      console.error("Error fetching family members:", error);
      toast.error("Error fetching family members");
    }
  };

  const onSubmit = async (data: FamilyFormType) => {
    try {
      const payload = {
        ...data,
        phoneNumber: userPhoneNumber,
      };
      const response = await fetch(`${apiBaseUrl}/api/add-family-member`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const result = await response.json();

      if (response.ok) {
        toast.success("Family member added successfully");
        fetchFamilyMembers();
        setIsFormVisible(false);
        setIsEditing(false);
        setCurrentMember(null);
        reset();
      } else {
        toast.error(result.message || "Failed to add family member");
      }
    } catch (error) {
      console.error("Error adding family member:", error);
      toast.error("Error adding family member");
    }
  };

  const handleEdit = (member: FamilyType) => {
    setCurrentMember(member);
    setIsEditing(true);
    setIsFormVisible(true);
    reset(member);
  };

  return (
    <View className="p-4 bg-blue-50/10 h-full flex flex-col gap-4">
      {!isFormVisible ? (
        <>
          <FlatList
            data={familyMembers}
            keyExtractor={(item) => item._id}
            contentContainerClassName="gap-4"
            renderItem={({ item }) => (
              <FamilyMemberCard
                item={item}
                handleEdit={() => handleEdit(item)}
                handleDelete={() => console.warn("Delete not implemented")}
              />
            )}
          />
          <Button
            className="bg-purple-500 mt-4"
            onPress={() => setIsFormVisible(true)}
          >
            <Text className="text-white font-medium">Add a new member</Text>
          </Button>
        </>
      ) : (
        <View className="p-4 bg-white rounded-2xl shadow-md h-full">
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
          {errors.name && (
            <Text className="text-red-500">{errors.name.message}</Text>
          )}

          <Controller
            name="age"
            control={control}
            rules={{ required: "Age is required" }}
            render={({ field: { onChange, value } }) => (
              <Input
                placeholder="Age"
                value={value?.toString()}
                onChangeText={(text) => onChange(Number(text))}
                className="mb-3"
                keyboardType="numeric"
              />
            )}
          />
          {errors.age && (
            <Text className="text-red-500">{errors.age.message}</Text>
          )}

          <Controller
            name="fileNo"
            control={control}
            rules={{ required: "File Number is required" }}
            render={({ field: { onChange, value } }) => (
              <Input
                placeholder="File Number"
                value={value}
                onChangeText={onChange}
                className="mb-3"
              />
            )}
          />
          {errors.fileNo && (
            <Text className="text-red-500">{errors.fileNo.message}</Text>
          )}

          <Controller
            name="relationship"
            control={control}
            rules={{ required: "Relationship is required" }}
            render={({ field: { onChange, value } }) => (
              <Input
                placeholder="Relationship"
                value={value}
                onChangeText={onChange}
                className="mb-3"
              />
            )}
          />
          {errors.relationship && (
            <Text className="text-red-500">{errors.relationship.message}</Text>
          )}

          <Button className=" mt-4" onPress={handleSubmit(onSubmit)}>
            <Text className="text-white font-medium">
              {isEditing ? "Update" : "Add"}
            </Text>
          </Button>
          <Button
            className=" mt-4"
            variant="ghost"
            onPress={() => {
              setIsFormVisible(false);
              reset();
              setIsEditing(false);
              setCurrentMember(null);
            }}
          >
            <Text className=" font-medium">Cancel</Text>
          </Button>
        </View>
      )}
    </View>
  );
}

export default FamilyPage;
