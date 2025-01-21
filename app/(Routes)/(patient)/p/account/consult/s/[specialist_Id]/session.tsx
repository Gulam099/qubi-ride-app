import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Switch } from "@/components/ui/Switch";
import { Calendar } from "iconsax-react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/Accordion";

export default function SessionConsultPage() {
  const { control, handleSubmit } = useForm({
    defaultValues: {
      numberOfSessions: "",
      sessionDuration: "",
      personalInformation: {
        name: "",
        age: "",
        academicLevel: "",
        employmentStatus: "",
      },
      familyComposition: "",
      history: "",
      natureOfComplaint: "",
      additionalInfo: "",
      availableDate: new Date(),
    },
  });

  const [showDatePicker, setShowDatePicker] = useState(false);

  const onSubmit = (data: any) => {
    console.log("Submitted Data:", data);
  };

  return (
    <ScrollView className="flex-1 bg-blue-50/10 p-4">
      <Text className="text-lg font-bold mb-4">Number of sessions</Text>
      <View className="flex-row gap-2 mb-4">
        {[
          { label: "1 session", value: "1" },
          { label: "2 sessions", value: "2" },
          { label: "3 sessions", value: "3" },
        ].map(({ label, value }) => (
          <Controller
            key={value}
            control={control}
            name="numberOfSessions"
            render={({ field: { onChange, value: selectedValue } }) => (
              <Button
                className={`flex-1 ${
                  selectedValue === value ? "bg-blue-500" : "bg-gray-200"
                }`}
                onPress={() => onChange(value)}
              >
                <Text
                  className={
                    selectedValue === value ? "text-white" : "text-gray-800"
                  }
                >
                  {label}
                </Text>
              </Button>
            )}
          />
        ))}
      </View>

      <Text className="text-lg font-bold mb-4">Duration sessions</Text>
      <View className="flex-row gap-2 mb-4">
        {[
          { label: "30 min", value: "30" },
          { label: "45 min", value: "45" },
          { label: "60 min", value: "60" },
        ].map(({ label, value }) => (
          <Controller
            key={value}
            control={control}
            name="sessionDuration"
            render={({ field: { onChange, value: selectedValue } }) => (
              <Button
                className={`flex-1 ${
                  selectedValue === value ? "bg-blue-500" : "bg-gray-200"
                }`}
                onPress={() => onChange(value)}
              >
                <Text
                  className={
                    selectedValue === value ? "text-white" : "text-gray-800"
                  }
                >
                  {label}
                </Text>
              </Button>
            )}
          />
        ))}
      </View>

      <View className="flex-1 justify-center items-center p-6">
        <Accordion
          type="multiple"
          collapsible
          defaultValue={["item-1"]}
          className="w-full max-w-sm native:max-w-md"
        >
          <AccordionItem value="item-1">
            <AccordionTrigger>
              <Text>Is it accessible?</Text>
            </AccordionTrigger>
            <AccordionContent>
              <Text>Yes. It adheres to the WAI-ARIA design pattern.</Text>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>
              <Text>What are universal components?</Text>
            </AccordionTrigger>
            <AccordionContent>
              <Text>
                In the world of React Native, universal components are
                components that work on both web and native platforms.
              </Text>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-3">
            <AccordionTrigger>
              <Text>Is this component universal?</Text>
            </AccordionTrigger>
            <AccordionContent>
              <Text>Yes. Try it out on the web, iOS, and/or Android.</Text>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </View>

      <Text className="text-lg font-bold mb-4">Personal Information</Text>
      <Controller
        control={control}
        name="personalInformation.name"
        render={({ field: { onChange, value } }) => (
          <Input
            className="border border-gray-300 rounded-lg p-4 w-full mb-4"
            placeholder="Name"
            value={value}
            onChangeText={onChange}
          />
        )}
      />

      <Controller
        control={control}
        name="personalInformation.age"
        render={({ field: { onChange, value } }) => (
          <Input
            className="border border-gray-300 rounded-lg p-4 w-full mb-4"
            placeholder="Age"
            keyboardType="numeric"
            value={value}
            onChangeText={onChange}
          />
        )}
      />

      <Text className="text-lg font-bold mb-4">Academic Level</Text>
      <View className="flex-row gap-2 mb-4">
        {[
          { label: "Postgraduate", value: "Postgraduate" },
          { label: "University", value: "University" },
          { label: "Secondary", value: "Secondary" },
        ].map(({ label, value }) => (
          <Controller
            key={value}
            control={control}
            name="personalInformation.academicLevel"
            render={({ field: { onChange, value: selectedValue } }) => (
              <Button
                className={`flex-1 ${
                  selectedValue === value ? "bg-blue-500" : "bg-gray-200"
                }`}
                onPress={() => onChange(value)}
              >
                <Text
                  className={
                    selectedValue === value ? "text-white" : "text-gray-800"
                  }
                >
                  {label}
                </Text>
              </Button>
            )}
          />
        ))}
      </View>

      <Text className="text-lg font-bold mb-4">Available Times</Text>
      <Controller
        control={control}
        name="availableDate"
        render={({ field: { onChange, value } }) => (
          <TouchableOpacity
            onPress={() => setShowDatePicker(true)}
            className="border border-gray-300 rounded-lg p-4 w-full mb-4 flex-row items-center justify-between"
          >
            <Text>{value ? value.toDateString() : "Select a date"}</Text>
            <Calendar size={20} />
          </TouchableOpacity>
        )}
      />

      {showDatePicker && (
        <DateTimePicker
          value={new Date()}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) {
              control.setValue("availableDate", selectedDate);
            }
          }}
        />
      )}

      <Button onPress={handleSubmit(onSubmit)} className="mt-4">
        <Text className="text-white font-medium">Next</Text>
      </Button>
    </ScrollView>
  );
}
