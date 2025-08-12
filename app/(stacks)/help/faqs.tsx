import { View, FlatList, TouchableOpacity, Linking } from "react-native";
import React, { useRef } from "react";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/Accordion";
import { Text } from "@/components/ui/Text";
import { Headphone } from "iconsax-react-native";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { X } from "lucide-react-native";
import { Button } from "@/components/ui/Button";
import { H3 } from "@/components/ui/Typography";
import { t } from "i18next";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";

export default function FaqPage() {
  const { t } = useTranslation();

  const faqData = [
    {
      id: "1",
      question: t("HowLongIsTheProgramValidForQ"),
      answer: t("HowLongIsTheProgramValidForA"),
    },
    {
      id: "2",
      question: t("HowDoIEnrollInTheProgramQ"),
      answer: t("HowDoIEnrollInTheProgramA"),
    },
    {
      id: "3",
      question: t("WhatSupportIsAvailableQ"),
      answer: t("WhatSupportIsAvailableA"),
    },
    {
      id: "4",
      question: t("CanICancelMyEnrollmentQ"),
      answer: t("CanICancelMyEnrollmentA"),
    },
    {
      id: "5",
      question: t("AreThereAnyDiscountsAvailableQ"),
      answer: t("AreThereAnyDiscountsAvailableA"),
    },
    {
      id: "6",
      question: t("IsTheProgramAccessibleOnMobileQ"),
      answer: t("IsTheProgramAccessibleOnMobileA"),
    },
  ];

  const contactUsBottomSheetRef = useRef<BottomSheet>(null);

  const handleCall = (phoneNumber: string) => {
    const phoneUrl = `tel:${phoneNumber}`;
    Linking.openURL(phoneUrl).catch((err) =>
      console.error("Failed to open dialer:", err)
    );
  };

  return (
    <View className="bg-blue-50/20 h-full p-4">
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-xl font-bold text-neutral-800 ">
          {" "}
          {t("HelpCenter")}
        </Text>
        <TouchableOpacity
          onPress={() => contactUsBottomSheetRef.current?.expand()}
          activeOpacity={0.7}
        >
          <View className="rounded-full p-2 bg-background">
            <Headphone size="24" color="#000" />
          </View>
        </TouchableOpacity>
      </View>
      <Text className="text-lg font-medium text-neutral-700  mb-4">
        {t("Frequently Asked Questions")}
      </Text>
      <Accordion type="single" collapsible className="">
        <FlatList
          data={faqData}
          keyExtractor={(item) => item.id}
          contentContainerClassName="gap-4"
          renderItem={({ item }) => (
            <AccordionItem
              value={item.id}
              className="bg-background rounded-2xl px-3 flex-col justify-center items-start"
            >
              <AccordionTrigger>
                <Text className="text-neutral-600 font-medium ">
                  {item.question}
                </Text>
              </AccordionTrigger>
              <AccordionContent>
                <Text className="text-neutral-600">{item.answer}</Text>
              </AccordionContent>
            </AccordionItem>
          )}
        />
      </Accordion>
      <BottomSheet
        ref={contactUsBottomSheetRef}
        index={-1}
        enablePanDownToClose={true}
        style={{ zIndex: 500 }}
      >
        <BottomSheetView className="w-full flex-1 bg-white">
          <View className="flex flex-col justify-center items-center w-full gap-4 p-6 mx-auto">
            <Button
              size={"icon"}
              variant={"ghost"}
              className="absolute top-2 right-2 rounded-full p-0 text-neutral-800"
              onPress={() => contactUsBottomSheetRef.current?.close()}
            >
              <X size={20} color={"#262626"} />
            </Button>

            <View className="flex flex-col justify-center items-center w-full gap-4 py-8">
              <H3 className="border-none text-lg text-neutral-700 text-center">
                {t("contactUsTitle")}
              </H3>
              <Text className="text-base text-neutral-500">
                {t("contactUsSubtitle")}
              </Text>

              <Button
                onPress={() => {
                  contactUsBottomSheetRef.current?.close();
                  router.push(
                    "https://baseerah.zohodesk.in/portal/en/newticket"
                  );
                }}
                className="w-full"
              >
                <Text className="text-white font-semibold">
                  {t("addTicket")}
                </Text>
              </Button>
              <Text className="text-base text-neutral-500">{t("or")}</Text>
              <View className="mt-4 w-full">
                <Button className="w-full">
                  <TouchableOpacity
                    onPress={() => handleCall("+9665555550100")}
                  >
                    <Text className="text-white font-semibold">
                      Call +966 5555550100
                    </Text>
                  </TouchableOpacity>
                </Button>
              </View>
            </View>
          </View>
        </BottomSheetView>
      </BottomSheet>
    </View>
  );
}
