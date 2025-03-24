import { View, FlatList } from "react-native";
import React from "react";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/Accordion";
import { Text } from "@/components/ui/Text";
import { Headphone } from "iconsax-react-native";

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

  return (
    <View className="bg-blue-50/20 h-full p-4">
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-xl font-bold text-neutral-800 ">Help Center</Text>
        <View className="rounded-full p-2 bg-background">
          <Headphone size="24" color="#000" />
        </View>
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
    </View>
  );
}
