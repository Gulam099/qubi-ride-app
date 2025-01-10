import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { login, logout, updateUser } from "@/store/user/user";
import { Button } from "@/components/ui/Button";
import { Link, RelativePathString, useNavigation } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import { H2, H3, H4 } from "@/components/ui/Typography";
import {
  Add,
  Book,
  Clipboard,
  ClipboardText,
  Copy,
  Edit,
  EmptyWalletTime,
  Like1,
  MenuBoard,
  Message,
  Messages,
  Profile2User,
  Receipt,
  Setting2,
} from "iconsax-react-native";
import colors from "@/utils/colors";
import AccountCard from "@/features/account/components/AccountCard";
import { useRouter } from "expo-router";
import Drawer from "@/components/ui/Drawer";
import { Image } from "react-native";
import { RadioGroup, RadioGroupItem } from "@/components/ui/RadioGroup";
import { Label } from "@/components/ui/Label";
import { PatientDeleteAccountOptions } from "@/features/account/constAccount";
import BellAlert from "@/assets/icon/BellAlert.svg";
import TextureCircle from "@/features/account/assets/images/TextureCircle.svg";
import CopyToClipboard from "@/features/Home/Components/CopyToClipboard";
import AccountCard2 from "@/features/account/components/AccountCard2";

export default function AccountPage() {
  const dispatch = useDispatch();
  const user = useSelector((state: any) => state.user);
  const router = useRouter();

  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [isContactUsDrawerVisible, setIsContactUsDrawerVisible] =
    useState(false);

  // const navigation = useNavigation();

  // useEffect(() => {
  //   navigation.setOptions({ headerShown: false });
  // }, [navigation]);

  const [Interests, setInterests] = useState([
    {
      title: "My Interests",
      shadowColor: colors.blue[100],
      backgroundColor: colors.primary[800],
      iconColor: "white",
      items: [
        { link: "/p/account/calendar", label: "My calendar", icon: MenuBoard },
        { link: "/p/account/scale", label: "Metrics", icon: Clipboard },
      ],
    },
  ]);

  const [sections, setSections] = useState([
    {
      title: "Medical file",
      shadowColor: colors.blue[100],
      className: "",
      backgroundColor: "white",
      iconColor: colors.gray[700],
      items: [
        {
          link: "/p/account/appointment",
          label: "My bookings",
          icon: ClipboardText,
        },
        { link: "/p/account/report", label: "My reports", icon: Book },
        { link: "/p/account/calendar", label: "My calendar", icon: MenuBoard },
        { link: "/p/account/scale", label: "Metrics", icon: Clipboard },
      ],
    },
    {
      title: "My information",
      shadowColor: colors.blue[100],
      className: "",
      backgroundColor: "white",
      iconColor: colors.gray[700],
      items: [
        { link: "/p/account/payment", label: "Payment", icon: EmptyWalletTime },
        { link: "/p/account/favorite", label: "My favorites", icon: Like1 },
        { link: "/p/account/chat", label: "My conversations", icon: Message },
        { link: "/p/account/invoice", label: "My bills", icon: Receipt },
        { link: "/p/account/family", label: "My family", icon: Profile2User },
        { link: "/p/account/setting", label: "My settings", icon: Setting2 },
      ],
    },
  ]);

  const ContactUsCard = {
    shadowColor: colors.blue[100],
    className: "",
    backgroundColor: "white",
    iconColor: colors.gray[700],
    item: { link: "/p/contact", label: "Contact us", icon: Messages },
  };

  const handleAccountCardPress = (link: string) => {
    console.log(`Card pressed: ${link}`);
    return router.push(`${link}` as RelativePathString);
    // Perform state updates or navigation if needed
  };

  const [value, setValue] = React.useState("Comfortable");

  function onLabelPress(label: string) {
    return () => {
      setValue(label);
    };
  }

  return (
    <SafeAreaView>
      <View className="h-full bg-neutral-200">
        <ScrollView
          showsVerticalScrollIndicator={false} // Optional: hides the scroll bar
          contentContainerStyle={{ paddingBottom: 20 }} // Ensures some padding at the bottom
        >
          <View className="flex-row justify-start items-center gap-5 bg-primary-800 w-full px-4 py-16 relative">
            <Avatar
              alt="avatar-with-image"
              className="size-24 border-2 border-neutral-500"
            >
              <AvatarImage
                source={{
                  uri:
                    user.imageUrl ??
                    "https://eu.ui-avatars.com/api/?name=U&size=250",
                }}
              />
              <AvatarFallback className="bg-primary-500">
                <Text className="text-3xl text-center font-semibold text-white">
                  {user.name === null ? "U" : user.name.slice(0, 1)}
                </Text>
              </AvatarFallback>
            </Avatar>
            <View className="flex-1">
              <Text className="text-lg font-semibold text-white ">
                {user.name === null ? "User" : user.name}
              </Text>
              <CopyToClipboard
                data={user._id}
                variant={"ghost"}
                className="flex-row gap-2 justify-start items-start p-0"
              >
                <Text className="text-base  text-gray-200 ">{user._id}</Text>
                <Copy size="16" color={colors.gray[200]} />
              </CopyToClipboard>
              <Link href="/p/account/profile">
                <Text className="text-blue-100 text-sm underline">
                  View Profile
                </Text>
              </Link>
            </View>
            <View className={"absolute -top-4 -right-6"}>
              <TextureCircle />
            </View>

            <Button
              className="bg-primary-700 p-2 rounded-2xl aspect-square"
              onPress={() => router.push("/p/account/profile")}
            >
              <Edit size="24" color={colors.gray[100]} />
            </Button>
          </View>
          <View className="flex justify-center items-center h-full w-full flex-1 p-6 pt-2">
            <View className="flex justify-center items-center flex-row flex-wrap basis-1/3 gap-4">
              {Interests.map((section) => (
                <View key={section.title} className="flex flex-col  gap-4 py-4">
                  <View className="flex flex-row flex-wrap gap-4">
                    {section.items.map((item) => (
                      <AccountCard
                        key={item.link + section.title}
                        className="basis-[30%]"
                        iconColor={section.iconColor}
                        iconSize={28}
                        shadowColor={section.shadowColor}
                        backgroundColor={section.backgroundColor}
                        icon={item.icon}
                        label={item.label}
                        link={item.link}
                      />
                    ))}
                  </View>
                </View>
              ))}

              <AccountCard
                className=""
                iconColor={colors.gray[700]}
                iconSize={28}
                shadowColor={colors.blue[100]}
                backgroundColor={"white"}
                icon={Add}
                label={"Select my interests"}
                link={"/"}
              />
            </View>
            <View className="flex  w-full pb-4">
              {sections.map((section) => (
                <View key={section.title} className="flex flex-col gap-4 py-4">
                  <H4 className=" font-semibold text-gray-800 ">
                    {section.title}
                  </H4>
                  <View className="flex flex-row flex-wrap  gap-4">
                    {section.items.map((item) => (
                      <AccountCard
                        key={item.link + section.title}
                        className={"basis-[30%]"}
                        iconColor={section.iconColor}
                        iconSize={28}
                        shadowColor={section.shadowColor}
                        backgroundColor={section.backgroundColor}
                        icon={item.icon}
                        label={item.label}
                        link={item.link}
                      />
                    ))}
                  </View>
                </View>
              ))}

              <TouchableOpacity
                onPress={() => setIsContactUsDrawerVisible(true)}
              >
                <AccountCard2
                  className={"basis-[30%]"}
                  iconColor={ContactUsCard.iconColor}
                  iconSize={28}
                  shadowColor={ContactUsCard.shadowColor}
                  backgroundColor={ContactUsCard.backgroundColor}
                  icon={ContactUsCard.item.icon}
                  label={ContactUsCard.item.label}
                  link={ContactUsCard.item.link}
                />
              </TouchableOpacity>
            </View>

            <Button
              onPress={() => dispatch(logout())}
              variant={"default"}
              className="w-full"
            >
              <Text className="text-white">Logout</Text>
            </Button>

            <View className="flex-1 justify-center items-center">
              <Button onPress={() => setIsDrawerVisible(true)} variant={"link"}>
                <Text className="">Delete Account</Text>
              </Button>

              <Drawer
                visible={isDrawerVisible}
                onClose={() => setIsDrawerVisible(false)}
                title="My Drawer"
                height="70%"
              >
                <View className="flex flex-col flex-1 justify-center items-center w-full gap-4 px-6">
                  <View className=" aspect-square  flex justify-center items-center relative overflow-visible  p-2">
                    <View className="bg-blue-50/20 aspect-square rounded-full w-[5.5rem] absolute "></View>
                    <BellAlert height={80} width={80} />
                  </View>
                  <H3 className="border-none ">Are sure you want to delete </H3>
                  <Text className="text-lg">Could you tell us why ?</Text>
                  <RadioGroup
                    value={value}
                    onValueChange={setValue}
                    className="gap-6"
                  >
                    {PatientDeleteAccountOptions.map((option) => (
                      <RadioGroupItemWithLabel
                        key={option}
                        value={option}
                        onLabelPress={onLabelPress(option)}
                      />
                    ))}
                  </RadioGroup>
                  <Button
                    onPress={() => setIsDrawerVisible(false)}
                    className="w-full"
                  >
                    <Text className="text-white font-semibold">Submit</Text>
                  </Button>
                </View>
              </Drawer>
            </View>
            <Drawer
              visible={isContactUsDrawerVisible}
              onClose={() => setIsContactUsDrawerVisible(false)}
              title="My Drawer"
              className="max-h-[40%]"
              height="50%"
            >
              <View className="flex flex-col flex-1 justify-center items-center w-full gap-4 px-6">
                <H3 className="border-none text-lg text-neutral-700 text-center">
                  Welcome! Baserah team is here to serve you
                </H3>
                <Text className="text-base text-neutral-500">
                  The usual response time for us is a few minutes
                </Text>

                <Button
                  onPress={() => {
                    setIsContactUsDrawerVisible(false);
                    router.push("/help/ticket");
                  }}
                  className="w-full"
                >
                  <Text className="text-white font-semibold">
                    Add a ticket directly
                  </Text>
                </Button>
                <Text className="text-base text-neutral-500">or</Text>
                <Button
                  onPress={() => {
                    setIsContactUsDrawerVisible(false);
                    router.push("/p/account/chat/support");
                  }}
                  className="w-full"
                  variant={"secondary"}
                >
                  <Text className="text-neutral-500 font-semibold">
                    Contact Technical Support
                  </Text>
                </Button>
              </View>
            </Drawer>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
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
    <View className={"flex-row gap-3 items-center "}>
      <RadioGroupItem aria-labelledby={"label-for-" + value} value={value} />
      <Label
        nativeID={"label-for-" + value}
        onPress={onLabelPress}
        className="text-lg"
      >
        {value}
      </Label>
    </View>
  );
}
