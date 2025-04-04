import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ScrollView,
  StyleSheet,
} from "react-native";
import { Button } from "@/components/ui/Button";
import Drawer from "@/components/ui/Drawer";
import { CardAdd, Wallet, AddCircle } from "iconsax-react-native";
import { useSelector } from "react-redux";
import {
  CreditCardView,
  CreditCardInput,
  CreditCardFormData,
} from "react-native-credit-card-input";
import { Controller, useForm } from "react-hook-form";
import { Input } from "@/components/ui/Input";
import { apiBaseUrl } from "@/features/Home/constHome";
import { currencyFormatter } from "@/utils/currencyFormatter.utils";
import { UserType } from "@/features/user/types/user.type";
import { CustomIcons } from "@/const";
import { H3 } from "@/components/ui/Typography";
import { useRouter } from "expo-router";
import { useUser } from "@clerk/clerk-expo";

const styles = StyleSheet.create({
  cardView: {
    alignSelf: "center",
    marginTop: 15,
  },
});

type CardType = {
  abbreviatedName: string;
  cardNumber: string;
  nameOnCard: string;
  expiryDate: string;
  cvvCode: string;
  _id: string;
};

export default function AccountPage() {
  const router = useRouter();
  const [walletBalance, setWalletBalance] = useState(0);
  const [cards, setCards] = useState<CardType[]>([]);
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState("main"); // "main" or "addCard"
  const [formData, setFormData] = useState<CreditCardFormData | null>(null);

  const {user} = useUser();
  const phoneNumber = user?.phoneNumbers[0].phoneNumber; // Mock user phone number

  const { control, handleSubmit, setValue } = useForm({
    defaultValues: {
      abbreviatedName: "",
      nameOnCard: "",
      cardNumber: "",
      expiryDate: "",
      cvvCode: "",
    },
  });

  // Fetch wallet balance and user cards
  useState(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch(
          `${apiBaseUrl}/api/user/${phoneNumber}/cards`
        );
        const result = await response.json();
        if (response.ok) {
          setWalletBalance(result.walletBalance || 0);
          setCards(result.cards || []);
        } else {
          console.error(
            "Error fetching cards:",
            result.message || "Unknown error"
          );
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    fetchUserData();
  }, [phoneNumber]);

  const handleAddCard = async (data: any) => {
    const payload = {
      phoneNumber,
      abbreviatedName: data.abbreviatedName,
      cardNumber: formData?.values.number,
      nameOnCard: data.nameOnCard,
      expiryDate: formData?.values.expiry,
      cvvCode: formData?.values.cvc,
    };
    console.log(payload);

    try {
      const response = await fetch(`${apiBaseUrl}/api/add-card`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (response.ok) {
        // Add the new card locally and reset the form
        setCards((prev) => [...prev, payload]);
        setCurrentStep("main"); // Navigate back to main view
        setIsDrawerVisible(true); // Show success drawer
      } else {
        console.error("Error adding card:", result.message || "Unknown error");
      }
    } catch (error) {
      console.error("Error adding card:", error);
    }
  };

  const renderMainScreen = () => (
    <View>
      <TouchableOpacity
        onPress={() => router.push("/account/payment/wallet")}
      >
        <View className="bg-white p-4 rounded-2xl mb-4 flex-row gap-2">
          <View>
            <View className="bg-blue-50/30 rounded-full w-12 aspect-square justify-center items-center">
              <Wallet size="24" color="#000" />
            </View>
          </View>
          <View className="flex-col gap-1">
            <Text className="text-lg font-bold text-neutral-700">Wallet</Text>
            <Text className="text-sm text-neutral-500">
              The balance is {currencyFormatter(walletBalance)}
            </Text>
          </View>
        </View>
      </TouchableOpacity>

      <View>
        <Text className="text-lg font-bold text-neutral-700 mb-2">
          My Cards
        </Text>
        <FlatList
          data={cards}
          contentContainerClassName="gap-2"
          renderItem={({ item }) => (
            <View className="bg-white p-4 flex-row items-center justify-between rounded-2xl">
              <Text className="text-lg font-medium leading-9">
                {item.abbreviatedName}
              </Text>
              <Text className="text-sm text-neutral-500 ">
                **** **** **** {item.cardNumber.slice(-4)}
              </Text>
            </View>
          )}
          keyExtractor={(item, index) => index.toString()}
          ListFooterComponent={
            <TouchableOpacity
              onPress={() => setCurrentStep("addCard")}
              className="flex-row items-center mt-4 bg-white rounded-2xl p-4"
            >
              <View className="bg-blue-50/30 rounded-full w-10 aspect-square justify-center items-center">
                <CardAdd size={20} color="#000" />
              </View>

              <Text className="ml-2 text-blue-600 font-medium flex-1">
                Add new card
              </Text>
              <AddCircle size={20} color="#000" className="ml-auto" />
            </TouchableOpacity>
          }
        />
      </View>
    </View>
  );

  const renderAddCardScreen = () => (
    <ScrollView>
      <CreditCardView
        style={styles.cardView}
        type={formData?.values.type}
        number={formData?.values.number}
        expiry={formData?.values.expiry}
        cvc={formData?.values.cvc}
      />

      <View className="mt-4">
        <Text className="text-gray-700 font-medium">Abbreviated Name</Text>
        <Controller
          control={control}
          name="abbreviatedName"
          rules={{ required: "Abbreviated Name is required" }}
          render={({ field: { onChange, value }, fieldState: { error } }) => (
            <>
              <Input
                placeholder="Enter abbreviated name"
                value={value}
                onChangeText={onChange}
              />
              {error && (
                <Text className="text-red-500 text-xs">{error.message}</Text>
              )}
            </>
          )}
        />
      </View>
      <View className="mt-4">
        <Text className="text-gray-700 font-medium">Name on Card</Text>
        <Controller
          control={control}
          name="nameOnCard"
          rules={{ required: "Name is required" }}
          render={({ field: { onChange, value }, fieldState: { error } }) => (
            <>
              <Input
                placeholder="Enter Card holder name"
                value={value}
                onChangeText={onChange}
              />
              {error && (
                <Text className="text-red-500 text-xs">{error.message}</Text>
              )}
            </>
          )}
        />
      </View>

      <CreditCardInput
        autoFocus
        onChange={setFormData}
        // onFocusField={(field) => console.log("Focused field:", field)}
      />

      <View className="mt-4 flex-row justify-between gap-4">
        <Button className="flex-1" onPress={handleSubmit(handleAddCard)}>
          <Text className="text-white font-medium">Add New Card</Text>
        </Button>
      </View>
    </ScrollView>
  );

  return (
    <View className="flex-1 bg-blue-50/10 p-4">
      {currentStep === "main" && renderMainScreen()}
      {currentStep === "addCard" && renderAddCardScreen()}

      <Drawer
        visible={isDrawerVisible}
        onClose={() => setIsDrawerVisible(false)}
        title=""
        height="40%"
      >
        <View className="flex flex-col flex-1 justify-center items-center w-full gap-4 px-6">
          <View className=" aspect-square  flex justify-center items-center relative overflow-visible  p-2">
            <View className="bg-blue-50/20 aspect-square rounded-full w-[5.5rem] absolute "></View>
            <CustomIcons.Thumb.Icon height={80} width={80} />
          </View>

          <H3 className="border-none ">Card has been successfully added</H3>
        </View>
      </Drawer>
    </View>
  );
}
