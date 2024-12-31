import {
  View,
  Text,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  FlatList,
} from "react-native";
import React, { useState } from "react";
import { H3 } from "@/components/ui/Typography";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { LineChart } from "react-native-chart-kit";
import colors from "@/utils/colors";
import { format } from "date-fns";
import { ArrowRight } from "iconsax-react-native";
import { RecordListData } from "@/features/scale/constScale";
import { useRouter } from "expo-router";
import Drawer from "@/components/ui/Drawer";

export default function ScaleRecordPage() {
  const router = useRouter();
  const [RecordList, setRecordList] = useState(RecordListData);
  const [isListActive, setIsListActive] = useState(false);
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [RecordActive, setRecordActive] = useState<any>(RecordListData[0]);

  function handleRecordActive(record_Id: string) {
    setRecordActive(
      RecordListData.find((item) => item.record_Id === record_Id)
    );
    setIsDrawerVisible(true);
  }

  if (RecordActive === null) {
    return <Text>Record Active is null</Text>;
  }

  const chartConfig = {
    backgroundColor: "#fff",
    backgroundGradientFrom: "#fff",
    backgroundGradientTo: "#fff",
    decimalPlaces: 2, // optional, defaults to 2dp
    color: (opacity = 1) => "#fff",
    labelColor: (opacity = 1) => "#000",
    style: {
      borderRadius: 20,
    },
    propsForDots: {
      r: "3",
      strokeWidth: "1",
    },
  };

  const data = {
    labels: ["January", "February", "March", "April", "May", "June"],
    datasets: [
      {
        data: [20, 45, 28, 80, 99, 43],
        color: (opacity = 1) => colors.green[200], // optional
        strokeWidth: 2, // optional
        withDots: true,
      },
      {
        data: [60, 10, 60, 80, 60, 20],
        color: (opacity = 1) => colors.red[200], // optional
        strokeWidth: 2, // optional
        withDots: true,
      },
      {
        data: [40, 80, 90, 60, 20, 5],
        color: (opacity = 1) => colors.blue[200], // optional
        strokeWidth: 2, // optional
        withDots: true,
      },
      {
        data: [70, 20, 10, 7, 80, 15],
        color: (opacity = 1) => colors.orange[300], // optional
        strokeWidth: 2, // optional
        withDots: true,
      },
    ],
    // legend: [
    //   "Generalized Anxiety Disorder scale",
    //   "Depression scale",
    //   "Depression scale",
    //   "Generalized Anxiety Disorder scale",
    // ],
  };

  const legend = [
    { title: "Generalized Anxiety Disorder scale", color: colors.green[200] },
    { title: "Depression scale", color: colors.red[200] },
    { title: "Depression scale", color: colors.blue[200] },
    { title: "Generalized Anxiety Disorder scale", color: colors.orange[300] },
  ];

  return (
    <>
      {!isListActive ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1, gap: 8, paddingBottom: 20 }}
          className="bg-blue-50/10 flex flex-col gap-4 h-full w-full"
        >
          <Text className="text-lg font-semibold text-neutral-600">
            Last measure :{" "}
            <Text className="text-lg text-blue-900 ">Mood scale</Text>
          </Text>

          <View className="flex-row gap-2 justify-center items-center rounded-xl bg-background py-4 px-4">
            <View className="flex-1 gap-1">
              <Text className="text-lg font-semibold">
                Client shows a very high functional burnout
              </Text>
              <Text className="text-xs">Depression scale</Text>
              <Text className="text-xs">
                {format(new Date(), "dd-MM-yyyy")}
              </Text>
              <Text className="text-sm font-medium">
                According to the latest measure, the client has a very high
                depression
              </Text>
            </View>
            <View className="flex-col justify-center items-center gap-3 bg-blue-900 aspect-square w-1/3 rounded-xl p-2">
              <Text className="text-white text-xs text-center">
                Client's answers show
              </Text>
              <Text className="text-white text-4xl text-center">27</Text>
            </View>
          </View>

          <View className="overflow-hidden rounded-xl bg-background py-4 px-4">
            <Text className="text-lg font-semibold">Chart</Text>
            <LineChart
              data={data}
              width={Dimensions.get("window").width + 70} // from react-native
              height={140}
              withInnerLines={false}
              withOuterLines={false}
              withVerticalLabels={false}
              withHorizontalLabels={false}
              yAxisInterval={1} // optional, defaults to 1
              chartConfig={chartConfig}
              bezier
              style={{
                position: "relative",
                left: -60,
                borderRadius: 0,
                display: "flex",
              }}
            />
            {legend.map((dataset, index) => {
              return (
                <View
                  key={index}
                  className="flex flex-row items-center gap-2 py-1"
                >
                  <View
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: dataset.color }}
                  ></View>
                  <Text className="text-xs">{dataset.title}</Text>
                </View>
              );
            })}
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
              {RecordList.slice(0, 4).map((record, index) => {
                return (
                  <View key={index} className="flex-row gap-2 py-2">
                    <View className="flex-1 gap-1">
                      <Text className="text-base font-semibold">
                        {record.title}
                      </Text>
                      <Text className="text-xs">{record.desc}</Text>
                    </View>
                    <View className=" w-1/4">
                      <Text className="text-xs">
                        {format(new Date(record.date), "dd-MM-yyyy")}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        </ScrollView>
      ) : (
        <View className="bg-blue-50/10 flex flex-col gap-4 ">
          <FlatList
            data={RecordListData}
            contentContainerClassName="gap-2"
            showsVerticalScrollIndicator={false}
            renderItem={({ item, index }) => (
              <TouchableOpacity
                key={item.record_Id}
                onPress={() => handleRecordActive(item.record_Id)}
                className="flex flex-row justify-between items-center  bg-white border rounded-2xl border-blue-600 gap-2 overflow-hidden h-20"
              >
                <View className="bg-blue-600  w-6 h-20 flex-col justify-center items-center ">
                  <Text className="text-white font-semibold text-center text-sm">
                    {index + 1}
                  </Text>
                </View>
                <View className="flex-1 p-2">
                  <Text className="text-lg font-medium leading-5">
                    {item.title}
                  </Text>
                  <Text className="text-xs">{item.desc}</Text>
                </View>
                <View className=" px-4">
                  <Text className="text-sm">
                    {format(item.date, "dd-MM-yyyy")}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          />
          <View className="flex-1 justify-center items-center  mt-10 mb-20">
            <Drawer
              visible={isDrawerVisible}
              onClose={() => setIsDrawerVisible(false)}
              title="My Drawer"
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
                    {RecordActive.score}
                  </Text>
                </View>
                <Text className="text-xs">
                  {format(RecordActive.date, "dd-MM-yyyy")}
                </Text>

                <Text className="text-xl font-semibold text-neutral-600 text-center">
                  {RecordActive.desc}
                </Text>
              </View>
            </Drawer>
          </View>
        </View>
      )}
    </>
  );
}
