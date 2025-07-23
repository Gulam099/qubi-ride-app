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
import { useTranslation } from "react-i18next";
import { format } from "date-fns";

export default function InvoiceIdPerPage() {
  const { t } = useTranslation();

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
        <H3 className="text-xl flex-1">{t("myInvoices")}</H3>
        <Button
          onPress={handledownload}
          disabled={isLoading || isError}
          className="bg-purple-200 flex flex-row gap-2 items-center"
        >
          <Printer size="22" color={colors.primary[500]} />
          <Text className="text-primary-500 font-medium">{t("download")}</Text>
        </Button>
      </View>

      <View className="p-4 bg-white rounded-lg shadow-sm flex-col gap-4">
        {isLoading ? (
          <Loader />
        ) : (
          <>
            <View className="items-start justify-start flex-row gap-3">
              <View className="flex-1 flex-col gap-2">
                <View className="flex justify-center items-center">
                  <Logo size={100} />
                </View>
                <Text className="font-semibold text-lg text-gray-800">
                  {invoice.description}
                </Text>
                <Text className="text-sm text-gray-800 font-medium">
                  {invoice.doctorId?.full_name}
                </Text>
                <Text className="text-sm text-gray-800 font-medium">
                  {t("paymentId")}: {invoice._id}
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
                <Text className="text-xs text-gray-500">
                  {format(new Date(invoice.updatedAt), "MMM d, yyyy")}
                </Text>
              </View>
            </View>

            <Separator />

            {/* Appointment Details Section */}
            <View className="gap-4">
              <Text className="font-bold text-base text-gray-800">
                {t("Appointment Details")}
              </Text>

              <View className="gap-3">
                {/* Day */}
                <View className="flex-row items-start justify-between gap-2">
                  <Text className="text-sm text-gray-600">{t("sessionDay")}:</Text>
                  <View className="flex-1 items-end">
                    {invoice.booking.selectedSlots.length > 0 ? (
                      invoice.booking.selectedSlots.map((slot, index) => (
                        <Text
                          key={index}
                          className="text-sm text-gray-800 font-medium"
                        >
                          {format(new Date(slot), "EEEE, MMM d, yyyy")}
                        </Text>
                      ))
                    ) : (
                      <Text className="text-sm text-gray-800 font-medium">
                       {t("notAvailable")}
                      </Text>
                    )}
                  </View>
                </View>

                {/* Time */}
                <View className="flex-row items-start justify-between gap-2 mt-1">
                  <Text className="text-sm text-gray-600">{t("sessionTime")}:</Text>
                  <View className="flex-1 items-end">
                    {invoice.booking.selectedSlots.length > 0 ? (
                      invoice.booking.selectedSlots.map((slot, index) => (
                        <Text
                          key={index}
                          className="text-sm text-gray-800 font-medium"
                        >
                          {format(new Date(slot), "hh:mm a")}
                        </Text>
                      ))
                    ) : (
                      <Text className="text-sm text-gray-800 font-medium">
                       {t("notAvailable")}
                      </Text>
                    )}
                  </View>
                </View>

                {/* Sessions */}
                <View className="flex-row justify-between items-center">
                  <Text className="text-sm text-gray-600">{t("Number of sessions")}:</Text>
                  <Text className="text-sm text-gray-800 font-medium">
                    {invoice.booking.numberOfSessions || "One session"}
                  </Text>
                </View>

                {/* Duration */}
                <View className="flex-row justify-between items-center">
                  <Text className="text-sm text-gray-600">{t("sessionDuration")}:</Text>
                  <Text className="text-sm text-gray-800 font-medium">
                    {invoice.booking.duration}
                  </Text>
                </View>
              </View>
            </View>

            <Separator />

            {/* Total Cost Section */}
            <View className="gap-4">
              <Text className="font-bold text-base text-gray-800">
                {t("Total cost")}
              </Text>

              <View className="gap-3">
                {/* Program Price */}
                <View className="flex-row justify-between items-center">
                  <Text className="text-sm text-gray-600">{t("Program price")}:</Text>
                  <Text className="text-sm text-gray-800 font-medium">
                    {invoice.amount} SAR
                  </Text>
                </View>

                {/* VAT 15% */}
                <View className="flex-row justify-between items-center">
                  <Text className="text-sm text-gray-600">{t("VAT 15%")}:</Text>
                  <Text className="text-sm text-gray-800 font-medium">
                    {Math.round(invoice.amount * 0.15)} {t("SAR")}
                  </Text>
                </View>

                {/* Total Cost */}
                <View className="flex-row justify-between items-center pt-3">
                  <Text className="text-sm text-gray-800 font-semibold">
                    Total cost:
                  </Text>
                  <Text className="text-sm text-gray-800 font-semibold">
                    {Math.round(invoice.amount * 1.15)}{t("SAR")}
                  </Text>
                </View>

                <Separator />

                {/* Paid By */}
                <View className="flex-row justify-between items-center">
                  <Text className="text-sm text-gray-600">{t("paidBy")}:</Text>
                  <Text className="text-sm text-gray-800 font-medium">
                    {/* {invoice.userId?.name} */}{t("Visa")}
                  </Text>
                </View>
              </View>
            </View>
          </>
        )}
      </View>
    </View>
  );
}
