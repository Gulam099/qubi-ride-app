import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/RadioGroup";
import { Separator } from "@/components/ui/Separator";
import { Text } from "@/components/ui/Text";
import React, { useState, useEffect } from "react";
import { View, FlatList, TextInput, TouchableOpacity } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { Textarea } from "@/components/ui/Textarea";
import { toast } from "sonner-native";
import { useSelector } from "react-redux";
import { UserType } from "@/features/user/types/user.type";

const fakeApiData = [
  {
    id: "1",
    status: "Open",
    topic: "Problem",
    type: "Financial",
    subject: "I can't add a credit card",
  },
  {
    id: "2",
    status: "Closed",
    topic: "Problem",
    type: "Financial",
    subject: "I can't add a credit card",
  },
];

export default function TicketPage() {
  const user: UserType = useSelector((state: any) => state.user);
  const [tickets, setTickets] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      topic: "",
      type: "",
      details: "",
    },
  });

  useEffect(() => {
    // Simulate fetching tickets from a fake API
    setTimeout(() => {
      setTickets(fakeApiData);
    }, 1000);
  }, []);

  const handleAddNewTicket = () => {
    setShowForm(true);
  };

  const onSubmit = (data: { topic: any; type: any; details: any }) => {
    const newTicket = {
      id: (tickets.length + 1).toString(),
      status: "Open",
      topic: data.topic,
      type: data.type,
      subject: data.details,
    };
    setTickets((prev) => [...prev, newTicket]);
    console.log("New Ticket", {
      userId: user._id,
      topic: data.topic,
      type: data.type,
      subject: data.details,
    });

    toast.success("Ticket Created Successfully");
    setShowForm(false);
    reset();
  };

  if (showForm) {
    return (
      <View className="p-4 bg-blue-50/20 h-full">
        <Text className="font-bold text-lg mb-4">Create a New Ticket</Text>

        <Text className="text-md mb-2 font-semibold">
          Select the ticket topic
        </Text>
        <Controller
          name="topic"
          control={control}
          rules={{ required: "Topic is required" }}
          render={({ field: { onChange, value } }) => (
            <RadioGroup
              value={value}
              onValueChange={onChange}
              className="gap-3"
            >
              {["Request", "Problem", "Other"].map((topic) => (
                <RadioGroupItemWithLabel
                  key={topic}
                  value={topic}
                  onLabelPress={() => onChange(topic)}
                />
              ))}
            </RadioGroup>
          )}
        />
        {errors.topic && (
          <Text className="text-red-500 text-sm mt-1">
            {errors.topic.message}
          </Text>
        )}

        <Text className="text-md mb-2 mt-4 font-semibold">
          Choose ticket type
        </Text>
        <Controller
          name="type"
          control={control}
          rules={{ required: "Type is required" }}
          render={({ field: { onChange, value } }) => (
            <RadioGroup
              value={value}
              onValueChange={onChange}
              className="gap-3"
            >
              {[
                "Technology",
                "Administrative",
                "Financial",
                "Report about a situation",
              ].map((type) => (
                <RadioGroupItemWithLabel
                  key={type}
                  value={type}
                  onLabelPress={() => onChange(type)}
                />
              ))}
            </RadioGroup>
          )}
        />
        {errors.type && (
          <Text className="text-red-500 text-sm mt-1">
            {errors.type.message}
          </Text>
        )}

        <Text className="text-md mb-2 mt-4 font-semibold">Ticket Details</Text>
        <Controller
          name="details"
          control={control}
          rules={{ required: "Details are required" }}
          render={({ field: { onChange, value } }) => (
            <Textarea
              placeholder="Write the details of the request or problem here"
              value={value}
              onChangeText={onChange}
              aria-labelledby="textareaLabel"
            />
          )}
        />
        {errors.details && (
          <Text className="text-red-500 text-sm mt-1">
            {errors.details.message}
          </Text>
        )}

        <Button onPress={handleSubmit(onSubmit)} className="mt-4">
          <Text className="text-white font-bold">Add New Ticket</Text>
        </Button>
      </View>
    );
  }

  return (
    <View className="p-4 bg-blue-50/20 h-full">
      <Text className="font-bold text-lg mb-4">Tickets</Text>
      {tickets.length === 0 ? (
        <View className="items-center justify-center flex-1">
          <Text className="text-blue-500 mb-4">No previous tickets</Text>
          <Button onPress={handleAddNewTicket}>
            <Text className="text-white font-bold">Open a New Ticket</Text>
          </Button>
        </View>
      ) : (
        <>
          <FlatList
            data={tickets}
            keyExtractor={(item) => item.id}
            contentContainerClassName="gap-3"
            renderItem={({ item }) => (
              <View className="bg-white p-4 rounded-2xl gap-2">
                <View className="flex-row gap-2">
                  <Text className="font-bold text-md mb-1">{item.topic}</Text>
                  <Badge
                    variant={item.status === "Closed" ? "secondary" : "default"}
                    className="justify-center items-center h-5"
                  >
                    <Text className="text-xs">{item.status}</Text>
                  </Badge>
                </View>
                <Separator />
                <Text className="text-sm mb-1">Ticket Type: {item.type}</Text>
                <Text className="text-sm">Ticket Subject: {item.subject}</Text>
              </View>
            )}
          />
          <Button onPress={handleAddNewTicket} className="mt-4">
            <Text className="text-white font-bold">Add New Ticket</Text>
          </Button>
        </>
      )}
    </View>
  );
}

function RadioGroupItemWithLabel({ value, onLabelPress }: any) {
  return (
    <View className="flex-row gap-2 items-center">
      <RadioGroupItem aria-labelledby={`label-for-${value}`} value={value} />
      <Label nativeID={`label-for-${value}`} onPress={onLabelPress}>
        {value}
      </Label>
    </View>
  );
}
