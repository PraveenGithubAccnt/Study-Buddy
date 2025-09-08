import { View, Text } from "react-native";
import { PieChart } from "react-native-gifted-charts";

export default function ProgressCard({ progress }) {
  // Create pie data for progress visualization
  const pieData = [
    {
      value: progress * 100,
      color: '#2563eb', 
      gradientCenterColor: '#3b82f6',
    },
    {
      value: (1 - progress) * 100,
      color: '#e5e7eb', 
      gradientCenterColor: '#f3f4f6',
    }
  ];

  return (
    <View className="bg-white rounded-xl shadow items-center p-4">
      <Text className="text-lg font-semibold mb-3">Study Progress</Text>
      <View className="relative items-center justify-center">
        <PieChart
          donut
          innerRadius={50}
          radius={70}
          data={pieData}
          centerLabelComponent={() => (
            <View className="items-center justify-center">
              <Text className="text-xl font-bold text-gray-700">
                {Math.round(progress * 100)}%
              </Text>
            </View>
          )}
          showText={false}
          strokeWidth={2}
          strokeColor="#ffffff"
        />
      </View>
    </View>
  );
}