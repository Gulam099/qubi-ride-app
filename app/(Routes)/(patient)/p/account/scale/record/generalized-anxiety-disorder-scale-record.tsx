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
import { ProgressChart } from "react-native-chart-kit";
import colors from "@/utils/colors";
import { ArrowRight } from "iconsax-react-native";
import { useSelector } from "react-redux";
import { UserType } from "@/features/user/types/user.type";
import { apiBaseUrl } from "@/features/Home/constHome";

type RecordType = {
  _id: string;
  score: number;
  createdAt: string;
};

export default function GeneralizedAnxietyDisorderScale() {
  const [RecordList, setRecordList] = useState<RecordType[]>([]);
  const [isListActive, setIsListActive] = useState(false);
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [RecordActive, setRecordActive] = useState<RecordType | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const user: UserType = useSelector((state: any) => state.user);

  useEffect(() => {
    fetchRecords(currentPage);
  }, [currentPage]);

  const fetchRecords = async (page: number) => {
    if (!hasMore || isLoading) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `${apiBaseUrl}/api/gad-scale/user/${user._id}?page=${page}`
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

  const data = {
    labels: ["Anxiety"], // optional
    data: [RecordActive?.score / 100 || 0],
  };

  const chartConfig = {
    backgroundColor: "#fff",
    backgroundGradientFrom: "#fff",
    backgroundGradientFromOpacity: 0,
    backgroundGradientTo: "#fff",
    backgroundGradientToOpacity: 0,
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
          <View className="bg-white p-4 rounded-2xl relative h-[400]">
            <H3 className="text-xl">Last Result</H3>
            <View className="absolute top-[140] left-[155] z-10">
              <Text className=" text-blue-600 font-semibold  w-20 text-center">
                {RecordList.length > 0 ? "Moderate Anxiety" : "No Data"}
              </Text>
              <Text className="text-3xl font-semibold text-blue-600 text-center">
                {RecordList.length > 0 ? `${RecordList[0]?.score}` : "N/A"}
              </Text>
            </View>
            <ProgressChart
              data={data}
              width={Dimensions.get("window").width - 60}
              height={250}
              strokeWidth={18}
              radius={60}
              chartConfig={chartConfig}
              hideLegend={true}
            />
            <Text className="text-sm text-neutral-500">
              We encourage you to take care of your mental health and seek a
              session as soon as possible for meditation to help alleviate
              anxiety and achieve mental relaxation. Remember that you are not
              alone on this journey, and we are here at Baserah to assist you.
            </Text>
          </View>

          <View className="flex-col rounded-xl bg-background py-4 px-4 ">
            <View className="flex-row">
              <Text className="text-lg font-semibold flex-1 ">Record</Text>
              <View className="flex-row items-center justify-center gap-1">
                <Text
                  onPress={() => {
                    setIsListActive(!isListActive);
                  }}
                  className="text-sm font-semibold  text-end text-primary-500 "
                >
                  View all
                </Text>
                <ArrowRight size="20" color={colors.primary[500]} />
              </View>
            </View>
            <View className="flex-col h-full gap-2">
              {RecordList.slice(0, 4).map((record, index) => (
                <View key={record._id} className="flex-row gap-2 py-2">
                  <View className="flex-1 gap-1">
                    <Text className="text-base font-semibold">
                      Anxiety Score: {record.score}
                    </Text>
                    <Text className="text-xs">Moderate Anxiety</Text>
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
                  <Text className="text-lg font-medium leading-5">
                    Anxiety Score: {item.score}
                  </Text>
                  <Text className="text-xs">Moderate Anxiety</Text>
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
                {/* <Text className="text-xs">
                  {format(new Date(RecordActive?.createdAt as string), "dd-MM-yyyy")}
                </Text> */}
              </View>
            </Drawer>
          </View>
        </View>
      )}
    </>
  );
}
