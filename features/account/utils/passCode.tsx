import { UserType } from "@/features/user/types/user.type";
import { toast } from "sonner-native";
import { useDispatch, useSelector } from "react-redux";
import { apiBaseUrl } from "@/features/Home/constHome";
import { updateUserState } from "@/store/user/user";

export async function SetPasscode(
  phoneNumber: string,
  passcode: string | null
) {
  const payload = {
    phoneNumber,
    passcode: passcode || null,
  };

  try {
    const response = await fetch(`${apiBaseUrl}/api/set-passcode`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (response.ok) {
      toast.success(result.message);
      return { success: true };
    } else {
      toast.error(result.message || "Failed to update passcode");
      return { success: false };
    }
  } catch (error) {
    console.error("Error setting passcode:", error);
    toast.error("Error setting passcode");
    return { success: false };
  }
}
