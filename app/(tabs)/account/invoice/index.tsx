import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import axios from "axios";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { useUser } from "@clerk/clerk-expo";
import { Loader, LoaderPage } from "@/components/loader";
import { useRouter } from "expo-router";
import { ApiUrl } from "@/const";
import { useTranslation } from "react-i18next";
import { t } from "i18next";

export default function PaymentsList() {
  const { user } = useUser();
  const id = user?.publicMetadata.dbPatientId as string;
  const router = useRouter();
  const { t } = useTranslation();

  const { data, isLoading, error } = useQuery({
    queryKey: ["all-invoices", id],
    queryFn: async () => {
      const res = await axios.get(`${ApiUrl}/api/payments/get/${id}/all`);
      return res.data;
    },
    enabled: !!id,
  });

  const allInvoices = data?.data ?? [];

  if (isLoading) return <LoaderPage />;
  if (error)
    return (
      <Text className="text-red-500 mt-5 text-center">
        {t("failedToLoadInvoices")}
      </Text>
    );

  return (
    <View className="flex-1 bg-blue-50/10 px-4 pt-4">
      <Text className="text-lg font-semibold mb-3">{t("myInvoices")}</Text>

      <FlatList
        data={allInvoices}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => <InvoiceCard invoice={item} />}
        ListEmptyComponent={
          <Text className="text-center text-gray-500">
            {t("noInvoicesFound")}
          </Text>
        }
      />
    </View>
  );
}

// 🔸 Invoice Card
const InvoiceCard = ({ invoice }: any) => {
  const router = useRouter();

  const handlePress = async () => {
    if (invoice.status === "paid") {
      router.push(`/account/invoice/${invoice._id}`);
    } else if (invoice.status === "pending") {
      try {
        const response = await fetch(`${ApiUrl}/api/payments/${invoice._id}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });

        const result = await response.json();

        console.log("result",result)
        if (response.ok && result?.redirectUrl) {
          // ✅ Redirect user to payment WebView
          router.push(
            `/(stacks)/fatoorah/MyFatoorahWebView?redirectUrl=${encodeURIComponent(
              result.redirectUrl
            )}`
          );
        } else {
          alert(result?.error || "Redirect URL not found");
        }
      } catch (err) {
        console.error("Redirect error", err);
        alert("Something went wrong. Try again.");
      }
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-[#DDF9E5] text-green-500";
      case "pending":
        return "bg-[#D2F7F8] text-green-500";
      case "cancel":
        return "bg-[#F8D2D2] text-red-500";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={invoice.status === "cancel"}
      className="flex-row bg-white rounded-xl shadow-sm h-32 relative mb-2"
    >
      <View className="rotate-[-90deg] h-32 absolute">
        <Text className="bg-blue-500 text-white rounded-t-xl py-1 w-32 h-6 text-xs font-medium text-center">
          {invoice.description}
        </Text>
      </View>
      <View className="flex-1 items-start justify-start flex-row p-4 pl-10">
        <View className="flex-1 flex-col gap-2">
          <Text className="font-semibold text-lg text-gray-800">
            {invoice.doctorId?.full_name}
          </Text>
          <Text className="text-sm text-gray-600">
            {t("typeConsultation")} : {invoice.doctorId?.specialization}
          </Text>
          <Text className="text-sm text-gray-600">
            {t("paymentId")} : {invoice.paymentId}
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
            {format(new Date(invoice.paidAt ?? invoice.createdAt), "dd MMM,")}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};
