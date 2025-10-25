import { View, Text, ScrollView, TouchableOpacity } from "react-native";

// Static billing data
const billHistory = [
  {
    id: 1,
    rideId: "RD-2024-1001",
    date: "Oct 20, 2024",
    time: "10:30 AM",
    from: "Connaught Place",
    to: "Airport",
    distance: "25 km",
    duration: "35 min",
    baseFare: 150,
    distanceFare: 75,
    timeFare: 25,
    tax: 12.5,
    total: 262.5,
    paymentMethod: "Credit Card",
    status: "Paid"
  },
  {
    id: 2,
    rideId: "RD-2024-1002",
    date: "Oct 22, 2024",
    time: "03:15 PM",
    from: "Sector 18",
    to: "Cyber City",
    distance: "18 km",
    duration: "28 min",
    baseFare: 150,
    distanceFare: 90,
    timeFare: 28,
    tax: 13.4,
    total: 281.4,
    paymentMethod: "UPI",
    status: "Paid"
  },
  {
    id: 3,
    rideId: "RD-2024-1003",
    date: "Oct 18, 2024",
    time: "08:00 AM",
    from: "Railway Station",
    to: "Mall Road",
    distance: "12 km",
    duration: "20 min",
    baseFare: 150,
    distanceFare: 120,
    timeFare: 20,
    tax: 14.5,
    total: 304.5,
    paymentMethod: "Cash",
    status: "Paid"
  }
];

const totalSpent = billHistory.reduce((sum, bill) => sum + bill.total, 0);
const totalRides = billHistory.length;

export default function BillsPage() {
  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-blue-600 p-6 pt-12 pb-6">
        <Text className="text-white text-2xl font-bold mb-1">My Bills</Text>
        <Text className="text-blue-100 text-sm">Your payment history</Text>
      </View>

      <ScrollView className="flex-1">
        {/* Summary Cards */}
        <View className="p-4">
          <View className="flex-row gap-3 mb-4">
            <View className="flex-1 bg-white rounded-2xl p-4 shadow-sm">
              <Text className="text-gray-600 text-xs mb-1">Total Spent</Text>
              <Text className="text-blue-600 text-2xl font-bold">₹{totalSpent.toFixed(0)}</Text>
              <Text className="text-gray-500 text-xs mt-1">This month</Text>
            </View>
            <View className="flex-1 bg-white rounded-2xl p-4 shadow-sm">
              <Text className="text-gray-600 text-xs mb-1">Total Rides</Text>
              <Text className="text-green-600 text-2xl font-bold">{totalRides}</Text>
              <Text className="text-gray-500 text-xs mt-1">Completed</Text>
            </View>
          </View>

          {/* Bill History */}
          <Text className="text-gray-800 font-bold text-lg mb-3">Recent Bills</Text>
          
          {billHistory.map((bill) => (
            <View key={bill.id} className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
              {/* Header */}
              <View className="flex-row justify-between items-center mb-3 pb-3 border-b border-gray-100">
                <View>
                  <Text className="text-gray-800 font-bold text-base">{bill.rideId}</Text>
                  <Text className="text-gray-500 text-xs mt-1">{bill.date} • {bill.time}</Text>
                </View>
                <View className="bg-green-100 px-3 py-1 rounded-full">
                  <Text className="text-green-700 text-xs font-semibold">{bill.status}</Text>
                </View>
              </View>

              {/* Route */}
              <View className="bg-gray-50 rounded-xl p-3 mb-3">
                <View className="flex-row items-center mb-2">
                  <View className="w-2 h-2 bg-blue-600 rounded-full mr-3" />
                  <Text className="text-gray-700 text-sm font-semibold flex-1">{bill.from}</Text>
                </View>
                <View className="flex-row items-center">
                  <View className="w-2 h-2 bg-red-600 rounded-full mr-3" />
                  <Text className="text-gray-700 text-sm font-semibold flex-1">{bill.to}</Text>
                </View>
              </View>

              {/* Trip Details */}
              <View className="flex-row justify-between mb-3 pb-3 border-b border-gray-100">
                <View className="items-center">
                  <Text className="text-gray-500 text-xs mb-1">Distance</Text>
                  <Text className="text-gray-800 font-semibold text-sm">{bill.distance}</Text>
                </View>
                <View className="items-center">
                  <Text className="text-gray-500 text-xs mb-1">Duration</Text>
                  <Text className="text-gray-800 font-semibold text-sm">{bill.duration}</Text>
                </View>
                <View className="items-center">
                  <Text className="text-gray-500 text-xs mb-1">Payment</Text>
                  <Text className="text-gray-800 font-semibold text-sm">{bill.paymentMethod}</Text>
                </View>
              </View>

              {/* Fare Breakdown */}
              <View className="mb-3">
                <View className="flex-row justify-between mb-2">
                  <Text className="text-gray-600 text-sm">Base Fare</Text>
                  <Text className="text-gray-800 text-sm">₹{bill.baseFare}</Text>
                </View>
                <View className="flex-row justify-between mb-2">
                  <Text className="text-gray-600 text-sm">Distance Fare ({bill.distance})</Text>
                  <Text className="text-gray-800 text-sm">₹{bill.distanceFare}</Text>
                </View>
                <View className="flex-row justify-between mb-2">
                  <Text className="text-gray-600 text-sm">Time Fare ({bill.duration})</Text>
                  <Text className="text-gray-800 text-sm">₹{bill.timeFare}</Text>
                </View>
                <View className="flex-row justify-between mb-2">
                  <Text className="text-gray-600 text-sm">Tax & Fees</Text>
                  <Text className="text-gray-800 text-sm">₹{bill.tax}</Text>
                </View>
              </View>

              {/* Total */}
              <View className="bg-blue-50 rounded-xl p-3 flex-row justify-between items-center">
                <Text className="text-blue-900 font-bold text-base">Total Amount</Text>
                <Text className="text-blue-600 font-bold text-xl">₹{bill.total}</Text>
              </View>

              {/* Download Button */}
              <TouchableOpacity className="bg-gray-100 rounded-xl p-3 mt-3">
                <Text className="text-gray-700 text-center font-semibold text-sm">📄 Download Invoice</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Empty State */}
        {billHistory.length === 0 && (
          <View className="items-center justify-center p-8 mt-20">
            <Text className="text-6xl mb-4">💳</Text>
            <Text className="text-gray-800 text-lg font-bold mb-2">No bills yet</Text>
            <Text className="text-gray-600 text-sm text-center">
              Your ride bills and invoices will appear here
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}