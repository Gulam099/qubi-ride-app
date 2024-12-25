import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Button } from "@/components/ui/Button";
import Anxity from "@/features/scale/assets/images/anxiety.svg";
import { Progress } from "@/components/ui/Progress";
import Drawer from "@/components/ui/Drawer";
import Caution from "@/assets/icon/caution.svg";
import { H3 } from "@/components/ui/Typography";

// Demo questions
const defaultQuestions = [
  {
    id: 1,
    question: "Feeling angry, anxious, or having strong emotions",
    options: [
      { title: "Never", points: 0 },
      { title: "Somedays", points: 1 },
      { title: "More than half the days", points: 2 },
      { title: "Nearly every day", points: 3 },
    ],
  },
  {
    id: 2,
    question: "Difficulty in stopping or controlling stress/worry",
    options: [
      { title: "Never", points: 0 },
      { title: "Somedays", points: 1 },
      { title: "More than half the days", points: 2 },
      { title: "Nearly every day", points: 3 },
    ],
  },
  {
    id: 3,
    question: "Feeling restless or on edge",
    options: [
      { title: "Never", points: 0 },
      { title: "Somedays", points: 1 },
      { title: "More than half the days", points: 2 },
      { title: "Nearly every day", points: 3 },
    ],
  },
  {
    id: 4,
    question: "Difficulty in concentrating or mind going blank",
    options: [
      { title: "Never", points: 0 },
      { title: "Somedays", points: 1 },
      { title: "More than half the days", points: 2 },
      { title: "Nearly every day", points: 3 },
    ],
  },
  {
    id: 5,
    question: "Feeling tired or having low energy",
    options: [
      { title: "Never", points: 0 },
      { title: "Somedays", points: 1 },
      { title: "More than half the days", points: 2 },
      { title: "Nearly every day", points: 3 },
    ],
  },
  {
    id: 6,
    question: "Difficulty in sleeping or staying asleep",
    options: [
      { title: "Never", points: 0 },
      { title: "Somedays", points: 1 },
      { title: "More than half the days", points: 2 },
      { title: "Nearly every day", points: 3 },
    ],
  },
  {
    id: 7,
    question: "Feeling irritable or easily annoyed",
    options: [
      { title: "Never", points: 0 },
      { title: "Somedays", points: 1 },
      { title: "More than half the days", points: 2 },
      { title: "Nearly every day", points: 3 },
    ],
  },
  {
    id: 8,
    question: "Muscle tension or muscle aches",
    options: [
      { title: "Never", points: 0 },
      { title: "Somedays", points: 1 },
      { title: "More than half the days", points: 2 },
      { title: "Nearly every day", points: 3 },
    ],
  },
  {
    id: 9,
    question: "Feeling afraid as if something awful might happen",
    options: [
      { title: "Never", points: 0 },
      { title: "Somedays", points: 1 },
      { title: "More than half the days", points: 2 },
      { title: "Nearly every day", points: 3 },
    ],
  },
  // Add more questions as needed
];

export default function GeneralizedAnxietyDisorderScale() {
  const [currentStep, setCurrentStep] = useState("start"); // "start", "quiz", "result"
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [score, setScore] = useState(0);

  const handleStartQuiz = () => {
    setCurrentStep("quiz");
  };

  const handleNextQuestion = () => {
    if (selectedOption === null) {
      setIsDrawerVisible(true);
    }
    if (selectedOption !== null) {
      setScore(
        score +
          defaultQuestions[currentQuestionIndex].options[selectedOption].points
      );
      setSelectedOption(null);

      if (currentQuestionIndex < defaultQuestions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
        setCurrentStep("result");
      }
    }
  };

  const renderStartScreen = () => (
    <View className="p-4 h-full flex flex-col justify-between bg-blue-50/10">
      {/* Header Section */}
      <View className="flex gap-4 items-center bg-white rounded-2xl px-4 py-8">
        <Anxity className="w-24 h-24 mb-4" resizeMode="contain" />
        <Text className="text-lg font-bold text-center mb-2">
          Generalized Anxiety Disorder Scale
        </Text>
        <Text className="text-gray-600 text-center leading-6">
          This simple test will help you assess and understand your level of
          anxiety. Your answers will assist us in determining your mental health
          level and guiding you towards a suitable session to support your
          mental health.
        </Text>
      </View>

      {/* Reference Section */}
      <View className="bg-blue-50/50 p-4 rounded-md mt-6">
        <Text className="text-xs text-gray-800 text-center">
          Reference: Prepared by doctors Robert L. Spitzer, Janet B.W. Williams,
          Kurt Kroenke, and colleagues, with an educational grant from Pfizer
          Inc.
        </Text>
      </View>

      {/* Action Button */}
      <Button  onPress={handleStartQuiz}>
        <Text className="text-white font-semibold">Start Now</Text>
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
          <Text className="text-gray-500  text-sm font-medium py-6">
            During the past two weeks, how much have the following problems
            bothered you :
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

        <Button
          
          onPress={handleNextQuestion}
          // disabled={selectedOption === null}
        >
          <Text className="text-white font-semibold">Next</Text>
        </Button>
      </View>
    );
  };

  const renderResultScreen = () => (
    <View className="p-4 h-full flex flex-col justify-center items-center bg-blue-50/10">
      <Text className="text-2xl font-bold text-center mb-4">Your Score</Text>
      <Text className="text-gray-800 text-center text-4xl mb-6">{score}</Text>
      <Text className="text-gray-600 text-center mb-6">
        Thank you for completing the test. This score will help you understand
        your anxiety level better.
      </Text>
      <Button
        
        onPress={() => setCurrentStep("start")}
      >
        <Text className="text-white font-semibold">Retake Test</Text>
      </Button>
    </View>
  );

  return (
    <>
      <View className="flex-1 h-full justify-center items-center">
        {currentStep === "start" && renderStartScreen()}
        {currentStep === "quiz" && renderQuizScreen()}
        {currentStep === "result" && renderResultScreen()}
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
              <Caution height={80} width={80} />
            </View>

            <H3 className="border-none ">You must make a choice</H3>
            <Button onPress={()=>setIsDrawerVisible(false)} className="w-full ">
              <Text className="text-white font-medium">Ok</Text>
            </Button>
          </View>
        </Drawer>
      </View>
    </>
  );
}
