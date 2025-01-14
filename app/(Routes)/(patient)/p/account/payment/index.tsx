import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import { format } from "date-fns";
import {
  Calendar,
  DiscountShape,
  EmptyWalletTime,
  Moneys,
  Warning2,
} from "iconsax-react-native";
import colors from "@/utils/colors";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import { Switch } from "@/components/ui/Switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/RadioGroup";
import { H3 } from "@/components/ui/Typography";
import Drawer from "@/components/ui/Drawer";
import { CustomIcons } from "@/const";

interface Specialist {
  id: string;
  name: string;
  specialization: string;
  image: string;
}

export default function AccountPaymentPage() {
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const { appointmentDuration, specialistsId, schedule, amount } =
    useLocalSearchParams<{
      appointmentDuration: string;
      specialistsId: string;
      schedule: string;
      amount: string;
    }>();

  const [specialistData, setSpecialistData] = useState<Specialist | null>(null);
  const [isWalletEnabled, setIsWalletEnabled] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [PayLaterCheck, setPayLaterCheck] = useState(false);

  // Simulated API Call
  const fetchSpecialistData = async (id: string) => {
    // Fake API response
    const fakeApiResponse: Specialist[] = [
      {
        id: "1",
        name: "Dr. Deem Abdullah",
        specialization: "Psychologist",
        image: "https://via.placeholder.com/50", // Placeholder image
      },
      {
        id: "3",
        name: "Dr. John Smith",
        specialization: "Psychiatrist",
        image: "https://via.placeholder.com/50",
      },
    ];

    // Filter the specialist based on ID
    const data = fakeApiResponse.find((item) => item.id === id);
    setSpecialistData(data || null);
  };

  const [value, setValue] = React.useState("");

  function onLabelPress(label: string) {
    return () => {
      setValue(label);
    };
  }

  useEffect(() => {
    fetchSpecialistData(specialistsId);
  }, [specialistsId]);

  const paymentOptions = [
    {
      id: "applePay",
      name: "Apple Pay",
      logoImage: "https://via.placeholder.com/40",
    },
    {
      id: "madaCredit",
      name: "MADA / Credit Card",
      logoImage: "https://via.placeholder.com/40",
    },
    {
      id: "installments6",
      name: "Divide it into up to 6 installments",
      logoImage: "https://via.placeholder.com/40",
    },
    {
      id: "installments4",
      name: "Divide it into up to 4 installments",
      logoImage: "https://via.placeholder.com/40",
    },
  ];

  return (
    <ScrollView className="bg-blue-50/10 h-full w-full p-4">
      {/* Header Section */}
      {specialistData && (
        <View className="bg-white p-4 rounded-2xl mb-4 flex-row gap-4">
          <Avatar alt="avatar-with-image" className="w-20 h-20">
            <AvatarImage
              source={{
                uri: "https://avatars.githubusercontent.com/u/66306912?v=4",
              }}
            />
            <AvatarFallback>
              <Text>UN</Text>
            </AvatarFallback>
          </Avatar>
          <View className="flex-col gap-2">
            <Text className="font-bold text-lg">{specialistData.name}</Text>
            <Text className="text-gray-600">
              {specialistData.specialization}
            </Text>
            <Text className="text-gray-600  ">
              Date: {format(new Date(schedule), "EEEE , d MMMM yyyy")}
            </Text>
            <Text className="text-gray-600  ">
              Time: {format(new Date(schedule), "h:mm a")}
            </Text>
            <Text className="text-gray-600  ">
              Duration: {appointmentDuration}
            </Text>
          </View>
        </View>
      )}

      {/* Promo Code */}
      <View className="bg-white p-4 rounded-2xl mb-4 flex-col gap-4">
        <View className=" flex-row justify-start items-center gap-2">
          <View className="p-1 bg-blue-50/20 aspect-square rounded-full w-10 flex justify-center items-center">
            <DiscountShape size="20" color={colors.primary[900]} />
          </View>
          <Text className="font-semibold mb-2">Promo Code</Text>
        </View>

        <View className="flex-row items-center">
          <TextInput
            placeholder="Enter the Promo Code"
            className="border flex-1 p-2 mr-2 rounded"
            value={promoCode}
            onChangeText={setPromoCode}
          />
          <Button>
            <Text className="text-white">Activate</Text>
          </Button>
        </View>
      </View>

      {/* Wallet */}
      <View className="bg-white p-4 rounded-2xl mb-4">
        <View className="flex-row justify-between items-center">
          <View className=" flex-row justify-start items-center gap-2">
            <View className="p-1 bg-blue-50/20 aspect-square rounded-full w-10 flex justify-center items-center">
              <EmptyWalletTime size="20" color={colors.primary[900]} />
            </View>
            <Text className="font-semibold mb-2">Wallet (30.1 SAR)</Text>
          </View>

          <Switch
            checked={isWalletEnabled}
            onCheckedChange={() => setIsWalletEnabled((prev) => !prev)}
            nativeID="rememberMyDetails"
          />
        </View>
      </View>
      <View className="bg-yellow-50 border-yellow-500 rounded-2xl mb-4 py-2 px-4 flex flex-row gap-2">
        <View className="p-1 bg-yellow-400 aspect-square rounded-full w-10 flex justify-center items-center">
          <Warning2 size="20" color={"white"} />
        </View>
        <Text className="text-yellow-500  text-sm">
          You can use the wallet for partial payment and settle the remaining
          amount using Apple Pay or a credit card.
        </Text>
      </View>

      {/* Payment Details */}
      <View className="bg-white p-4 rounded-2xl mb-4 flex-col gap-2">
        <Text className="font-medium mb-2 text-lg">Payment Details</Text>
        <View className="flex-row justify-between">
          <Text>Session Price</Text>
          <Text>{amount} SAR</Text>
        </View>
        <View className="flex-row justify-between">
          <Text>Value Added Tax (VAT) 15%</Text>
          <Text>{(parseFloat(amount) * 0.15).toFixed(2)} SAR</Text>
        </View>
        <View className="flex-row justify-between mt-2 border-t pt-2 border-neutral-400">
          <Text className="font-semibold">Total Cost</Text>
          <Text className="font-semibold">
            {(parseFloat(amount) * 1.15).toFixed(2)} SAR
          </Text>
        </View>
      </View>

      {/* Payment Methods */}
      <View className="bg-white p-4 rounded-2xl mb-4">
        <Text className="font-medium mb-2 text-lg">Pay Via</Text>
        <View className="flex-1 justify-center items-center p-2">
          <RadioGroup value={value} onValueChange={setValue} className="gap-3">
            {paymentOptions.map((option) => (
              <View key={option.id} className="flex-row w-full justify-between">
                <RadioGroupItemWithLabel
                  value={option.name}
                  onLabelPress={onLabelPress(option.name)}
                />
                {option.logoImage && (
                  <Image
                    source={{ uri: option.logoImage }}
                    className="w-10 h-10 "
                  />
                )}
              </View>
            ))}
          </RadioGroup>
        </View>
      </View>

      <View className="flex-row items-center gap-2 w-full justify-between p-4 mb-4 bg-background rounded-xl">
        <View className="flex-row justify-center items-center gap-2">
          <View className="p-1 bg-blue-50/20 aspect-square rounded-full w-8  flex justify-center items-center">
            <Moneys size="18" color={colors.primary[900]} />
          </View>
          <Text className="text-sm font-medium">
            Pay later and remind me later
          </Text>
        </View>
        <Switch
          checked={PayLaterCheck}
          onCheckedChange={setPayLaterCheck}
          nativeID="ClosestAppointmentCheck"
        />
      </View>

      {/* Join Button */}
      <Button className="  mt-10 mb-20">
        <Text className="text-white text-center font-bold">
          Join now {amount} SAR
        </Text>
      </Button>

      <View className="flex-1 justify-center items-center  mt-10 mb-20">
        <Button onPress={() => setIsDrawerVisible(true)} variant={"link"}>
          <Text className="">This todo appers after Payment</Text>
        </Button>

        <Drawer
          visible={isDrawerVisible}
          onClose={() => setIsDrawerVisible(false)}
          title="My Drawer"
          height="40%"
          className="max-h-[40%]"
        >
          <View className="flex flex-col flex-1 justify-center items-center w-full gap-4 px-6">
            <View className=" aspect-square  flex justify-center items-center relative overflow-visible  p-2">
              <View className="bg-blue-50/20 aspect-square rounded-full w-[5.5rem] absolute "></View>
              <CustomIcons.Thumb.Icon height={80} width={80} />
            </View>

            <H3 className="border-none ">Payment Successful</H3>
          </View>
        </Drawer>
      </View>
    </ScrollView>
  );
}

function RadioGroupItemWithLabel({
  value,
  onLabelPress,
}: Readonly<{
  value: string;
  onLabelPress: () => void;
}>) {
  return (
    <View className={"flex-row gap-2 items-center"}>
      <RadioGroupItem aria-labelledby={"label-for-" + value} value={value} />
      <Label nativeID={"label-for-" + value} onPress={onLabelPress}>
        {value}
      </Label>
    </View>
  );
}
