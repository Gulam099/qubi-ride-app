import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { H3 } from "@/components/ui/Typography";
import { useRouter } from "expo-router";

// Mock invoice data (pretend it's fetched from an API call)
const invoices = [
  {
    id: "1",
    title: "Anxiety Program",
    type: "Program",
    doctor: "DR.Mohammed Alabdullah",
    date: "April, 08",
    invoiceNumber: "24365768797",
    status: "Paid",
  },
  {
    id: "2",
    title: "DR.Maha Alabdullah",
    type: "Consultation",
    doctor: "psychic",
    date: "April, 08",
    invoiceNumber: "24365768797",
    status: "Payment Pending",
  },
  {
    id: "3",
    title: "DR.Maha Alabdullah",
    type: "Consultation",
    doctor: "psychic",
    date: "April, 08",
    invoiceNumber: "24365768797",
    status: "Cancel",
  },
];

const InvoiceCard = ({ invoice }: any) => {
  const router = useRouter();
  const handlePress = () => {
    if (invoice.status === "Paid") {
      // Redirect to invoice details page
      console.log(`Redirect to /${invoice.id}/index`);
      router.push(`/account/invoice/${invoice.id}`);
    } else if (invoice.status === "Payment Pending") {
      // Redirect to payment page
      console.log(`Redirect to payment/${invoice.id}/index`);
    }
  };

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
    <TouchableOpacity
      onPress={handlePress}
      disabled={invoice.status === "Cancel"}
      className={` flex-row  bg-white rounded-lg shadow-sm h-32 relative`}
    >
      <View className="  rotate-[-90deg] h-32 absolute">
        <Text className="bg-blue-900 text-white rounded-t-xl py-1 w-32 h-6 text-xs font-medium text-center">
          {invoice.type}
        </Text>
      </View>
      <View className="flex-1 items-start justify-start flex-row p-4 pl-10">
        <View className="flex-1 flex-col gap-2">
          <Text className="font-semibold text-lg text-gray-800">
            {invoice.title}
          </Text>
          <Text className="text-sm text-gray-600">{invoice.doctor}</Text>
          <Text className="text-sm text-gray-600">
            Invoice Number : {invoice.invoiceNumber}
          </Text>
        </View>

        <View className="flex-col justify-end items-end gap-1">
          <Text
            className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusStyle(
              invoice.status
            )}`}
          >
            {invoice.status}
          </Text>
          <Text className="text-xs text-gray-500">{invoice.date}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default function AccountInvoicePage() {
  return (
    <View className="p-4 bg-blue-50/10 h-full flex flex-col gap-4">
      <H3 className="text-xl">My Invoices</H3>

      <View className="flex flex-col gap-4">
        {invoices.map((invoice) => (
          <InvoiceCard key={invoice.id} invoice={invoice} />
        ))}
      </View>
    </View>
  );
}
