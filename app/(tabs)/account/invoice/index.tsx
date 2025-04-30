import React from "react";
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity } from "react-native";
import { useInfiniteQuery } from "@tanstack/react-query";
import axios from "axios";
import { format } from "date-fns";

const PAGE_SIZE = 10;
const patientId = "67ef8b5cbb0b7fdfb6bd9b12";

const fetchPayments = async ({ pageParam = 1 }) => {
  const res = await axios.get(
    `https://www.baserah.sa/api/payment?patientId=${patientId}&page=${pageParam}`
  );
  return res.data;
};

const PaymentCard = ({ item }) => {
  return (
    <View className="bg-white rounded-lg shadow p-4 mb-3">
      <Text className="text-lg font-bold text-gray-800">
        {item.doctorId.full_name}
      </Text>
      <Text className="text-gray-600">{item.description}</Text>
      <Text className="text-gray-600">Amount: {item.amount} {item.currency}</Text>
      <Text className="text-sm text-gray-500">
        Status: {item.status === "paid" ? "✅ Paid" : "❌ Pending"}
      </Text>
      <Text className="text-xs text-gray-400 mt-1">
        {format(new Date(item.createdAt), "PPpp")}
      </Text>
    </View>
  );
};

export default function PaymentsList() {
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

  if (isLoading) return <ActivityIndicator className="mt-10" />;

  if (error)
    return (
      <Text className="text-center mt-10 text-red-500">
        Failed to load payments.
      </Text>
    );

  return (
    <FlatList
      contentContainerStyle={{ padding: 16 }}
      data={flatData}
      keyExtractor={(item) => item._id}
      renderItem={({ item }) => <PaymentCard item={item} />}
      onEndReached={() => {
        if (hasNextPage && !isFetchingNextPage) fetchNextPage();
      }}
      onEndReachedThreshold={0.5}
      ListFooterComponent={
        isFetchingNextPage ? <ActivityIndicator className="my-4" /> : null
      }
    />
  );
}
