import { View, Text, TouchableOpacity, Linking } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const openPDF = (url) => {
  if (!url || typeof url !== "string") {
    console.warn("Invalid PDF URL");
    return;
  }

  Linking.openURL(url).catch((err) =>
    console.error("Failed to open URL: ", err)
  );
};

export default function NotesCard({ note }) {
  return (
    <View className="bg-white p-3 mb-3 rounded-2xl shadow">
      <TouchableOpacity
        onPress={() => openPDF(note.link)}
        activeOpacity={0.7}
        accessibilityLabel={`Open PDF titled ${note.title}`}
        className="flex-row items-center"
      >
        <Text className="text-sm font-semibold text-blue-500 flex-1 mr-2">
          {note.title}
        </Text>
        <Ionicons name="document-text-outline" size={22} color="#2563eb" />
      </TouchableOpacity>

      {note.snippet && (
        <Text className="text-xs text-gray-600 mt-2">
          {note.snippet.length > 100
            ? `${note.snippet.slice(0, 100)}...`
            : note.snippet}
        </Text>
      )}
    </View>
  );
}
