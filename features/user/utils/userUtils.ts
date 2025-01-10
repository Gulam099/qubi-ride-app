import { apiBaseUrl } from "@/features/Home/constHome";
import { toast } from "sonner-native";
import { z } from "zod";
import { userSchema } from "../schema/user.schema";

export async function updateUser(payload: {
  phoneNumber: string;
  data: Partial<z.infer<typeof userSchema>>;
}): Promise<{ success: boolean; message: string; data?: any }> {
  try {
    const { phoneNumber, data } = payload;

    if (!phoneNumber) {
      throw new Error("Phone number is required.");
    }

    const requestBody = {
      phoneNumber,
      ...data,
    };

    const response = await fetch(`${apiBaseUrl}/api/profile/update-profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    const responseData = await response.json();

    if (!response.ok) {
      toast.error(responseData.message || "Failed to update user profile.");
      return {
        success: false,
        message: responseData.message || "Failed to update user profile.",
      };
    }

    toast.success(responseData.message || "Profile updated successfully.");
    return {
      success: true,
      message: responseData.message || "Profile updated successfully.",
      data: responseData.data,
    };
  } catch (error) {
    console.error("Error updating user profile:", error);
    toast.error("An error occurred while updating the profile.");
    return {
      success: false,
      message: "An error occurred while updating the profile.",
    };
  }
}
