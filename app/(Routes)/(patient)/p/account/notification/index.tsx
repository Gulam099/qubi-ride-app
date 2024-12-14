import { View, Text, FlatList } from 'react-native'
import React from 'react'
import NotificationCard from '@/features/account/components/NotificationCard';

export default function AccountNotificationPage() {
  const notifications = [
    {
      id: "1",
      date: "12/12/2023",
      message:
        "We would like to remind you of your friendship with Dr. Muhammad Al-Abdullah on 12/20/2023 at 11:00 PM.",
    },
    {
      id: "2",
      date: "12/12/2023",
      message:
        "We would like to remind you of your friendship with Dr. Muhammad Al-Abdullah on 12/20/2023 at 11:00 PM.",
    },
    {
      id: "3",
      date: "12/12/2023",
      message:
        "We would like to remind you of your friendship with Dr. Muhammad Al-Abdullah on 12/20/2023 at 11:00 PM.",
    },
    {
      id: "4",
      date: "12/12/2023",
      message:
        "We would like to remind you of your friendship with Dr. Muhammad Al-Abdullah on 12/20/2023 at 11:00 PM.",
    },
  ];

  return (
    <View className='p-4'>
      <Text className="font-semibold text-xl">My Notifications</Text>
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <NotificationCard date={item.date} message={item.message} />
        )}
      />
    </View>
  );
}

