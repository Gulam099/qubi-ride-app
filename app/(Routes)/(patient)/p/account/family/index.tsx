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
import { Label } from "@/components/ui/Label";

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
  } = useForm<FamilyFormType>();

  const userPhoneNumber = useSelector((state: any) => state.user.phoneNumber);

  useEffect(() => {
    fetchFamilyMembers();
  }, []);

  // Fetch family members
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

  // Add or edit a family member
  const onSubmit = async (data: FamilyFormType) => {
    try {
      const payload = {
        ...data,
        phoneNumber: userPhoneNumber,
        familyMemberId: currentMember?._id || undefined,
      };

      const url = isEditing
        ? `${apiBaseUrl}/api/edit-family-member`
        : `${apiBaseUrl}/api/add-family-member`;

      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(
          isEditing
            ? "Family member updated successfully"
            : "Family member added successfully"
        );
        fetchFamilyMembers();
        setIsFormVisible(false);
        setIsEditing(false);
        setCurrentMember(null);
        reset();
      } else {
        toast.error(result.message || "Failed to save family member");
      }
    } catch (error) {
      console.error("Error saving family member:", error);
      toast.error("Error saving family member");
    }
  };

  // Delete a family member
  const handleDelete = async (id: string) => {
    try {
      const payload = {
        phoneNumber: userPhoneNumber,
        familyMemberId: id,
      };

      const response = await fetch(`${apiBaseUrl}/api/delete-family-member`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success("Family member deleted successfully");
        fetchFamilyMembers();
      } else {
        toast.error(result.message || "Failed to delete family member");
      }
    } catch (error) {
      console.error("Error deleting family member:", error);
      toast.error("Error deleting family member");
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
        <View className="flex justify-center items-center h-full">
          {familyMembers.length === 0 ? (
            <Text className="font-semibold">No Family Member Added</Text>
          ) : (
            <FlatList
              data={familyMembers}
              keyExtractor={(item) => item._id}
              contentContainerClassName="gap-4"
              renderItem={({ item }) => (
                <FamilyMemberCard
                  item={item}
                  handleEdit={() => handleEdit(item)}
                  handleDelete={() => handleDelete(item._id)}
                />
              )}
            />
          )}
          <Button
            className="bg-purple-500 mt-4 w-full"
            onPress={() => setIsFormVisible(true)}
          >
            <Text className="text-white font-medium">Add a new member</Text>
          </Button>
        </View>
      ) : (
        <View className="p-4 bg-white rounded-2xl shadow-md h-full">
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
          {errors.name && (
            <Text className="text-red-500">{errors.name.message}</Text>
          )}

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
          {errors.idNumber && (
            <Text className="text-red-500">{errors.idNumber.message}</Text>
          )}

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
          {errors.age && (
            <Text className="text-red-500">{errors.age.message}</Text>
          )}

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
          {errors.fileNo && (
            <Text className="text-red-500">{errors.fileNo.message}</Text>
          )}

          <Label>Relative Relation</Label>
          <Controller
            name="relationship"
            control={control}
            rules={{ required: "Relationship is required" }}
            render={({ field: { onChange, value } }) => (
              <Input
                placeholder="Example: Mother"
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
