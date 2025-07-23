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
import { apiNewUrl } from "@/const";
import { useUser } from "@clerk/clerk-expo";
import { Buffer } from "buffer";
import { useTranslation } from "react-i18next";


export default function TicketPage() {
  const { user } = useUser();
  const FRESHDESK_DOMAIN = "baserah";
  const FRESHDESK_API_KEY = "your_api_key_here";
  const authToken = Buffer.from(`${FRESHDESK_API_KEY}:X`).toString("base64");
  const userId = user?.publicMetadata.dbPatientId as string;
  const [tickets, setTickets] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
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
    const fetchTickets = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${apiNewUrl}/ticket/list`);
        const result = await response.json();

        if (response.ok && result.success) {
          setTickets(result.data);
        } else {
          throw new Error(result.message || "Failed to fetch tickets.");
        }
      } catch (error) {
        console.error("Error fetching tickets:", error);
        toast.error(t("errorLoadingTickets"));
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, []);

  const handleAddNewTicket = () => {
    setShowForm(true);
  };

  const onSubmit = async (data: { topic: any; type: any; details: any }) => {
    try {
      const newTicket = {
        subject: data.topic,
        type: data.type,
        description: data.details,
        userId: userId,
        priority: 1,
        status: 2,
      };

      const response = await fetch(
        "https://baserah.freshdesk.com/api/v2/tickets",
        {
          method: "POST",
          headers: {
            Authorization: `Basic ${authToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newTicket),
        }
      );

      const result = await response.json();

      if (response.ok && result.success) {
        setTickets((prev) => [...prev, result.data]);
        toast.success(t("ticketCreated"));
        setShowForm(false);
        reset();
      } else {
        throw new Error(result.message || "Failed to create ticket.");
      }
    } catch (error) {
      console.error(t("ticketFailed"), error);
      toast.error(t("ticketFailed"));
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-gray-500">{t("loadingTickets")}</Text>
      </View>
    );
  }

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
      <Text className="font-bold text-lg mb-4">{t("tickets")}</Text>
      {tickets.length === 0 ? (
        <View className="items-center justify-center flex-1">
          <Text className="text-blue-500 mb-4">{t("noTickets")}</Text>
          <Button onPress={handleAddNewTicket}>
            <Text className="text-white font-bold">{t("openNewTicket")}</Text>
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
                <Text className="text-sm mb-1">{t("ticketType")}: {item.type}</Text>
                <Text className="text-sm">{t("ticketSubject")}: {item.subject}</Text>
              </View>
            )}
          />
          <Button onPress={handleAddNewTicket} className="mt-4">
            <Text className="text-white font-bold">{t("addNewTicket")}</Text>
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
