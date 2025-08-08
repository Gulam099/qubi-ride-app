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

export default function FaqPage() {
  const faqData = [
    {
      id: "1",
      question: "How long is the program valid for?",
      answer: "The program is valid for one year from the date of enrollment.",
    },
    {
      id: "2",
      question: "How do I enroll in the program?",
      answer:
        "You can enroll by visiting our website and completing the registration form.",
    },
    {
      id: "3",
      question: "What support is available?",
      answer: "We offer 24/7 customer support via email and chat.",
    },
    {
      id: "4",
      question: "Can I cancel my enrollment?",
      answer:
        "Yes, you can cancel your enrollment within 14 days of signing up.",
    },
    {
      id: "5",
      question: "Are there any discounts available?",
      answer:
        "We offer discounts during seasonal sales. Keep an eye on our website for updates.",
    },
    {
      id: "6",
      question: "Is the program accessible on mobile?",
      answer: "Yes, our platform is fully optimized for mobile devices.",
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
        <Text className="text-xl font-bold text-neutral-800 ">Help Center</Text>
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
        Frequently Asked Questions (FAQ)
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
