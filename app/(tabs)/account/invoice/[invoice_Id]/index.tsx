import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { H3 } from "@/components/ui/Typography";
import { Button } from "@/components/ui/Button";
import { AnyZodObject } from "zod";
import { useLocalSearchParams } from "expo-router";
import { Printer } from "iconsax-react-native";
import colors from "@/utils/colors";
import { Separator } from "@/components/ui/Separator";
import { useQuery } from "@tanstack/react-query";
import { useUser } from "@clerk/clerk-expo";
import axios from "axios";
import { Loader } from "@/components/loader";
import { ApiUrl } from "@/const";
import Logo from "@/features/Home/Components/Logo";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
export default function InvoiceIdPerPage() {
  const { invoice_Id } = useLocalSearchParams();
  const { user } = useUser();
  const userId = user?.publicMetadata.dbPatientId as string;
  const fetchInvoiceData = async ({ queryKey }: any) => {
    const [_key, invoice_Id] = queryKey;

    const res = await axios.get(`${ApiUrl}/api/payments/invoice/${invoice_Id}`);
    console.log("invoice response", res);
    return res.data.data;
  };
  const {
    data: invoice,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["payments", invoice_Id],
    queryFn: fetchInvoiceData,
    refetchOnWindowFocus: false,
  });

  console.log("invoice", invoice);

  const handledownload = async () => {
    if (!invoice_Id) return;

    const downloadUrl = `${ApiUrl}/api/payments/${invoice_Id}/pdf`;
    const fileUri = FileSystem.documentDirectory + `invoice_${invoice_Id}.pdf`;

    try {
      const downloadResumable = FileSystem.createDownloadResumable(
        downloadUrl,
        fileUri
      );

      const { uri } = await downloadResumable.downloadAsync();
      console.log("Downloaded to:", uri);

      // Share the PDF (e.g., open with other apps like WhatsApp, Drive, etc.)
      await Sharing.shareAsync(uri);
    } catch (error) {
      console.error("Failed to download PDF:", error);
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-50/50 text-green-500";
      case "pending":
        return "bg-blue-50/50 text-blue-500";
      case "cancel":
        return "bg-red-100/50 text-red-500";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <View className="p-4 bg-blue-50/10 h-full flex flex-col gap-4">
      <View className="flex flex-row justify-between items-center">
        <H3 className="text-xl flex-1">My Invoices</H3>
        <Button
          onPress={handledownload}
          disabled={isLoading || isError}
          className="bg-purple-200 flex flex-row gap-2 items-center"
        >
          <Printer size="22" color={colors.primary[500]} />
          <Text className="text-primary-500 font-medium">Downlaod</Text>
        </Button>
      </View>

      <View className="p-4 bg-white rounded-lg shadow-sm  flex-col gap-4">
        {isLoading ? (
          <Loader />
        ) : (
          <>
            <View className=" items-start justify-start flex-row  gap-3">
              <View className="flex-1 flex-col gap-2">
                <View className="flex justify-center items-center">
                  <Logo size={100} />
                </View>
                <Text className="font-semibold text-lg text-gray-800">
                  {invoice.description}
                </Text>
                <Text className="text-sm text-gray-600">
                  {invoice.doctorId?.full_name}
                </Text>
                <Text className="text-sm text-gray-600">
                  Payment Id : {invoice._id}
                </Text>
              </View>

              <View className="flex-col justify-end items-end gap-1">
                <Text
                  className={`text-xs font-medium px-2 py-1 rounded-full capitalize ${getStatusStyle(
                    invoice.status
                  )}`}
                >
                  {invoice.status}
                </Text>
                <Text className="text-xs text-gray-500">{invoice.date}</Text>
              </View>
            </View>

            <Separator />

            {/* <View className="  gap-3">
              <Text className="font-bold text-base text-gray-800">
                Appointment Details
              </Text>
              <Text className="text-sm text-gray-600">
                Day: {invoice.appointmentDetails.day}
              </Text>
              <Text className="text-sm text-gray-600">
                Time: {invoice.appointmentDetails.time}
              </Text>
              <Text className="text-sm text-gray-600">
                Sessions: {invoice.appointmentDetails.sessions}
              </Text>
              <Text className="text-sm text-gray-600">
                Duration: {invoice.appointmentDetails.duration}
              </Text>
            </View> */}
            <Separator />

            <View className="  gap-3">
              <Text className="font-bold text-base text-gray-800">
                Total cost
              </Text>
              <Text className="text-sm text-gray-600">
                Program price: {invoice.amount}
              </Text>
              {/* <Text className="text-sm text-gray-600">
                VAT 15%: {invoice.totalCost.vat}
              </Text> */}
              <Text className="text-sm text-gray-600 font-semibold">
                Total cost: {invoice.amount}
              </Text>
              <Text className="text-sm text-gray-600">
                Paid by: {invoice.userId?.name}
              </Text>
            </View>
          </>
        )}
      </View>
    </View>
  );
}
