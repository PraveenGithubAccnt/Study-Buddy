import { useState } from "react";
import {
  ScrollView,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from "react-native";
import AINotes from "../../components/studyaians";
import VideoList from "../../components/studyvideolist";
import NotesList from "../../components/studynoteslist";
import { getAIExplanation } from "../../api/googleai";
import { fetchYouTubeVideos } from "../../api/youtube";
import { fetchPDFs } from "../../api/pdfsearch";
import { rerankResults } from "../../api/reranksearch";

export default function StudyScreen() {
  const [query, setQuery] = useState("");
  const [aiNotes, setAiNotes] = useState("From Study Buddy...");
  const [videos, setVideos] = useState([]);
  const [notes, setNotes] = useState([]);

  const [aiLoading, setAiLoading] = useState(false);
  const [videoLoading, setVideoLoading] = useState(false);
  const [notesLoading, setNotesLoading] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;

    // 🔹 AI Notes
    setAiLoading(true);
    setAiNotes("");
    try {
      const explanation = await getAIExplanation(query);
      setAiNotes(explanation);
    } catch (err) {
      console.error("AI Error:", err);
      setAiNotes("Failed to fetch notes. Try again.");
      Alert.alert("AI Error", err.message || "Failed to fetch explanation.");
    } finally {
      setAiLoading(false);
    }

    // 🔹 YouTube Videos
    setVideoLoading(true);
    try {
      const result = await fetchYouTubeVideos(query);
      const rankedVideos = await rerankResults(query, result, "video");
      setVideos(rankedVideos);
    } catch (err) {
      console.error("YouTube Fetch Error:", err);
      Alert.alert("YouTube Error", err.message || "Failed to fetch videos.");
    } finally {
      setVideoLoading(false);
    }

    // 🔹 PDF Notes
    setNotesLoading(true);
    try {
      const pdfs = await fetchPDFs(query);
      const rankedNotes = await rerankResults(query, pdfs, "pdf");
      setNotes(rankedNotes);
    } catch (err) {
      console.error("PDF Fetch Error:", err);
      Alert.alert("PDF Error", err.message || "Failed to fetch notes.");
    } finally {
      setNotesLoading(false);
    }
  };

  const cleanNotes = typeof aiNotes === "string"
  ? aiNotes.replace(/\*\*|\*|#+/g, (match) => (match === "*" ? "-" : "")).trim()
  : "";

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="items-center justify-center bg-white shadow p-6">
        <Text className="text-2xl font-bold">Search Your Topics</Text>
      </View>

      {/* Search Bar */}
      <View className="flex-row items-center bg-white p-3 shadow-md">
        <TextInput
          placeholder="Enter topic..."
          value={query}
          onChangeText={setQuery}
          className="flex-1 px-3 py-2 border-2 border-blue-600 rounded-lg"
        />
        <TouchableOpacity
          className="ml-2 bg-blue-600 px-4 py-2 rounded-lg"
          onPress={handleSearch}
        >
          <Text className="text-white font-semibold">Search</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 bg-white p-4">
        {/* AI Notes */}
        <View className="mt-4 p-4 bg-blue-50 rounded-xl shadow min-h-[180px]">
          <Text className="text-lg font-semibold mb-2">Topic Notes</Text>
          {aiLoading ? (
            <ActivityIndicator size="large" color="blue" />
          ) : (
            <ScrollView nestedScrollEnabled={true}>
              <AINotes text={cleanNotes} />
            </ScrollView>
          )}
        </View>

        {/* Videos */}
        <Text className="text-lg font-semibold mt-4 mb-2">Topic Related Videos</Text>
        {videoLoading ? (
          <ActivityIndicator size="large" color="blue" />
        ) : (
          <VideoList videos={videos} />
        )}

        {/* PDF Notes */}
        <Text className="text-lg font-semibold mt-4 mb-2">Topic Related (PDF)</Text>
        {notesLoading ? (
          <ActivityIndicator size="large" color="blue" />
        ) : (
          <NotesList notes={notes} />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
