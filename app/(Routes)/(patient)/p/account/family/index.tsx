import React, { useState, useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";
import FamilyMemberCard from "@/features/family/components/FamilyMemberCard";

function FamilyPage() {
  const [familyMembers, setFamilyMembers] = useState<
    {
      id: string;
      name: string;
      age: string;
      fileNumber: string;
      relationship: string;
    }[]
  >([]);

  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentMember, setCurrentMember] = useState<
    | {
        id: string;
        name: string;
        age: string;
        fileNumber: string;
        relationship: string;
      }
    | undefined
  >(undefined);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    // Fetch family members from API (demo data for now)
    const fetchMembers = async () => {
      const demoMembers = [
        {
          id: "1",
          name: "Rima Majid Majid",
          age: "15 years",
          fileNumber: "32675356",
          relationship: "Mother",
        },
        {
          id: "2",
          name: "Ali Ahmed",
          age: "40 years",
          fileNumber: "12345678",
          relationship: "Father",
        },
      ];
      setFamilyMembers(demoMembers);
    };

    fetchMembers();
  }, []);

  const onSubmit = (data: any) => {
    if (isEditing) {
      // Update existing member
      setFamilyMembers((prev) =>
        prev.map((member) =>
          member.id === currentMember?.id
            ? { ...currentMember, ...data }
            : member
        )
      );
    } else {
      // Add new member
      setFamilyMembers((prev) => [
        ...prev,
        { id: Date.now().toString(), ...data },
      ]);
    }

    reset();
    setIsFormVisible(false);
    setIsEditing(false);
    setCurrentMember(undefined);
  };

  const handleEdit = (member: any) => {
    setCurrentMember(member);
    setIsEditing(true);
    setIsFormVisible(true);
    reset(member);
  };

  const handleDelete = (id: any) => {
    setFamilyMembers((prev) => prev.filter((member) => member.id !== id));
  };

  return (
    <View className="p-4 bg-blue-50/10 h-full flex flex-col gap-4">
      {!isFormVisible ? (
        <>
          <FlatList
            data={familyMembers}
            keyExtractor={(item) => item.id}
            contentContainerClassName="gap-4"
            renderItem={({ item }) => (
              <FamilyMemberCard
                item={item}
                handleEdit={() => handleEdit(item)}
                handleDelete={() => handleDelete(item.id)}
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
            <Text className="text-red-500">
              {errors.name.message?.toString()}
            </Text>
          )}

          <Controller
            name="age"
            control={control}
            rules={{ required: "Age is required" }}
            render={({ field: { onChange, value } }) => (
              <Input
                placeholder="Age"
                value={value}
                onChangeText={onChange}
                className="mb-3"
              />
            )}
          />
          {errors.age && (
            <Text className="text-red-500">
              {errors.age.message?.toString()}
            </Text>
          )}

          <Controller
            name="fileNumber"
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
          {errors.fileNumber && (
            <Text className="text-red-500">
              {errors.fileNumber.message?.toString()}
            </Text>
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
            <Text className="text-red-500">
              {errors.relationship.message?.toString()}
            </Text>
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
              setCurrentMember(undefined);
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
