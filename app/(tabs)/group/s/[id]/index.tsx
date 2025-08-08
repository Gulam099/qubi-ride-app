import React, { useEffect, useState } from "react";
import { View, ScrollView, Image, FlatList } from "react-native";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { Button } from "@/components/ui/Button";
import { toast } from "sonner-native";
import ScheduleSelector from "@/features/Home/Components/ScheduleSelector";
import { useSelector } from "react-redux";
import { UserType } from "@/features/user/types/user.type";
import BackButton from "@/features/Home/Components/BackButton";
import NotificationIconButton from "@/features/Home/Components/NotificationIconButton";
import {
  ChartCircle,
  ExportCurve,
  Heart,
  MessageText,
  Messages1,
  People,
  Profile2User,
  Star1,
} from "iconsax-react-native";
import { Text } from "@/components/ui/Text";
import ProfileImage from "@/features/account/components/ProfileImage";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/Accordion";
import { currencyFormatter } from "@/utils/currencyFormatter.utils";
import { apiNewUrl } from "@/const";
import { useUser } from "@clerk/clerk-expo";
import { useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

export default function SupportDetailPage() {
  const { id } = useLocalSearchParams();
  const { user } = useUser();
  const userId = user?.publicMetadata.dbPatientId as string;
  const { t } = useTranslation();

  const [groupDetails, setGroupDetails] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDateTime, setSelectedDateTime] = useState("");
  const [showScheduleSelector, setShowScheduleSelector] = useState(false);

  useEffect(() => {
    const fetchGroupDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${apiNewUrl}/api/support-groups/get/${id}`
        );
        const result = await response.json();

        if (response.ok && result.success) {
          setGroupDetails(result.data);
        } else {
          throw new Error(result.message || t("Failed to fetch group details"));
        }
      } catch (error) {
        console.error("Error fetching group details:", error);
        toast.error(t("Error fetching support group details"));
      } finally {
        setLoading(false);
      }
    };

    fetchGroupDetails();
  }, [id]);

  const handleBuy = () => {
    setShowScheduleSelector(true);
  };

  const { mutate: bookGroup, isPending: isSubmitting } = useMutation({
    mutationFn: async () => {
      if (!selectedDateTime) {
        throw new Error(t("Please select a date and time"));
      }

      // 1. Create Group Booking
      const bookingPayload = {
        userId: userId,
        doctorId: groupDetails.doctor._id,
        groupId: id,
        dateTime: selectedDateTime,
        amount: groupDetails.cost,
        paymentStatus: "pending",
      };

      const bookingResponse = await fetch(
        `${apiNewUrl}/api/groups-booking/add`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(bookingPayload),
        }
      );

      console.log("bookingResponse", bookingResponse);
      const bookingResult = await bookingResponse.json();
      console.log("bookingResult", bookingResult);
      if (!bookingResponse.ok) {
        throw new Error(bookingResult?.message || t("Group booking failed"));
      }

      // 2. Create Payment record
      const paymentPayload = {
        userId: userId,
        doctorId: groupDetails.doctor._id,
        groupId: groupDetails._id,
        groupbookingId: bookingResult?.data?._id,
        amount: groupDetails.cost,
        currency: "SAR",
        description: "support_group_session ",
        status: "initiated",
        bookingType: "Support Group",
      };

      const paymentResponse = await fetch(`${apiNewUrl}/api/payments/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(paymentPayload),
      });

      const paymentResult = await paymentResponse.json();
      if (!paymentResponse.ok) {
        throw new Error(paymentResult?.message || t("Payment creation failed"));
      }

      const paymentId = paymentResult?.payment?.internalPaymentId;
      if (!paymentId) throw new Error(t("Payment ID missing"));

      // 3. Process Payment to get redirect URL
      const processResponse = await fetch(
        `${apiNewUrl}/api/payments/${paymentId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const processResult = await processResponse.json();
      if (!processResponse.ok) {
        throw new Error(processResult?.error || t("Payment processing failed"));
      }

      return {
        paymentId,
        bookingId: bookingResult?.booking?._id,
        bookingData: {
          userId,
          groupId: groupDetails._id,
          selectedDateTime,
          amount: groupDetails.price,
          groupTitle: groupDetails.title,
        },
        redirectUrl: processResult?.redirectUrl,
      };
    },
    onSuccess: ({ paymentId, bookingId, bookingData, redirectUrl }) => {
      toast.success(t("Group booking created successfully"));

      if (redirectUrl) {
        const queryParams = new URLSearchParams({
          userId: bookingData.userId,
          groupId: bookingData.groupId,
          selectedDateTime: bookingData.selectedDateTime,
          amount: bookingData.amount,
          groupTitle: bookingData.groupTitle,
          bookingId: bookingId || "",
          redirectUrl,
          bookingType: "group", // Add booking type to distinguish
        });

        router.push(`/(stacks)/fatoorah/MyFatoorahWebView?${queryParams}`);
      } else {
        toast.error(t("Redirect URL not found"));
      }
    },
    onError: (err: any) => {
      toast.error(err.message || t("Something went wrong. Please try again"));
      console.log("Error booking group:", err);
    },
  });

  console.log("groupDetails", groupDetails);
  const finalSubmit = () => {
    bookGroup();
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-gray-500">{t("Loading...")}</Text>
      </View>
    );
  }

  if (!groupDetails) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-red-500">{t("Support Group Not Found")}</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerShadowVisible: false,
          headerTitle: () => (
            <Text className="font-semibold text-lg leading-8">
              {groupDetails.title}
            </Text>
          ),
          headerLeft: () => <BackButton />,
          headerRight: () => <NotificationIconButton className="mr-4" />,
        }}
      />

      <ScrollView className=" bg-blue-50/10 flex-1">
        {!showScheduleSelector ? (
          <View className="px-4 py-4 gap-4">
            {/* Group Header */}
            <View className="bg-white py-6 rounded-2xl">
              <View className="flex-row justify-between pb-4">
                <View className="gap-2 px-4">
                  <Text className="font-semibold text-xl">
                    {groupDetails.title}
                  </Text>
                  <Text className="text-gray-500 capitalize">
                    {groupDetails.category}
                  </Text>
                </View>
                <View className="gap-3 px-4 flex-row items-center justify-center">
                  <View className="p-2 bg-blue-50/20 aspect-square rounded-full items-center justify-center">
                    <ExportCurve size="20" color="#000" />
                  </View>
                  <Text className="text-gray-500 leading-8">
                    {groupDetails.shares}
                  </Text>
                  <View className="p-2 bg-blue-50/20 aspect-square rounded-full items-center justify-center">
                    <Heart size="20" color="#000" />
                  </View>
                  <Text className="text-gray-500 leading-8 ">
                    {groupDetails.likes}
                  </Text>
                </View>
              </View>
              <Image
                source={{ uri: groupDetails.imageUrl }}
                className="w-full h-64"
                resizeMode="cover"
              />
              <View className="px-4 py-6 gap-4">
                <View className="gap-3 flex-row items-center justify-start">
                  <View className="p-2 bg-blue-50/20 aspect-square rounded-full items-center justify-center">
                    <People size="20" color="#000" />
                  </View>
                  <Text className="text-gray-500 leading-8">
                    {groupDetails.recordedCount} {t("Recorded")}
                  </Text>
                  <View className="p-2 bg-blue-50/20 aspect-square rounded-full items-center justify-center">
                    <Star1 size="20" color="#000" />
                  </View>
                  <Text className="text-gray-500 leading-8 ">
                    {groupDetails.rating}
                    {t("Rate")}
                  </Text>
                </View>
                <Text className="text-gray-600 mt-4">
                  {groupDetails.components}
                </Text>
              </View>
            </View>

            {/* Group Goals */}
            <View className="gap-2">
              <View className="gap-2 flex-row items-center justify-start">
                <View className="bg-white rounded-full p-2">
                  <ChartCircle size="24" color="#000" />
                </View>
                <Text className="font-semibold text-xl leading-10">
                  {t("Support Group Goals")}
                </Text>
              </View>
              {/* {groupDetails.groupGoals.map((goal: string, index: number) => (
                <Text key={`goal-${index}`} className="text-gray-700 pl-6 ">
                  â€¢ {goal}
                </Text>
              ))} */}
              <Text className="text-gray-600 mt-2 pl-8">
                {groupDetails.goals}
              </Text>
            </View>

            {/* Program Content */}
            {/* <View className="gap-2">
              <View className="gap-2 flex-row items-center justify-start">
                <View className="bg-white rounded-full p-2">
                  <MessageText size="24" color="#000" />
                </View>
                <Text className="font-semibold text-xl leading-10">
                  Program Content
                </Text>
              </View>
              {groupDetails.programContent.map(
                (content: any, index: number) => (
                  <Text key={`content-${index}`} className="text-gray-700 pl-6">
                    â€¢ {content.title}: {content.description}
                  </Text>
                )
              )}
            </View> */}

            {/* Consultants */}
            <View className="gap-2">
              <View className="gap-2 flex-row items-center justify-start">
                <View className="bg-white rounded-full p-2">
                  <Profile2User size="24" color="#000" />
                </View>
                <Text className="font-semibold text-xl leading-10">
                  {t("Consultants")}
                </Text>
              </View>
              <FlatList
                data={groupDetails.specialist}
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item._id?.toString()}
                renderItem={({ item }) => (
                  <View className="items-center bg-white flex-row gap-2 py-4 px-6 rounded-2xl">
                    <ProfileImage
                      className="size-16"
                      imageUrl={item.image}
                      name={item.full_name}
                    />
                    <View className="flex-col gap-1">
                      <Text className="text-gray-800 mt-2 text-center font-medium text-lg">
                        {item.full_name}
                      </Text>
                      <Text className="text-gray-500 text-sm">
                        {item.specialization}
                      </Text>
                    </View>
                  </View>
                )}
                contentContainerClassName="gap-2 py-6"
              />
            </View>

            {/* FAQ */}
            <View className="gap-2">
              <View className="gap-2 flex-row items-center justify-start">
                <View className="bg-white rounded-full p-2">
                  <Messages1 size="24" color="#000" />
                </View>
                <Text className="font-semibold text-xl leading-10">
                  {t("Frequently Asked Questions")}
                </Text>
              </View>
              {/* <Accordion type="multiple" collapsible>
                {groupDetails.faq.map((faq: any, index: number) => (
                  <AccordionItem value={`faq-${index}`} key={`faq-${index}`}>
                    <AccordionTrigger>
                      <Text>{faq.question}</Text>
                    </AccordionTrigger>
                    <AccordionContent>
                      <Text>{faq.answer}</Text>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion> */}
              <Text className="text-gray-600 mt-2 pl-8">
                {groupDetails.faq}
              </Text>
            </View>

            <Button
              className="w-full bg-purple-600 py-4 rounded-md my-6"
              onPress={handleBuy}
            >
              <Text className="text-white font-semibold">
                {t("Pay")} {currencyFormatter(groupDetails.cost)}
              </Text>
            </Button>
          </View>
        ) : (
          <View className="p-4 gap-4">
            {/* Schedule Selector */}
            <ScheduleSelector
              selectedDateTime={selectedDateTime}
              setSelectedDateTime={setSelectedDateTime}
              availableTimes={groupDetails.availableDates || []}
            />
            <Button className="w-full " onPress={finalSubmit}>
              <Text className="text-white font-semibold">
                {t("Confirm Schedule")}
              </Text>
            </Button>
            <Button
              className="w-full "
              variant={"ghost"}
              onPress={() => {
                setShowScheduleSelector(false);
              }}
            >
              <Text className="text-neutral-700 font-semibold">
                {t("Back")}
              </Text>
            </Button>
          </View>
        )}
      </ScrollView>
    </>
  );
}
