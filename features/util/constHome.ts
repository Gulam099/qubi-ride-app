import axios from "axios";
import { ApiUrl } from "@/const";

const API_BASE_URL = `${ApiUrl}/api/doctor/appointments`;

export async function fetchAppointments({
  userId,
  status,
  page = 1,
}: {
  userId: string;
  status: string;
  page?: number;
}) {
  try {
    const response = await axios.post(
      API_BASE_URL,
      {
        userId,
        status: status,
        page,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        hasMore: response.data.has_more,
        total: response.data.total,
      };
    } else {
      throw new Error(response.data.message || "Failed to fetch appointments");
    }
  } catch (error: any) {
    console.error("Error fetching appointments:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Error fetching appointments",
    };
  }
}

export const fetchInstantAppointments = async ({
  userId,
}: {
  userId: string;
}) => {
  try {
    const response = await fetch(
      `${ApiUrl}/api/instantbookings/user/${userId}`
    );
    const data = await response.json();

    return {
      success: response.ok,
      data: data.bookings || [],
      message: data.message || "Success",
    };
  } catch (error) {
    return {
      success: false,
      data: [],
      message: "Failed to fetch instant appointments",
    };
  }
};

