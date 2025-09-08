import { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  TextInput,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
// Import the correct AI quiz generation API
import { generateQuizQuestions } from "../api/googleai";

// Function: Parse AI response string into quiz question objects
const parseQuizResponse = (aiResponse) => {
  try {
    console.log("Raw AI Response:", aiResponse);

    if (!aiResponse || typeof aiResponse !== "string") {
      return [];
    }

    const questions = [];
    const lines = aiResponse.split("\n").filter((line) => line.trim());

    let currentQuestion = null;
    let questionCounter = 0;

    for (const line of lines) {
      const trimmedLine = line.trim();

      // Detect question (starts with number and dot)
      if (trimmedLine.match(/^\d+\./)) {
        if (currentQuestion && currentQuestion.options.length >= 2) {
          questions.push(currentQuestion);
        }
        questionCounter++;
        const questionText = trimmedLine.replace(/^\d+\.\s*/, "");

        currentQuestion = {
          id: `q${questionCounter}`,
          question: questionText,
          options: [],
          answer: null,
        };
      }
      else if (trimmedLine.match(/^[A-D]\)/) && currentQuestion) {
        const optionText = trimmedLine.replace(/^[A-D]\)\s*/, "");
        currentQuestion.options.push(optionText);
      }
      // Detect answer line
      else if (
        trimmedLine.toLowerCase().includes("answer:") &&
        currentQuestion
      ) {
        const answerMatch = trimmedLine.match(/answer:\s*\[?([A-D])\]?/i);
        if (answerMatch && currentQuestion.options.length > 0) {
          const answerIndex = answerMatch[1].toUpperCase().charCodeAt(0) - 65;
          if (
            answerIndex >= 0 &&
            answerIndex < currentQuestion.options.length
          ) {
            currentQuestion.answer = currentQuestion.options[answerIndex];
          }
        }
      }
    }

    // Add the last question if it exists
    if (currentQuestion && currentQuestion.options.length >= 2) {
      questions.push(currentQuestion);
    }

    console.log("Parsed Questions:", questions);
    return questions;
  } catch (error) {
    console.error("Error parsing quiz response:", error);
    return [];
  }
};

// QuizQuestions component
const QuizQuestions = ({
  questions,
  loading,
  onAnswerSelect,
  selectedAnswers,
}) => {
  const renderQuestion = ({ item, index }) => (
    <View
      style={{
        backgroundColor: "white",
        padding: 20,
        borderRadius: 16,
        marginVertical: 8,
        marginHorizontal: 4,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
      }}
    >
      <Text
        style={{
          fontSize: 16,
          fontWeight: "600",
          color: "#1F2937",
          marginBottom: 16,
          lineHeight: 24,
        }}
      >
        {index + 1}. {item.question}
      </Text>
      {item.options.map((option, optIndex) => {
        const isSelected = selectedAnswers[item.id] === option;
        return (
          <TouchableOpacity
            key={optIndex}
            onPress={() => onAnswerSelect(item.id, option)}
            style={{
              backgroundColor: isSelected ? "#EBF4FF" : "#F9FAFB",
              borderWidth: 2,
              borderColor: isSelected ? "#3B82F6" : "#E5E7EB",
              paddingHorizontal: 16,
              paddingVertical: 12,
              borderRadius: 12,
              marginVertical: 4,
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <View
              style={{
                width: 20,
                height: 20,
                borderRadius: 10,
                borderWidth: 2,
                borderColor: isSelected ? "#3B82F6" : "#9CA3AF",
                backgroundColor: isSelected ? "#3B82F6" : "transparent",
                marginRight: 12,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {isSelected && (
                <Ionicons name="checkmark" size={12} color="white" />
              )}
            </View>
            <Text
              style={{
                fontSize: 15,
                color: isSelected ? "#1E40AF" : "#374151",
                fontWeight: isSelected ? "500" : "400",
              }}
            >
              {option}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={{ marginTop: 16, fontSize: 16, color: "#6B7280" }}>
          AI is generating your personalized quiz...
        </Text>
      </View>
    );
  }

  if (questions.length === 0) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          padding: 20,
        }}
      >
        <Ionicons name="document-text-outline" size={64} color="#9CA3AF" />
        <Text
          style={{
            textAlign: "center",
            color: "#6B7280",
            fontSize: 16,
            marginTop: 16,
          }}
        >
          No questions could be generated. Please try again with different inputs.
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={questions}
      keyExtractor={(item) => item.id}
      renderItem={renderQuestion}
      contentContainerStyle={{ paddingBottom: 20 }}
      showsVerticalScrollIndicator={false}
    />
  );
};

const InputField = ({
  label,
  value,
  onChangeText,
  placeholder,
  multiline = false,
}) => (
  <View style={{ marginBottom: 20 }}>
    <Text
      style={{
        fontSize: 16,
        fontWeight: "600",
        color: "#374151",
        marginBottom: 8,
      }}
    >
      {label}
    </Text>
    <TextInput
      style={{
        borderWidth: 2,
        borderColor: "#E5E7EB",
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        backgroundColor: "white",
        minHeight: multiline ? 80 : 50,
        textAlignVertical: multiline ? "top" : "center",
      }}
      placeholder={placeholder}
      placeholderTextColor="#9CA3AF"
      value={value}
      onChangeText={onChangeText}
      multiline={multiline}
    />
  </View>
);

const DifficultySelector = ({ selectedDifficulty, onSelect }) => {
  const difficulties = [
    { key: "Easy", label: "Easy", color: "#10B981", bgColor: "#D1FAE5" },
    { key: "Medium", label: "Medium", color: "#F59E0B", bgColor: "#FEF3C7" },
    { key: "Hard", label: "Hard", color: "#EF4444", bgColor: "#FEE2E2" },
  ];

  return (
    <View style={{ marginBottom: 20 }}>
      <Text
        style={{
          fontSize: 16,
          fontWeight: "600",
          color: "#374151",
          marginBottom: 8,
        }}
      >
        Difficulty Level
      </Text>
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        {difficulties.map((diff) => (
          <TouchableOpacity
            key={diff.key}
            onPress={() => onSelect(diff.key)}
            style={{
              flex: 1,
              marginHorizontal: 4,
              paddingVertical: 12,
              paddingHorizontal: 8,
              borderRadius: 12,
              borderWidth: 2,
              borderColor:
                selectedDifficulty === diff.key ? diff.color : "#E5E7EB",
              backgroundColor:
                selectedDifficulty === diff.key ? diff.bgColor : "white",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontSize: 14,
                fontWeight: selectedDifficulty === diff.key ? "600" : "500",
                color: selectedDifficulty === diff.key ? diff.color : "#6B7280",
              }}
            >
              {diff.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export default function QuizPractice() {
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [subtopic, setSubtopic] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [showQuiz, setShowQuiz] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [quizCompleted, setQuizCompleted] = useState(false);

  // Use the AI quiz API
  const generateQuizWithAI = async (quizData) => {
    try {
      console.log("Generating quiz with data:", quizData);
      const aiResponse = await generateQuizQuestions(
        quizData.subject,
        quizData.topic,
        quizData.subtopic,
        quizData.difficulty
      );
      console.log("AI Response received:", aiResponse);
      const parsedQuestions = parseQuizResponse(aiResponse);
      return parsedQuestions;
    } catch (error) {
      console.error("Error generating quiz:", error);
      throw error;
    }
  };

  const handleStartQuiz = async () => {
    if (!subject.trim() || !topic.trim() || !difficulty) {
      Alert.alert(
        "Missing Information",
        "Please fill in the subject, topic, and select a difficulty level."
      );
      return;
    }

    setLoading(true);

    try {
      const quizData = {
        subject: subject.trim(),
        topic: topic.trim(),
        subtopic: subtopic.trim(),
        difficulty: difficulty,
      };

      const generatedQuestions = await generateQuizWithAI(quizData);

      if (generatedQuestions.length === 0) {
        Alert.alert(
          "No Questions Generated",
          "Could not generate questions for this topic. Please try different inputs."
        );
        setLoading(false);
        return;
      }

      setQuestions(generatedQuestions);
      setShowQuiz(true);
    } catch (error) {
      console.error("Error generating quiz:", error);
      Alert.alert(
        "Generation Error",
        "Failed to generate quiz. Please check your connection and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (questionId, selectedOption) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: selectedOption,
    }));
  };

  const handleSubmitQuiz = () => {
    const answeredQuestions = Object.keys(selectedAnswers).length;
    if (answeredQuestions < questions.length) {
      Alert.alert(
        "Incomplete Quiz",
        "Please answer all questions before submitting."
      );
      return;
    }

   
    let correctAnswers = 0;
    questions.forEach((q) => {
      // Ensure answer strings match exactly
      if (selectedAnswers[q.id] === q.answer) {
        correctAnswers++;
      }
    });

    const score = Math.round((correctAnswers / questions.length) * 100);
    setQuizCompleted(true);

    Alert.alert(
      "Quiz Complete! 🎉",
      `Your score: ${score}% (${correctAnswers}/${questions.length} correct)`,
      [
        { text: "New Quiz", onPress: handleRestart },
        { text: "OK", style: "default" },
      ]
    );
  };

  const handleRestart = () => {
    setShowQuiz(false);
    setQuestions([]);
    setSelectedAnswers({});
    setQuizCompleted(false);
    setSubject("");
    setTopic("");
    setSubtopic("");
    setDifficulty("");
  };

  if (showQuiz) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#F8FAFC" }}>
        <LinearGradient
          colors={["#667eea", "#764ba2"]}
          style={{
            paddingHorizontal: 16,
            paddingVertical: 16,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <TouchableOpacity
              onPress={() => setShowQuiz(false)}
              style={{
                marginRight: 16,
                padding: 8,
                borderRadius: 20,
                backgroundColor: "rgba(255, 255, 255, 0.2)",
              }}
            >
              <Ionicons name="chevron-back" size={24} color="white" />
            </TouchableOpacity>
            <View>
              <Text
                style={{ fontSize: 18, fontWeight: "bold", color: "white" }}
              >
                {subject} - {topic}
              </Text>
              <Text style={{ fontSize: 14, color: "rgba(255, 255, 255, 0.8)" }}>
                {difficulty} Level
              </Text>
            </View>
          </View>
          {!loading && questions.length > 0 && (
            <Text style={{ color: "white", fontSize: 14 }}>
              {Object.keys(selectedAnswers).length}/{questions.length}
            </Text>
          )}
        </LinearGradient>

        <View style={{ flex: 1, padding: 16 }}>
          <QuizQuestions
            questions={questions}
            loading={loading}
            onAnswerSelect={handleAnswerSelect}
            selectedAnswers={selectedAnswers}
          />
          {!loading && questions.length > 0 && (
            <TouchableOpacity
              onPress={handleSubmitQuiz}
              style={{
                backgroundColor: "#3B82F6",
                paddingVertical: 16,
                borderRadius: 12,
                alignItems: "center",
                marginTop: 16,
              }}
            >
              <Text style={{ color: "white", fontSize: 16, fontWeight: "600" }}>
                Submit Quiz
              </Text>
            </TouchableOpacity>
          )}
        </View>
        {quizCompleted && (
          <View
            style={{
              position: "absolute",
              top: "40%",
              left: "10%",
              right: "10%",
              padding: 20,
              backgroundColor: "white",
              borderRadius: 12,
              shadowColor: "#000",
              shadowOpacity: 0.2,
              shadowRadius: 5,
              elevation: 5,
              alignItems: "center",
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: "bold" }}>
              🎉 Quiz Completed!
            </Text>
            <TouchableOpacity
              style={{
                marginTop: 15,
                padding: 10,
                backgroundColor: "#4CAF50",
                borderRadius: 8,
              }}
              onPress={() => setQuizCompleted(false)} // Close popup
            >
              <Text style={{ color: "white" }}>OK</Text>
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F8FAFC" }}>
      <LinearGradient
        colors={["#667eea", "#764ba2"]}
        style={{
          paddingHorizontal: 16,
          paddingVertical: 16,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text style={{ fontSize: 20, fontWeight: "bold", color: "white" }}>
            AI Quiz Generator
          </Text>
        </View>
        <Ionicons name="create-outline" size={24} color="white" />
      </LinearGradient>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 20 }}
          showsVerticalScrollIndicator={false}
        >
          <InputField
            label="Subject *"
            value={subject}
            onChangeText={setSubject}
            placeholder="e.g., Mathematics, Physics, History, Programming"
          />
          <InputField
            label="Topic *"
            value={topic}
            onChangeText={setTopic}
            placeholder="e.g., Algebra, Quantum Physics, World War II, React"
          />
          <InputField
            label="Subtopic (Optional)"
            value={subtopic}
            onChangeText={setSubtopic}
            placeholder="e.g., Quadratic Equations, Wave Functions, Battle of Normandy"
            multiline={true}
          />
          <DifficultySelector
            selectedDifficulty={difficulty}
            onSelect={setDifficulty}
          />
          <TouchableOpacity
            onPress={handleStartQuiz}
            disabled={loading}
            style={{
              backgroundColor: loading ? "#9CA3AF" : "#3B82F6",
              paddingVertical: 16,
              borderRadius: 12,
              alignItems: "center",
              marginTop: 20,
              flexDirection: "row",
              justifyContent: "center",
            }}
          >
            {loading ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Ionicons name="sparkles-outline" size={24} color="white" />
            )}
            <Text
              style={{
                color: "white",
                fontSize: 16,
                fontWeight: "600",
                marginLeft: 8,
              }}
            >
              {loading ? "Generating Quiz..." : "Generate AI Quiz"}
            </Text>
          </TouchableOpacity>
          <View
            style={{
              backgroundColor: "white",
              borderRadius: 12,
              padding: 16,
              marginTop: 20,
              borderWidth: 1,
              borderColor: "#E5E7EB",
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <Ionicons name="bulb-outline" size={20} color="#3B82F6" />
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "600",
                  color: "#1F2937",
                  marginLeft: 8,
                }}
              >
                AI-Powered Quiz Generation
              </Text>
            </View>
            <Text style={{ fontSize: 14, color: "#6B7280", lineHeight: 20 }}>
              Our AI will create personalized quiz questions based on your inputs.
              Be specific with your topic for better, more targeted questions.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
