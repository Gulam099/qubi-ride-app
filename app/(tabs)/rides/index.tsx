import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';

const availableRides = [
  {
    id: 1,
    driverName: 'John Smith',
    carModel: 'Toyota Camry',
    carNumber: 'DL 01 AB 1234',
    rating: 4.8,
    price: 250,
    eta: '5 min',
    seats: 4,
    image: '🚗'
  },
  {
    id: 2,
    driverName: 'Sarah Johnson',
    carModel: 'Honda Civic',
    carNumber: 'DL 02 CD 5678',
    rating: 4.9,
    price: 280,
    eta: '8 min',
    seats: 4,
    image: '🚙'
  },
  {
    id: 3,
    driverName: 'Mike Brown',
    carModel: 'Hyundai Creta',
    carNumber: 'DL 03 EF 9012',
    rating: 4.7,
    price: 320,
    eta: '3 min',
    seats: 6,
    image: '🚐'
  },
  {
    id: 4,
    driverName: 'Emma Wilson',
    carModel: 'Maruti Swift',
    carNumber: 'DL 04 GH 3456',
    rating: 4.6,
    price: 200,
    eta: '10 min',
    seats: 4,
    image: '🚗'
  }
];


const RidePage = ({ onBookRide }) => {
  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="bg-blue-600 p-6 pt-12 pb-6 rounded-b-3xl">
        <Text className="text-white text-2xl font-bold mb-1">Available Rides</Text>
        <Text className="text-blue-100 text-sm">Choose your preferred ride</Text>
      </View>

      <View className="p-4">
        {availableRides.map((ride) => (
          <View key={ride.id} className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
            <View className="flex-row items-center mb-3">
              <Text className="text-4xl mr-3">{ride.image}</Text>
              <View className="flex-1">
                <Text className="text-lg font-bold text-gray-800">{ride.driverName}</Text>
                <Text className="text-gray-600 text-sm">{ride.carModel}</Text>
                <Text className="text-gray-500 text-xs">{ride.carNumber}</Text>
              </View>
              <View className="items-end">
                <Text className="text-2xl font-bold text-blue-600">₹{ride.price}</Text>
                <Text className="text-gray-500 text-xs">per trip</Text>
              </View>
            </View>

            <View className="flex-row justify-between items-center mb-3 bg-gray-50 p-3 rounded-xl">
              <View className="flex-row items-center">
                <Text className="text-yellow-500 mr-1">⭐</Text>
                <Text className="text-gray-700 font-semibold">{ride.rating}</Text>
              </View>
              <View className="flex-row items-center">
                <Text className="text-gray-600 mr-1">🕐</Text>
                <Text className="text-gray-700 font-semibold">{ride.eta} away</Text>
              </View>
              <View className="flex-row items-center">
                <Text className="text-gray-600 mr-1">👥</Text>
                <Text className="text-gray-700 font-semibold">{ride.seats} seats</Text>
              </View>
            </View>

            <TouchableOpacity
              className="bg-blue-600 rounded-xl p-3"
              onPress={() => onBookRide(ride)}
            >
              <Text className="text-white text-center font-bold text-base">Book Now</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

export default RidePage