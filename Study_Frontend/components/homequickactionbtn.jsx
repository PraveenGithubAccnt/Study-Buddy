import { View, Text, TouchableOpacity } from "react-native";
import { Calendar, Lightbulb, BookOpen, Bot } from "lucide-react-native";

const actions = [
  { id: 1, title: "Create Schedule", icon: Calendar },
  { id: 2, title: "Take Quiz", icon: Lightbulb },
  { id: 3, title: "Find Notes & Videos", icon: BookOpen },
  { id: 4, title: "AI Doubt Solver", icon: Bot },
];

export default function QuickActions({ onActionPress }) {
  return (
    <View className="bg-white p-4 rounded-xl shadow mb-4">
      <Text className="text-lg font-semibold mb-3">Quick Actions</Text>

      <View className="flex-row flex-wrap justify-between">
        {actions.map(({ id, title, icon: Icon }) => (
          <TouchableOpacity
            key={id}
            className="w-[49%] p-3 border rounded-xl mb-3 flex items-center justify-center"
            onPress={() => onActionPress && onActionPress(title)}
          >
            <Icon size={28} color="#3b82f6" />
            <Text className="text-sm mt-2 font-medium text-center">{title}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}
