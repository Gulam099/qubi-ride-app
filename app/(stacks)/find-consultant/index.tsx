import { router } from 'expo-router';
import React from 'react';
import { View, Text, TouchableOpacity, } from 'react-native';
import { Button } from "@/components/ui/Button";

const ConsultationScreen = () => {
  return (
    <View className="flex-1 bg-blue-700">

      {/* Main content */}
      <View className="flex-1 relative">
        {/* Background decorative elements */}
        <View className="absolute top-16 left-4 w-6 h-6 bg-blue-600 rounded-full opacity-30"></View>
        <View className="absolute top-32 right-6 w-4 h-4 bg-blue-600 rounded-full opacity-20"></View>
        
        {/* Characters and question mark container */}
        <View className="flex-1 items-center justify-center px-8">
          {/* Left character */}
          <View className="absolute left-12 top-8">
            <View className="items-center">
              {/* Head */}
              <View className="w-12 h-12 bg-orange-300 rounded-full mb-1"></View>
              {/* Body */}
              <View className="w-14 h-20 bg-black rounded-full relative">
                {/* Arms */}
                <View className="absolute -left-4 top-3 w-8 h-3 bg-orange-300 rounded-full transform -rotate-45"></View>
                <View className="absolute -right-4 top-3 w-8 h-3 bg-orange-300 rounded-full transform rotate-45"></View>
              </View>
              {/* Legs */}
              <View className="w-14 h-16 bg-purple-600 rounded-b-full -mt-2"></View>
              
              {/* Speech bubble */}
              <View className="absolute -top-2 -right-6 w-6 h-6 bg-white rounded-full items-center justify-center">
                <View className="w-2 h-2 bg-gray-400 rounded-full"></View>
              </View>
            </View>
          </View>

          {/* Right character */}
          <View className="absolute right-12 top-8">
            <View className="items-center">
              {/* Head */}
              <View className="w-12 h-12 bg-orange-300 rounded-full mb-1"></View>
              {/* Body */}
              <View className="w-14 h-20 bg-cyan-400 rounded-full relative">
                {/* Arms */}
                <View className="absolute -left-4 top-4 w-6 h-3 bg-orange-300 rounded-full transform -rotate-12"></View>
                <View className="absolute -right-4 top-4 w-6 h-3 bg-orange-300 rounded-full transform rotate-12"></View>
              </View>
              {/* Legs */}
              <View className="w-14 h-16 bg-cyan-500 rounded-b-full -mt-2"></View>
              
              {/* Speech bubble */}
              <View className="absolute -top-2 -left-6 w-6 h-6 bg-white rounded-full items-center justify-center">
                <View className="w-2 h-2 bg-gray-400 rounded-full"></View>
              </View>
            </View>
          </View>

          {/* Large question mark */}
          <Text className="text-white font-bold mt-32" style={{fontSize: 120}}>
            ?
          </Text>
        </View>

        {/* Decorative plants */}
        <View className="absolute bottom-20 left-4">
          <View className="w-6 h-10 bg-green-500 rounded-t-full transform rotate-12"></View>
          <View className="w-4 h-8 bg-green-600 rounded-t-full transform -rotate-12 ml-2 -mt-6"></View>
        </View>
        
        <View className="absolute bottom-20 right-4">
          <View className="w-6 h-10 bg-green-500 rounded-t-full transform -rotate-12"></View>
          <View className="w-4 h-8 bg-green-600 rounded-t-full transform rotate-12 mr-2 -mt-6"></View>
        </View>
      </View>

      {/* Bottom section with text and button */}
      <View className="bg-white rounded-t-3xl p-6 pb-8">
        <Text className="text-gray-800 text-base text-center mb-6 leading-6">
          Based on your condition, we suggest that you book a session with any of the following specialists
        </Text>
        
        <Button className="bg-purple-600 py-4 rounded-xl mx-2"
        onPress={()=> router.push("/(stacks)/find-consultant/step1")}>
          <Text className="text-white font-semibold text-lg text-center">
            Start Now
          </Text>
        </Button>
      </View>
    </View>
  );
};

export default ConsultationScreen;