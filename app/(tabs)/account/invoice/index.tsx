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
  const [activeTab, setActiveTab] = useState<TabType>("pending");
  const { user } = useUser();
  const id = user?.publicMetadata.dbPatientId as string;
  const router = useRouter();
  const { t } = useTranslation();

  const TAB_LABELS = {
    pending: t("pendingPayments"),
    invoices: t("invoices"),
  } as const;

  type TabType = keyof typeof TAB_LABELS;

  const {
    data: pendingData,
    isLoading: isPendingLoading,
    error: pendingError,
  } = useQuery({
    queryKey: ["pending-payments", id],
    queryFn: async () => {
      const res = await axios.get(`${ApiUrl}/api/payments/get/${id}/pending`);
      return res.data;
    },
    enabled: activeTab === "pending" && !!id,
  });

  const {
    data: invoiceData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isInvoiceLoading,
    error: invoiceError,
  } = useInfiniteQuery({
    queryKey: ["invoices", id],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await axios.get(`${ApiUrl}/api/payments/get/${id}/paid`);
      return res.data;
    },
    getNextPageParam: (lastPage, allPages) =>
      lastPage?.hasNext ? allPages.length + 1 : undefined,
    enabled: activeTab === "invoices" && !!id,
    initialPageParam: 1,
  });

  const invoiceList = invoiceData?.pages.flatMap((page) => page.data) ?? [];

  const renderContent = () => {
    if (activeTab === "pending") {
      if (isPendingLoading) return <LoaderPage />;
      if (pendingError)
        return (
          <Text className="text-red-500 mt-5 text-center">
            {t("failedToLoadPendingPayments")}
          </Text>
        );

      return (
        <FlatList
          contentContainerStyle={{ padding: 16 }}
          data={pendingData?.data ?? []}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => <PendingPaymentCard item={item} />}
          ListEmptyComponent={
            <Text className="text-center text-gray-500">
              {t("noPendingPaymentsFound")}
            </Text>
          }
        />
      );
    }

    if (activeTab === "invoices") {
      if (isInvoiceLoading) return <LoaderPage />;
      if (invoiceError)
        return (
          <Text className="text-red-500 mt-5 text-center">
            {t("failedToLoadInvoices")}
          </Text>
        );

      return (
        <FlatList
          contentContainerStyle={{ padding: 16 }}
          data={invoiceList}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => <InvoiceCard invoice={item} />}
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) fetchNextPage();
          }}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            isFetchingNextPage ? <ActivityIndicator /> : null
          }
        />
      );
    }

    return null;
  };

  return (
    <View className="flex-1 bg-white">
      {/* 🔹 Tabs */}
      <View className="flex-row justify-around border-b border-gray-200 bg-blue-50">
        {(Object.keys(TAB_LABELS) as TabType[]).map((tab) => (
          <TouchableOpacity
            key={tab}
            className={`p-3 border-b-2 ${
              activeTab === tab ? "border-blue-500" : "border-transparent"
            }`}
            onPress={() => setActiveTab(tab)}
          >
            <Text
              className={`font-semibold ${
                activeTab === tab ? "text-blue-600" : "text-gray-500"
              }`}
            >
              {TAB_LABELS[tab]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 🔹 Content */}
      {renderContent()}
    </View>
  );
}

// 🔸 Pending Payment Card
const PendingPaymentCard = ({ item }: any) => (
  <View className="bg-white p-4 mb-3 rounded-xl shadow-sm border border-gray-100">
    <View className="flex-row justify-between mb-2">
      <Text className="text-lg font-semibold text-gray-800">
        {item.description}
      </Text>
      <Text className="text-base font-medium text-blue-600">
        {item.amount} {item.currency}
      </Text>
    </View>
    <Text className="text-sm text-gray-600 mb-1">
      {t("bookingType")}: {item.bookingType}
    </Text>
    <Text className="text-sm text-gray-500">
      {t("createdAt")}:{" "}
      {format(new Date(item.createdAt), "dd MMM yyyy, hh:mm a")}
    </Text>
    <View className="mt-2 self-start px-3 py-1 rounded-full bg-yellow-50 border border-yellow-300">
      <Text className="text-xs font-medium text-yellow-600 capitalize">
        {item.status}
      </Text>
    </View>
  </View>
);

// 🔸 Invoice Card
const InvoiceCard = ({ invoice }: any) => {
  const router = useRouter();

  const handlePress = () => {
    if (invoice.status === "paid") {
      router.push(`/account/invoice/${invoice._id}`);
    } else if (invoice.status === "pending") {
      router.push(`/payment/${invoice._id}`);
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
    <TouchableOpacity
      onPress={handlePress}
      disabled={invoice.status === "cancel"}
      className="flex-row bg-white rounded-xl shadow-sm h-32 relative mb-2"
    >
      <View className="rotate-[-90deg] h-32 absolute">
        <Text className="bg-blue-900 text-white rounded-t-xl py-1 w-32 h-6 text-xs font-medium text-center">
          {invoice.description}
        </Text>
      </View>
      <View className="flex-1 items-start justify-start flex-row p-4 pl-10">
        <View className="flex-1 flex-col gap-2">
          <Text className="font-semibold text-lg text-gray-800">
            {invoice.description}
          </Text>
          <Text className="text-sm text-gray-600">
            {invoice.doctorId?.full_name}
          </Text>
          <Text className="text-sm text-gray-600">
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
            {format(
              new Date(invoice.paidAt ?? invoice.createdAt),
              "dd MMM yyyy, hh:mm a"
            )}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};
