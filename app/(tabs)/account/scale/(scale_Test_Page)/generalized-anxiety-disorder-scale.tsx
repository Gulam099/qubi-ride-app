import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Button } from "@/components/ui/Button";
import { Progress } from "@/components/ui/Progress";
import Drawer from "@/components/ui/Drawer";
import { H3 } from "@/components/ui/Typography";
import { CustomIcons } from "@/const";
import { useRouter } from "expo-router";
import { useSelector } from "react-redux";
import { UserType } from "@/features/user/types/user.type";
import { apiBaseUrl } from "@/features/Home/constHome";
import { useUser } from "@clerk/clerk-expo";
import { useTranslation } from "react-i18next";

export default function GeneralizedAnxietyDisorderScale() {
  const [currentStep, setCurrentStep] = useState("start"); // "start", "quiz", "result"
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [answers, setAnswers] = useState<any[]>([]);
  const router = useRouter();
  const { user } = useUser();
  const userId = user?.publicMetadata.dbPatientId as string;
  const { t } = useTranslation();

  const defaultQuestions = [
    {
      id: 1,
      question: t("Feeling angry, anxious, or having strong emotions"),
      options: [
        { title: t("Never"), points: 0 },
        { title: t("Somedays"), points: 1 },
        { title: t("More than half the days"), points: 2 },
        { title: t("Nearly everyday"), points: 3 },
      ],
    },
    {
      id: 2,
      question: t("Difficulty in stopping or controlling stress/worry"),
      options: [
        { title: t("Never"), points: 0 },
        { title: t("Somedays"), points: 1 },
        { title: t("More than half the days"), points: 2 },
        { title: t("Nearly everyday"), points: 3 },
      ],
    },
    {
      id: 3,
      question: t("Feeling restless or on edge"),
      options: [
        { title: t("Never"), points: 0 },
        { title: t("Somedays"), points: 1 },
        { title: t("More than half the days"), points: 2 },
        { title: t("Nearly everyday"), points: 3 },
      ],
    },
    {
      id: 4,
      question: t("Difficulty in concentrating or mind going blank"),
      options: [
        { title: t("Never"), points: 0 },
        { title: t("Somedays"), points: 1 },
        { title: t("More than half the days"), points: 2 },
        { title: t("Nearly everyday"), points: 3 },
      ],
    },
    {
      id: 5,
      question: t("Feeling tired or having low energy"),
      options: [
        { title: t("Never"), points: 0 },
        { title: t("Somedays"), points: 1 },
        { title: t("More than half the days"), points: 2 },
        { title: t("Nearly everyday"), points: 3 },
      ],
    },
    {
      id: 6,
      question: t("Difficulty in sleeping or staying asleep"),
      options: [
        { title: t("Never"), points: 0 },
        { title: t("Somedays"), points: 1 },
        { title: t("More than half the days"), points: 2 },
        { title: t("Nearly everyday"), points: 3 },
      ],
    },
    {
      id: 7,
      question: t("Feeling irritable or easily annoyed"),
      options: [
        { title: t("Never"), points: 0 },
        { title: t("Somedays"), points: 1 },
        { title: t("More than half the days"), points: 2 },
        { title: t("Nearly everyday"), points: 3 },
      ],
    },

    // Add more questions as needed
  ];

  const handleStartQuiz = () => {
    setCurrentStep("quiz");
  };

  const handleNextQuestion = () => {
    if (selectedOption === null) {
      setIsDrawerVisible(true);
      return;
    }

    const currentQuestion = defaultQuestions[currentQuestionIndex];
    const newAnswer = {
      question: currentQuestion.question,
      response: currentQuestion.options[selectedOption].title,
    };

    if (currentQuestionIndex < defaultQuestions.length - 1) {
      setAnswers((prev) => [...prev, newAnswer]);
      setSelectedOption(null);
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Include the last question's answer before submitting
      setAnswers((prev) => [...prev, newAnswer]);
      handleSubmit([...answers, newAnswer]);
    }
  };

  const handleSubmit = async (finalAnswers: any[]) => {
    try {
      const payload = {
        userId: userId, // Replace with dynamic user ID if available
        answers: finalAnswers,
      };
      console.log(payload);

      const response = await fetch(`${apiBaseUrl}/api/gad-scale/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      console.log(result);

      if (response.ok) {
        if (result.response) {
          router.push(
            "/account/scale/record/generalized-anxiety-disorder-scale-record"
          );
        } else {
          console.log("Submission successful, but no response data.");
        }
      } else {
        console.error(
          "Failed to submit data:",
          result.message || "Unknown error"
        );
      }
    } catch (error) {
      console.error("Error submitting data:", error);
    }
  };

  const renderStartScreen = () => (
    <View className="p-4 h-full flex flex-col justify-between gap-4 bg-blue-50/10">
      <View className="flex-1 gap-4 items-center justify-center bg-white rounded-2xl px-4 py-8">
        <CustomIcons.Anxiety.Icon
          className="w-24 h-24 mb-4"
          resizeMode="contain"
        />
        <Text className="text-lg font-bold text-center mb-2">
          {t(" Generalized Anxiety Disorder Scale")}
        </Text>
        <Text className="text-gray-600 text-center leading-6">
          {t("GAD Description")}
        </Text>
      </View>

      <View className="bg-blue-50/50 p-4 rounded-md mt-6">
        <Text className="text-xs text-gray-800 text-center">
          {t("GAD Reference")}
        </Text>
      </View>

      <Button onPress={handleStartQuiz}>
        <Text className="text-white font-semibold">{t("Start Now")}</Text>
      </Button>
    </View>
  );

  const renderQuizScreen = () => {
    const question = defaultQuestions[currentQuestionIndex];
    const progressValue =
      ((currentQuestionIndex + 1) / defaultQuestions.length) * 100;

    return (
      <View className="p-4 h-full flex flex-col justify-between bg-blue-50/10">
        <View>
          <Text className="text-lg font-bold text-center mb-4">
            {` ${currentQuestionIndex + 1} from ${defaultQuestions.length}`}
          </Text>
          <Progress value={progressValue} />
          <Text className="text-gray-500 text-sm font-medium py-6">
            {t(
              "During the past two weeks, how much have the following problems bothered you:"
            )}
          </Text>
          <Text className="text-gray-900 font-bold  text-xl mb-6">
            {question.question}
          </Text>
          <View className="flex gap-4">
            {question.options.map((option, index) => (
              <TouchableOpacity
                key={index}
                className={`p-4 rounded-lg border ${
                  selectedOption === index
                    ? "bg-blue-50/20  border-blue-600"
                    : "bg-white border-transparent"
                }`}
                onPress={() => setSelectedOption(index)}
              >
                <Text
                  className={`font-medium ${
                    selectedOption === index ? "text-blue-700" : "text-gray-800"
                  }`}
                >
                  {option.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <Button onPress={handleNextQuestion}>
          <Text className="text-white font-semibold">{t("Next")}</Text>
        </Button>
      </View>
    );
  };

  return (
    <>
      <View className="flex-1 h-full justify-center items-center">
        {currentStep === "start" && renderStartScreen()}
        {currentStep === "quiz" && renderQuizScreen()}
      </View>

      <View className=" justify-center items-center  mt-10 mb-20 absolute">
        <Drawer
          visible={isDrawerVisible}
          onClose={() => setIsDrawerVisible(false)}
          title="My Drawer"
          height="40%"
          className="max-h-[40%]"
        >
          <View className="flex flex-col flex-1 justify-center items-center w-full gap-6 px-6">
            <View className=" aspect-square  flex justify-center items-center relative overflow-visible  p-2">
              <View className="bg-blue-50/20 aspect-square rounded-full w-[5.5rem] absolute "></View>
              <CustomIcons.Caution.Icon height={80} width={80} />
            </View>

            <H3 className="border-none ">{t("You must make a choice")}</H3>
            <Button
              onPress={() => setIsDrawerVisible(false)}
              className="w-full "
            >
              <Text className="text-white font-medium">{t("Ok")}</Text>
            </Button>
          </View>
        </Drawer>
      </View>
    </>
  );
}
