import { apiBaseUrl } from "@/features/Home/constHome";
import { toast } from "sonner-native";
import { z } from "zod";
import { userSchema } from "../schema/user.schema";

export async function updateUser(payload: {
  phoneNumber: string;
  data: Partial<z.infer<typeof userSchema>> | null;
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
      toast.error(responseData.message);
      return {
        success: false,
        message: responseData.message,
      };
    }

    toast.success(responseData.message);
    return {
      success: true,
      message: responseData.message,
      data: responseData.user,
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

type GetUserResponse = {
  success: boolean;
  message?: string;
  data?: any;
};

export async function getUser({
  phoneNumber,
}: {
  phoneNumber: string;
}): Promise<GetUserResponse> {
  try {
    const response = await fetch(`${apiBaseUrl}/api/users/getUser`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ phoneNumber }),
    });

    const responseData = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: responseData.message || "Failed to fetch user",
      };
    }

    return {
      success: true,
      data: responseData,
    };
  } catch (error) {
    console.error("Error fetching user:", error);
    return {
      success: false,
      message: "An error occurred while fetching the user",
    };
  }
}
