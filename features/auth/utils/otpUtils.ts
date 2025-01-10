import { apiBaseUrl } from "@/features/Home/constHome";
import { toast } from "sonner-native";


export async function sendOtp(phoneNumber: string): Promise<{ success: boolean; message: string }> {
  try {
    const payload = { phoneNumber };

    const response = await fetch(`${apiBaseUrl}/api/auth/send-otp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      toast.error(data.error || "Failed to send OTP.");
      return { success: false, message: data.error || "Failed to send OTP." };
    }

    toast.success(data.message || "OTP sent successfully.");
    return { success: true, message: data.message || "OTP sent successfully." };
  } catch (error) {
    console.error("Error sending OTP:", error);
    toast.error("An error occurred while sending OTP.");
    return { success: false, message: "An error occurred while sending OTP." };
  }
}


export async function verifyOtp(payload: {
  phoneNumber: string;
  otp: string;
  role?: string;
}): Promise<{ success: boolean; message: string; data?: any }> {
  try {
    const response = await fetch(`${apiBaseUrl}/api/auth/verify-otp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      toast.error(data.error || "Failed to verify OTP.");
      return { success: false, message: data.error || "Failed to verify OTP." };
    }

    toast.success(data.message || "OTP verified successfully.");
    return { success: true, message: data.message || "OTP verified successfully.", data: data.user };
  } catch (error) {
    console.error("Error verifying OTP:", error);
    toast.error("An error occurred while verifying OTP.");
    return { success: false, message: "An error occurred while verifying OTP." };
  }
}
