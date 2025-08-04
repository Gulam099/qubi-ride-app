import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import React, { useEffect, useState } from "react";
import Drawer from "@/components/ui/Drawer";
import { H3 } from "@/components/ui/Typography";
import { format } from "date-fns";
import colors from "@/utils/colors";
import { ArrowRight } from "iconsax-react-native";
import { useUser } from "@clerk/clerk-expo";
import { apiNewUrl } from "@/const";
import Svg, { Circle, G, Text as SvgText } from "react-native-svg";

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
      <G rotation="-90" origin={`${size / 2}, ${size / 2}`}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#eee"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#1f3c88"
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
        fill="#1f3c88"
        fontWeight="bold"
      >
        {getAnxietyLevel(score)}
      </SvgText>
      <SvgText
        x="50%"
        y="62%"
        textAnchor="middle"
        fontSize="28"
        fill="#1f3c88"
        fontWeight="bold"
      >
        {score}
      </SvgText>
    </Svg>
  );
};

export default function DepressionScaleRecord() {
  const [RecordList, setRecordList] = useState<RecordType[]>([]);
  const [isListActive, setIsListActive] = useState(false);
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [RecordActive, setRecordActive] = useState<RecordType | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const { user } = useUser();
  const userId = user?.publicMetadata.dbPatientId as string;

  useEffect(() => {
    fetchRecords(currentPage);
  }, [currentPage]);

  const fetchRecords = async (page: number) => {
    if (!hasMore || isLoading) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `${apiNewUrl}/api/depression-scale/user/${userId}?page=${page}`
      );
      const result = await response.json();

      if (response.ok && result.responses) {
        setRecordList((prev) => [...prev, ...result.responses]);
        setHasMore(page < result.totalPages);
      } else {
        console.error(
          "Failed to fetch records:",
          result.message || "Unknown error"
        );
      }
    } catch (error) {
      console.error("Error fetching records:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMoreRecords = () => {
    if (hasMore) {
      setCurrentPage((prevPage) => prevPage + 1);
    }
  };

  const handleRecordActive = (recordId: string) => {
    const record = RecordList.find((item) => item._id === recordId);
    setRecordActive(record);
    setIsDrawerVisible(true);
  };

  return (
    <>
      {!isListActive ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1, gap: 8, paddingBottom: 20 }}
          className="bg-blue-50/10 flex flex-col gap-4 h-full w-full"
        >
          <View className="bg-white p-4 rounded-2xl relative h-[400]">
            <H3 className="text-xl">Last Result</H3>
            <View className="flex items-center justify-center mt-4">
              <CircularProgress score={RecordList[0]?.score || 0} />
            </View>
            <Text className="text-sm text-neutral-500 mt-4">
              We encourage you to take care of your mental health and seek a
              session as soon as possible for meditation to help alleviate
              anxiety and achieve mental relaxation. Remember that you are not
              alone on this journey, and we are here at Baserah to assist you.
            </Text>
          </View>

          <View className="flex-col rounded-xl bg-background py-4 px-4 ">
            <View className="flex-row">
              <Text className="text-lg font-semibold flex-1 ">Record</Text>
              <TouchableOpacity
                onPress={() => {
                  setIsListActive(!isListActive);
                }}
                className="flex-row items-center justify-center gap-1"
              >
                <Text className="text-sm font-semibold text-primary-500">
                  View all
                </Text>
                <ArrowRight size="20" color={colors.primary[500]} />
              </TouchableOpacity>
            </View>
            <View className="flex-col h-full gap-2">
              {RecordList.slice(0, 4).map((record, index) => (
                <View key={record._id} className="flex-row gap-2 py-2">
                  <View className="flex-1 gap-1">
                    <Text className="text-base font-semibold leading-8">
                      Anxiety Score: {record.score}
                    </Text>
                    <Text className="text-xs">
                      {getAnxietyLevel(record.score)}
                    </Text>
                  </View>
                  <View className=" w-1/4">
                    <Text className="text-xs">
                      {format(new Date(record.createdAt), "dd-MM-yyyy , p")}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      ) : (
        <View className="bg-blue-50/10 flex flex-col gap-4 h-full">
          <FlatList
            data={RecordList}
            contentContainerClassName="gap-2"
            showsVerticalScrollIndicator={false}
            onEndReached={loadMoreRecords}
            onEndReachedThreshold={0.1}
            ListFooterComponent={
              isLoading ? (
                <ActivityIndicator size="small" color={colors.primary[500]} />
              ) : null
            }
            renderItem={({ item, index }) => (
              <TouchableOpacity
                key={item._id}
                onPress={() => handleRecordActive(item._id)}
                className="flex flex-row justify-between items-center  bg-white border rounded-2xl border-blue-600 gap-2 overflow-hidden h-20"
              >
                <View className="bg-blue-600  w-6 h-20 flex-col justify-center items-center ">
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
                <View className=" px-4">
                  <Text className="text-sm">
                    {format(new Date(item.createdAt), "dd-MM-yyyy")}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          />
          <View className="flex-1 justify-center items-center  mt-10 mb-20">
            <Drawer
              visible={isDrawerVisible}
              onClose={() => setIsDrawerVisible(false)}
              title="Record Details"
              height="40%"
              className="max-h-[40%]"
            >
              <View className="flex flex-col flex-1 justify-center items-center w-full gap-6 px-6">
                <Text className="text-xl font-semibold text-neutral-600">
                  Details
                </Text>

                <View className="flex-col justify-center items-center gap-3 bg-blue-900 aspect-square w-1/3 rounded-xl p-2">
                  <Text className="text-white text-xs text-center">
                    Client's answers show
                  </Text>
                  <Text className="text-white text-4xl text-center">
                    {RecordActive?.score}
                  </Text>
                </View>
              </View>
            </Drawer>
          </View>
        </View>
      )}
    </>
  );
}
