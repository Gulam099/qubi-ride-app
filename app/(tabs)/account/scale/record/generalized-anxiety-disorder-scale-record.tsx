import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import Svg, {
  Circle,
  G,
  Defs,
  LinearGradient,
  Stop,
  Text as SvgText,
} from "react-native-svg";
import { useUser } from "@clerk/clerk-expo";
import { useInfiniteQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import colors from "@/utils/colors";
import { H3 } from "@/components/ui/Typography";
import { ArrowRight } from "iconsax-react-native";
import { apiNewUrl } from "@/const";

type RecordType = {
  _id: string;
  score: number;
  createdAt: string;
};

const getAnxietyLevel = (score: number) => {
  if (score < 5) return "Minimal Anxiety";
  if (score < 10) return "Mild Anxiety";
  if (score < 15) return "Moderate Anxiety";
  return "Severe Anxiety";
};

const CircularProgress = ({ score }: { score: number }) => {
  const size = 160;
  const strokeWidth = 15;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = score / 100;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <Svg width={size} height={size}>
      <Defs>
        <LinearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0%" stopColor="#1e3a8a" />
          <Stop offset="100%" stopColor="#2563eb" />
        </LinearGradient>
      </Defs>
      <G rotation="-90" origin={`${size / 2}, ${size / 2}`}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#E5E7EB"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#grad)"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="none"
        />
      </G>
      <SvgText
        x="50%"
        y="45%"
        textAnchor="middle"
        fontSize="14"
        fill="#1e3a8a"
        fontWeight="bold"
      >
        {getAnxietyLevel(score)}
      </SvgText>
      <SvgText
        x="50%"
        y="62%"
        textAnchor="middle"
        fontSize="28"
        fill="#1e3a8a"
        fontWeight="bold"
      >
        {score}
      </SvgText>
    </Svg>
  );
};

export default function GeneralizedAnxietyDisorderScale() {
  const [isListActive, setIsListActive] = useState(false);
  const { user } = useUser();
  const userId = user?.publicMetadata.dbPatientId as string;

  const fetchRecords = async ({ pageParam = 1 }) => {
    try {
      const response = await fetch(
        `${apiNewUrl}/api/gad-scale/user/${userId}?page=${pageParam}`
      );
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Failed to fetch");
      return {
        responses: Array.isArray(result.responses) ? result.responses : [],
        nextPage:
          result.totalPages && pageParam < result.totalPages
            ? pageParam + 1
            : null,
      };
    } catch (err) {
      return { responses: [], nextPage: null };
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
    getNextPageParam: (lastPage) => lastPage?.nextPage ?? null,
  });

  const RecordList = data?.pages?.flatMap((page) => page.responses) ?? [];

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

  return (
    <>
      {!isListActive ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1, gap: 8, paddingBottom: 20 }}
          className="bg-blue-50/10 flex flex-col gap-4 h-full w-full"
        >
          {/* Last Result Section */}
          <View className="bg-white p-4 rounded-2xl relative">
            <H3 className="text-xl mb-2">Last Result</H3>
            <View className="items-center justify-center mt-4">
              <CircularProgress score={RecordList[0]?.score || 0} />
            </View>
            <Text className="text-sm text-neutral-500 mt-4 text-center">
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

            <View className="flex-col h-full gap-2 mt-2">
              {RecordList.length > 0 ? (
                RecordList.slice(0, 4).map((record) => (
                  <View key={record._id} className="flex-row gap-2 py-2">
                    <View className="flex-1 gap-1">
                      <Text className="text-base font-semibold leading-8">
                        Anxiety Score: {record.score}
                      </Text>
                      <Text className="text-xs">
                        {getAnxietyLevel(record.score)}
                      </Text>
                    </View>
                    <View className="w-1/3 items-end">
                      <Text className="text-xs text-right">
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
                <Text className="text-xs">{getAnxietyLevel(item.score)}</Text>
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
