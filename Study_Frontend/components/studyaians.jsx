import { View, Text, ScrollView } from "react-native";

export default function AINotes({ text }) {
  const hasContent = text && text.trim().length > 0;

  return (
    <View className="p-2">
      {hasContent ? (
        <ScrollView nestedScrollEnabled={true}>
          <Text className="text-base leading-6 text-gray-700 whitespace-pre-line">
            {text}
          </Text>
        </ScrollView>
      ) : (
        <Text className="text-base text-gray-500 italic">
          No notes available yet. Try searching a topic.
        </Text>
      )}
    </View>
  );
}
