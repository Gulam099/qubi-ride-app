import React from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useInfiniteQuery } from "@tanstack/react-query";
import axios from "axios";
import { format } from "date-fns";
import { Loader, LoaderPage } from "@/components/loader";
import { useRouter } from "expo-router";
import { useUser } from "@clerk/clerk-expo";

export default function PaymentsList() {
  const {user} = useUser();
  const userId = user?.publicMetadata.dbPatientId as string;
  const fetchPayments = async ({ pageParam = 1 }) => {
    const res = await axios.get(
      `https://www.baserah.sa/api/payment?patientId=${userId}&page=${pageParam}`
    );
    return res.data;
  };
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
  } = useInfiniteQuery({
    queryKey: ["payments"],
    queryFn: fetchPayments,
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.hasNext ? allPages.length + 1 : undefined;
    },
  });

  const flatData = data?.pages.flatMap((page) => page.data) ?? [];

  if (isLoading) return <LoaderPage/>;

  if (error)
    return (
      <Text className="text-center mt-10 text-red-500">
        Failed to load payments.
      </Text>
    );

  return (
    <FlatList
      contentContainerStyle={{ padding: 16 }}
      contentContainerClassName=" gap-2 bg-blue-50/20"
      data={flatData}
      keyExtractor={(item) => item._id}
      renderItem={({ item }) => <InvoiceCard invoice={item} />}
      onEndReached={() => {
        if (hasNextPage && !isFetchingNextPage) fetchNextPage();
      }}
      onEndReachedThreshold={0.5}
      ListFooterComponent={isFetchingNextPage ? <Loader /> : null}
    />
  );
}

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
      className="flex-row bg-white rounded-xl shadow-sm h-32 relative"
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
            {invoice.doctorId.full_name}
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
          <Text className="text-xs text-gray-500">
            {format(new Date(invoice.paidAt ?? invoice.createdAt), "dd MMM yyy , hh : mm a")}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};
