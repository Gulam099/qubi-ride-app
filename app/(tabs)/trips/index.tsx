
import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';

const userBookings = [
  {
    id: 101,
    driverName: 'John Smith',
    carModel: 'Toyota Camry',
    carNumber: 'DL 01 AB 1234',
    date: '2024-10-20',
    time: '10:30 AM',
    from: 'Connaught Place',
    to: 'Airport',
    price: 250,
    status: 'Completed',
    image: '🚗'
  },
  {
    id: 102,
    driverName: 'Sarah Johnson',
    carModel: 'Honda Civic',
    carNumber: 'DL 02 CD 5678',
    date: '2024-10-22',
    time: '03:15 PM',
    from: 'Sector 18',
    to: 'Cyber City',
    price: 280,
    status: 'Upcoming',
    image: '🚙'
  },
  {
    id: 103,
    driverName: 'Mike Brown',
    carModel: 'Hyundai Creta',
    carNumber: 'DL 03 EF 9012',
    date: '2024-10-18',
    time: '08:00 AM',
    from: 'Railway Station',
    to: 'Mall Road',
    price: 320,
    status: 'Completed',
    image: '🚐'
  }
];

const TripsPage = () => {
  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="bg-blue-600 p-6 pt-12 pb-6 rounded-b-3xl">
        <Text className="text-white text-2xl font-bold mb-1">My Trips</Text>
        <Text className="text-blue-100 text-sm">View your booking history</Text>
      </View>

      <View className="p-4">
        {userBookings.map((booking) => (
          <View key={booking.id} className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
            <View className="flex-row justify-between items-start mb-3">
              <View className="flex-row items-center flex-1">
                <Text className="text-3xl mr-3">{booking.image}</Text>
                <View className="flex-1">
                  <Text className="text-base font-bold text-gray-800">{booking.driverName}</Text>
                  <Text className="text-gray-600 text-xs">{booking.carModel}</Text>
                  <Text className="text-gray-500 text-xs">{booking.carNumber}</Text>
                </View>
              </View>
              <View className={`px-3 py-1 rounded-full ${booking.status === 'Completed' ? 'bg-green-100' : 'bg-blue-100'}`}>
                <Text className={`text-xs font-semibold ${booking.status === 'Completed' ? 'text-green-700' : 'text-blue-700'}`}>
                  {booking.status}
                </Text>
              </View>
            </View>

            <View className="bg-gray-50 p-3 rounded-xl mb-3">
              <View className="flex-row items-center mb-2">
                <Text className="text-gray-600 mr-2">📍</Text>
                <Text className="text-gray-700 text-sm font-semibold">{booking.from}</Text>
              </View>
              <View className="flex-row items-center">
                <Text className="text-gray-600 mr-2">📍</Text>
                <Text className="text-gray-700 text-sm font-semibold">{booking.to}</Text>
              </View>
            </View>

            <View className="flex-row justify-between items-center">
              <View>
                <Text className="text-gray-500 text-xs">Date & Time</Text>
                <Text className="text-gray-800 font-semibold text-sm">{booking.date} • {booking.time}</Text>
              </View>
              <View className="items-end">
                <Text className="text-gray-500 text-xs">Fare</Text>
                <Text className="text-blue-600 font-bold text-lg">₹{booking.price}</Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

export default TripsPage;