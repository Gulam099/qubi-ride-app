import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { H3 } from "@/components/ui/Typography";
import { Button } from "@/components/ui/Button";
import { AnyZodObject } from "zod";
import { useLocalSearchParams } from "expo-router";
import { Printer } from "iconsax-react-native";
import colors from "@/utils/colors";
import { Separator } from "@/components/ui/Separator";

const fetchInvoiceData = async (invoiceId: any) => {
  // Fake API call simulation
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: invoiceId,
        title: "Anxiety Program",
        doctor: "DR.Mohammed Alabdullah",
        date: "April, 08",
        invoiceNumber: "24365768797",
        status: "Paid",
        appointmentDetails: {
          day: "Sunday, 10-15-2023",
          time: "10:30 AM - 12:00 PM",
          sessions: "One session",
          duration: "30 minutes",
        },
        totalCost: {
          programPrice: "280 SAR",
          vat: "20 SAR",
          total: "300 SAR",
          paidBy: "Visa Card",
        },
      });
    }, 1000);
  });
};

export default function InvoiceIdPerPage() {
  const { invoice_Id } = useLocalSearchParams();
  const [invoiceData, setInvoiceData] = useState<any>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getInvoiceData = async () => {
      const data = await fetchInvoiceData(invoice_Id);
      setInvoiceData(data);
      setLoading(false);
    };

    getInvoiceData();
  }, [invoice_Id]);

  const handlePrint = () => {
    console.log("Printing Invoice...");
  };

  if (loading) {
    return (
      <View className="h-full w-full flex justify-center items-center bg-blue-50/10">
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  const getStatusStyle = (status: any) => {
    switch (status) {
      case "Paid":
        return "bg-green-50/50 text-green-500";
      case "Payment Pending":
        return "bg-blue-50/50 text-blue-500";
      case "Cancel":
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
          onPress={handlePrint}
          className="bg-purple-200 flex flex-row gap-2 items-center"
        >
          <Printer size="22" color={colors.primary[500]} />
          <Text className="text-primary-500 font-medium">Print</Text>
        </Button>
      </View>

      <View className="p-4 bg-white rounded-lg shadow-sm  flex-col gap-4">
        <View className=" items-start justify-start flex-row  gap-3">
          <View className="flex-1 flex-col gap-2">
            <Text className="font-semibold text-lg text-gray-800">
              {invoiceData.title}
            </Text>
            <Text className="text-sm text-gray-600">{invoiceData.doctor}</Text>
            <Text className="text-sm text-gray-600">
              Invoice Number : {invoiceData.invoiceNumber}
            </Text>
          </View>

          <View className="flex-col justify-end items-end gap-1">
            <Text
              className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusStyle(
                invoiceData.status
              )}`}
            >
              {invoiceData.status}
            </Text>
            <Text className="text-xs text-gray-500">{invoiceData.date}</Text>
          </View>
        </View>

        <Separator />

        <View className="  gap-3">
          <Text className="font-bold text-base text-gray-800">
            Appointment Details
          </Text>
          <Text className="text-sm text-gray-600">
            Day: {invoiceData.appointmentDetails.day}
          </Text>
          <Text className="text-sm text-gray-600">
            Time: {invoiceData.appointmentDetails.time}
          </Text>
          <Text className="text-sm text-gray-600">
            Sessions: {invoiceData.appointmentDetails.sessions}
          </Text>
          <Text className="text-sm text-gray-600">
            Duration: {invoiceData.appointmentDetails.duration}
          </Text>
        </View>
        <Separator />

        <View className="  gap-3">
          <Text className="font-bold text-base text-gray-800">Total cost</Text>
          <Text className="text-sm text-gray-600">
            Program price: {invoiceData.totalCost.programPrice}
          </Text>
          <Text className="text-sm text-gray-600">
            VAT 15%: {invoiceData.totalCost.vat}
          </Text>
          <Text className="text-sm text-gray-600 font-semibold">
            Total cost: {invoiceData.totalCost.total}
          </Text>
          <Text className="text-sm text-gray-600">
            Paid by: {invoiceData.totalCost.paidBy}
          </Text>
        </View>
      </View>
    </View>
  );
}
