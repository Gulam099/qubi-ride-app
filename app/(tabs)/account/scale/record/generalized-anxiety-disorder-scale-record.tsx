import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import React, { useState } from "react";
import Drawer from "@/components/ui/Drawer";
import { H3 } from "@/components/ui/Typography";
import { format } from "date-fns";
import { ProgressChart } from "react-native-chart-kit";
import colors from "@/utils/colors";
import { ArrowRight } from "iconsax-react-native";
import { useUser } from "@clerk/clerk-expo";
import { useInfiniteQuery } from "@tanstack/react-query";
import { apiBaseUrl } from "@/features/Home/constHome";

type RecordType = {
  _id: string;
  score: number;
  createdAt: string;
};

export default function GeneralizedAnxietyDisorderScale() {
  const [isListActive, setIsListActive] = useState(false);
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [RecordActive, setRecordActive] = useState<RecordType | null>(null);

  const { user } = useUser();
  const userId = user?.publicMetadata.dbPatientId as string;

  // Fetch records using useInfiniteQuery
  const fetchRecords = async ({ pageParam = 1 }) => {
    try {
      const response = await fetch(
        `${apiBaseUrl}/api/gad-scale/user/${userId}?page=${pageParam}`
      );
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to fetch records");
      }

      // ✅ Ensure the response is structured correctly
      return {
        responses: Array.isArray(result.responses) ? result.responses : [], // Always return an array
        nextPage:
          result.totalPages && pageParam < result.totalPages
            ? pageParam + 1
            : null,
      };
    } catch (err) {
      // console.error("Fetch Error:", err);
      return {
        responses: [], // ✅ Return an empty array instead of undefined
        nextPage: null, // ✅ Stop pagination gracefully
      };
    }
  };

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
    isError,
  } = useInfiniteQuery({
    queryKey: ["gad-scale", userId],
    queryFn: fetchRecords,
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage?.nextPage ?? null, // ✅ Avoids undefined error
  });

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color={colors.primary[500]} />
      </View>
    );
  }

  if (isError) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-neutral-500">{error.message}</Text>
      </View>
    );
  }

  const RecordList = data?.pages?.flatMap((page) => page.responses) ?? []; // ✅ Avoids undefined issues

  const handleRecordActive = (recordId: string) => {
    const record = RecordList.find((item) => item._id === recordId);
    setRecordActive(record);
    setIsDrawerVisible(true);
  };

  const dataChart = {
    labels: ["Anxiety"],
    data: [RecordList[0]?.score / 100 || 0],
  };

  const chartConfig = {
    backgroundColor: "#fff",
    backgroundGradientFrom: "#fff",
    backgroundGradientTo: "#fff",
    color: (opacity = 1) => `rgba(1, 40, 150, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
  };

  return (
    <>
      {!isListActive ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1, gap: 8, paddingBottom: 20 }}
          className="bg-blue-50/10 flex flex-col gap-4 h-full w-full"
        >
          {/* Last Result Section */}
          <View className="bg-white p-4 rounded-2xl relative h-[400]">
            <H3 className="text-xl">Last Result</H3>
            <View className="absolute top-[140] left-[155] z-10">
              <Text className="text-blue-600 font-semibold w-20 text-center leading-5">
                {RecordList.length > 0 ? "Moderate Anxiety" : "No Data"}
              </Text>
              <Text className="text-3xl font-semibold text-blue-600 text-center leading-10">
                {RecordList.length > 0 ? `${RecordList[0]?.score}` : "N/A"}
              </Text>
            </View>
            <View className="rotate-[180deg]">
              <ProgressChart
                data={dataChart}
                width={Dimensions.get("window").width - 60}
                height={250}
                strokeWidth={18}
                radius={60}
                chartConfig={chartConfig}
                hideLegend={true}
              />
            </View>
            <Text className="text-sm text-neutral-500">
              We encourage you to take care of your mental health and seek a
              session as soon as possible for meditation to help alleviate
              anxiety and achieve mental relaxation.
            </Text>
          </View>

          {/* Record List Preview */}
          <View className="flex-col rounded-xl bg-background py-4 px-4">
            <View className="flex-row">
              <Text className="text-lg font-semibold flex-1">Record</Text>
              <TouchableOpacity
                onPress={() => setIsListActive(true)}
                className="flex-row items-center justify-center gap-1"
              >
                <Text className="text-sm font-semibold text-primary-500">
                  View all
                </Text>
                <ArrowRight size="20" color={colors.primary[500]} />
              </TouchableOpacity>
            </View>

            <View className="flex-col h-full gap-2">
              {RecordList.length > 0 ? (
                RecordList.slice(0, 4).map((record, index) => (
                  <View key={record._id} className="flex-row gap-2 py-2">
                    <View className="flex-1 gap-1">
                      <Text className="text-base font-semibold leading-8">
                        Anxiety Score: {record.score}
                      </Text>
                      <Text className="text-xs">Moderate Anxiety</Text>
                    </View>
                    <View className="w-1/4">
                      <Text className="text-xs">
                        {format(new Date(record.createdAt), "dd-MM-yyyy , p")}
                      </Text>
                    </View>
                  </View>
                ))
              ) : (
                <Text className="text-neutral-500 text-sm">
                  No records found
                </Text>
              )}
            </View>
          </View>
        </ScrollView>
      ) : (
        // Full Record List
        <FlatList
          data={RecordList}
          keyExtractor={(item) => item._id}
          onEndReached={hasNextPage ? fetchNextPage : null}
          onEndReachedThreshold={0.1}
          ListFooterComponent={
            isFetchingNextPage ? (
              <ActivityIndicator size="small" color={colors.primary[500]} />
            ) : null
          }
          renderItem={({ item, index }) => (
            <TouchableOpacity
              onPress={() => handleRecordActive(item._id)}
              className="flex flex-row justify-between items-center bg-white border rounded-2xl border-blue-600 gap-2 overflow-hidden h-20"
            >
              <View className="bg-blue-600 w-6 h-20 flex justify-center items-center">
                <Text className="text-white font-semibold text-center text-sm">
                  {index + 1}
                </Text>
              </View>
              <View className="flex-1 p-2">
                <Text className="text-lg font-medium leading-6">
                  Anxiety Score: {item.score}
                </Text>
                <Text className="text-xs">Moderate Anxiety</Text>
              </View>
              <View className="px-4">
                <Text className="text-sm">
                  {format(new Date(item.createdAt), "dd-MM-yyyy")}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </>
  );
}
