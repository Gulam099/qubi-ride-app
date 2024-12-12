import { View, Text, ScrollView } from "react-native";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { login, logout, updateUser } from "@/store/user/user";
import { Button } from "@/components/ui/Button";
import { RelativePathString, useNavigation } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import { H3, H4 } from "@/components/ui/Typography";
import {
  Add,
  Book,
  Clipboard,
  ClipboardText,
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

export default function AccountPage() {
  const dispatch = useDispatch();
  const user = useSelector((state: any) => state.user);
  const router = useRouter();

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
        { link: "/p/setting", label: "My settings", icon: Setting2 },
        { link: "/p/contact", label: "Contact us", icon: Messages },
      ],
    },
  ]);

  const handleAccountCardPress = (link: string) => {
    console.log(`Card pressed: ${link}`);
    return router.push(`${link}` as RelativePathString);
    // Perform state updates or navigation if needed
  };

  return (
    <SafeAreaView>
      <View className="h-full bg-neutral-200">
        {/* profile */}
        <View className="flex-row justify-start items-center gap-5 bg-primary-800 w-full px-4 py-8">
          <Avatar
            alt="avatar-with-image"
            className="size-28 border-2 border-neutral-500"
          >
            <AvatarImage
              source={{
                uri: "https://avatars.githubusercontent.com/u/72434947?s=400&u=57af259837547b6acea47c895bd847ccc2a4c35b&v=4",
              }}
            />
            <AvatarFallback>
              <Text>
                {user.firstName} {user.lastName}
              </Text>
            </AvatarFallback>
          </Avatar>

          <Text className="text-lg font-semibold text-white">
            {user.firstName} {user.lastName}
          </Text>
        </View>

        <ScrollView
          contentContainerStyle={{ paddingBottom: 20 }} // Ensures some padding at the bottom
          showsVerticalScrollIndicator={false} // Optional: hides the scroll bar
        >
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
            <View className="flex  w-full">
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
            </View>

            <Button
              onPress={() => dispatch(logout())}
              variant={"default"}
              className="w-full"
            >
              <Text className="text-white">Logout</Text>
            </Button>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
