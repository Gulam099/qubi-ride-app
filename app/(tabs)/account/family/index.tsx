import React, { useState, useRef } from "react";
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

function FamilyPage() {
  const { user } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [currentMember, setCurrentMember] = useState<FamilyType | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FamilyFormType>();

  const familyMembers: FamilyType[] =
    (user?.unsafeMetadata.family as FamilyType[]) ?? [];

  const AddFamilyMemberFormBottomSheetRef = useRef<BottomSheet>(null);

  // Add or edit a family member
  const onSubmit = async (data: FamilyFormType) => {
    try {
      await user?.update({
        unsafeMetadata: {
          ...user?.unsafeMetadata,
          family: [
            ...((user?.unsafeMetadata?.family as FamilyType[]) || []),
            data,
          ], // Append to existing array
        },
      });

      toast.success(
        isEditing
          ? "Family member updated successfully"
          : "Family member added successfully"
      );

      setIsEditing(false);
      setCurrentMember(null);
      reset();
      AddFamilyMemberFormBottomSheetRef.current?.close();
    } catch (error) {
      console.error("Error saving family member:", error);
      toast.error("Error saving family member");
    }
  };

  // Delete a family member
  const handleDelete = async (id: string) => {
    try {
      if (!user) return;

      // Filter out the family member with the given _id
      const updatedFamily = familyMembers.filter(
        (member: any) => member.idNumber !== id
      );

      // Update the Clerk user metadata
      await user.update({
        unsafeMetadata: {
          ...user.unsafeMetadata,
          family: updatedFamily, // Set updated family list
        },
      });

      toast.success("Family member deleted successfully");
    } catch (error) {
      console.error("Error deleting family member:", error);
      toast.error("Error deleting family member");
    }
  };

  const handleEdit = (member: FamilyType) => {
    setCurrentMember(member);
    setIsEditing(true);
    AddFamilyMemberFormBottomSheetRef.current?.expand();
    reset(member);
  };

  return (
    <View className="p-4 bg-blue-50/10 h-full flex flex-col gap-4">
      {familyMembers.length === 0 ? (
        <Text className="font-semibold text-center mt-[80%]">
          No Family Member Added
        </Text>
      ) : (
        <FlatList
          data={familyMembers}
          keyExtractor={(item) => item.idNumber}
          contentContainerClassName="gap-4"
          renderItem={({ item }) => (
            <FamilyMemberCard
              item={item}
              handleEdit={() => handleEdit(item)}
              handleDelete={() => handleDelete(item.idNumber)}
            />
          )}
        />
      )}
      <Button
        className="mt-4 w-full"
        onPress={() => AddFamilyMemberFormBottomSheetRef.current?.expand()}
      >
        <Text className="text-white font-medium">Add a new member</Text>
      </Button>

      <BottomSheet
        ref={AddFamilyMemberFormBottomSheetRef}
        index={-1}
        enablePanDownToClose={true}
        enableDynamicSizing={false}
        snapPoints={["70%", "100%"]}
      >
        <BottomSheetView className="w-full flex-1 bg-white ">
          <View className="flex flex-col justify-center items-center w-full gap-4 p-6 pt-12 mx-auto">
            <Button
              size={"icon"}
              variant={"ghost"}
              className="absolute top-2 right-2 rounded-full p-0 text-neutral-800"
              onPress={() => {
                reset();
                setIsEditing(false);
                setCurrentMember(null);
                AddFamilyMemberFormBottomSheetRef.current?.close();
              }}
            >
              <X size={20} color={"#262626"} />
            </Button>
            <View className=" bg-white w-full h-full">
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
                <Text className="text-red-500">
                  {errors.relationship.message}
                </Text>
              )}

              <Button className=" mt-4" onPress={handleSubmit(onSubmit)}>
                <Text className="text-white font-medium">
                  {isEditing ? "Update" : "Add"}
                </Text>
              </Button>
            </View>
          </View>
        </BottomSheetView>
      </BottomSheet>
    </View>
  );
}

export default FamilyPage;
