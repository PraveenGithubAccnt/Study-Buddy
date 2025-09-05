import { View, Text } from "react-native";
import NotesCard from "./studynotescard";
import { Ionicons } from "@expo/vector-icons";

export default function NotesList({ notes }) {
  if (!notes || notes.length === 0) {
    return (
      <View className="items-center justify-center p-4">
        <Ionicons name="document-outline" size={40} color="#9ca3af" />
        <Text className="text-gray-500 mt-2 text-center">
          Enter a topic to get related PDFs.
        </Text>
      </View>
    );
  }

  return (
    <View className="px-2">
      {notes.map((note) => (
        <NotesCard key={note.link} note={note} />
      ))}
    </View>
  );
}
