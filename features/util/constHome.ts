import { ApiUrl } from "@/const";


export async function fetchAppointments({ userId }: { userId: string }) {
  try {
    const response = await fetch(`${ApiUrl}/api/bookings/user/${userId}`);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch appointments");
    }

    const data = await response.json();

    return {
      success: true,
      data: data.bookings, // because your controller returns `{ bookings }`
      hasMore: false, // you can update this if needed
      total: data.bookings?.length || 0,
    };
  } catch (error: any) {
    console.error("Error fetching appointments:", error);
    return {
      success: false,
      message: error.message || "Error fetching appointments",
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

export const fetchGroupAppointments = async (userId: string) => {
  try {
    const res = await fetch(`${ApiUrl}/api/groups-booking/fetch-group/${userId}`);
    const json = await res.json();

    console.log("Fetched group appointments:", json);

    // Return only the actual array
    return { success: true, data: json.data || [] };
  } catch (err) {
    console.error("Failed to fetch group appointments:", err);
    return { success: false, message: "Failed to fetch group appointments" };
  }
};

