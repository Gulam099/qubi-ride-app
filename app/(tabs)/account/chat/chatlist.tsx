import { View, Text, ScrollView, Image } from "react-native";

// Static chat data
const chatMessages = [
  {
    id: 1,
    driverName: "John Smith",
    driverImage: "👨‍✈️",
    lastMessage: "I'm arriving in 2 minutes",
    time: "2:30 PM",
    unread: 2,
    online: true
  },
  {
    id: 2,
    driverName: "Sarah Johnson",
    driverImage: "👩‍✈️",
    lastMessage: "Thank you for riding with me!",
    time: "Yesterday",
    unread: 0,
    online: false
  },
  {
    id: 3,
    driverName: "Mike Brown",
    driverImage: "👨‍✈️",
    lastMessage: "Pickup location confirmed",
    time: "Oct 20",
    unread: 0,
    online: false
  },
  {
    id: 4,
    driverName: "Emma Wilson",
    driverImage: "👩‍✈️",
    lastMessage: "Have a safe journey!",
    time: "Oct 18",
    unread: 0,
    online: true
  }
];

export default function ChatPage() {
  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-blue-600 p-6 pt-12 pb-6">
        <Text className="text-white text-2xl font-bold mb-1">My Chats</Text>
        <Text className="text-blue-100 text-sm">Messages with your drivers</Text>
      </View>

      <ScrollView className="flex-1">
        <View className="p-4">
          {chatMessages.map((chat) => (
            <View key={chat.id} className="bg-white rounded-2xl p-4 mb-3 shadow-sm">
              <View className="flex-row items-center">
                {/* Driver Image */}
                <View className="relative">
                  <View className="bg-blue-100 rounded-full w-14 h-14 items-center justify-center">
                    <Text className="text-3xl">{chat.driverImage}</Text>
                  </View>
                  {chat.online && (
                    <View className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
                  )}
                </View>

                {/* Chat Content */}
                <View className="flex-1 ml-4">
                  <View className="flex-row justify-between items-center mb-1">
                    <Text className="text-gray-800 font-bold text-base">{chat.driverName}</Text>
                    <Text className="text-gray-500 text-xs">{chat.time}</Text>
                  </View>
                  <View className="flex-row justify-between items-center">
                    <Text className="text-gray-600 text-sm flex-1" numberOfLines={1}>
                      {chat.lastMessage}
                    </Text>
                    {chat.unread > 0 && (
                      <View className="bg-blue-600 rounded-full w-6 h-6 items-center justify-center ml-2">
                        <Text className="text-white text-xs font-bold">{chat.unread}</Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Empty State */}
        {chatMessages.length === 0 && (
          <View className="items-center justify-center p-8 mt-20">
            <Text className="text-6xl mb-4">💬</Text>
            <Text className="text-gray-800 text-lg font-bold mb-2">No messages yet</Text>
            <Text className="text-gray-600 text-sm text-center">
              Your conversations with drivers will appear here
            </Text>
          </View>
        )}

        {/* Support Section */}
        <View className="p-4 pb-8">
          <View className="bg-blue-50 rounded-2xl p-4 border border-blue-200">
            <View className="flex-row items-center">
              <Text className="text-3xl mr-3">🛟</Text>
              <View className="flex-1">
                <Text className="text-blue-900 font-bold text-base mb-1">Need Help?</Text>
                <Text className="text-blue-700 text-sm">Contact our 24/7 support team</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}