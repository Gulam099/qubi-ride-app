import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "@/store/user/user";
import { Button } from "@/components/ui/Button";
import { Link, RelativePathString } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import { H3, H4 } from "@/components/ui/Typography";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/RadioGroup";
import { Label } from "@/components/ui/Label";
import { PatientDeleteAccountOptions } from "@/features/account/constAccount";

import TextureCircle from "@/features/account/assets/images/TextureCircle.svg";
import CopyToClipboard from "@/features/Home/Components/CopyToClipboard";
import AccountCard2 from "@/features/account/components/AccountCard2";
import AccountDeleteButton from "@/features/account/components/AccountDeleteButton";
import ProfileImage from "@/features/account/components/ProfileImage";
import { useUser } from "@clerk/clerk-expo";

export default function AccountPage() {
  const dispatch = useDispatch();
  const {user} = useUser();
  const router = useRouter();

  const [isContactUsDrawerVisible, setIsContactUsDrawerVisible] =
    useState(false);

  const [Interests, setInterests] = useState([
    {
      title: "My Interests",
      shadowColor: colors.blue[100],
      backgroundColor: colors.primary[800],
      iconColor: "white",
      items: [
        { link: "/account/calendar", label: "My calendar", icon: MenuBoard },
        { link: "/account/scale", label: "Metrics", icon: Clipboard },
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
          link: "/account/appointment",
          label: "My bookings",
          icon: ClipboardText,
        },
        { link: "/account/report", label: "My reports", icon: Book },
        { link: "/account/calendar", label: "My calendar", icon: MenuBoard },
        { link: "/account/scale", label: "Metrics", icon: Clipboard },
      ],
    },
    {
      title: "My information",
      shadowColor: colors.blue[100],
      className: "",
      backgroundColor: "white",
      iconColor: colors.gray[700],
      items: [
        { link: "/account/payment", label: "Payment", icon: EmptyWalletTime },
        { link: "/account/favorite", label: "My favorites", icon: Like1 },
        { link: "/account/chat", label: "My conversations", icon: Message },
        { link: "/account/invoice", label: "My bills", icon: Receipt },
        { link: "/account/family", label: "My family", icon: Profile2User },
        { link: "/account/setting", label: "My settings", icon: Setting2 },
      ],
    },
  ]);

  const ContactUsCard = {
    shadowColor: colors.blue[100],
    className: "",
    backgroundColor: "white",
    iconColor: colors.gray[700],
    item: { link: "/contact", label: "Contact us", icon: Messages },
  };

  const handleAccountCardPress = (link: string) => {
    console.log(`Card pressed: ${link}`);
    return router.push(`${link}` as RelativePathString);
    // Perform state updates or navigation if needed
  };

  const [value, setValue] = React.useState("");

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
            <ProfileImage imageUrl={user?.imageUrl!} name={user?.id!} />
            <View className="flex-1">
              <Text className="text-lg font-semibold text-white ">
                {user?.fullName ??  "User"}
              </Text>
              <CopyToClipboard
                data={user?.publicMetadata?.dbUserId as string ?? "User id not found"}
                variant={"ghost"}
                className="flex-row gap-2 justify-start items-start p-0"
              >
                <Text className="text-base  text-gray-200 ">{user?.publicMetadata?.dbUserId as string ?? "User id not found"}</Text>
                <Copy size="16" color={colors.gray[200]} />
              </CopyToClipboard>
              <Link href={"/account/profile"}>
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
              onPress={() => router.push("/account/profile")}
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

            <AccountDeleteButton />

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
                    router.push("/account/chat/support");
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
