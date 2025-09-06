// ForgotPasswordScreen.js
import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,} from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";

import { sendPasswordResetEmail } from "../api/firebaseauth"; // We'll create this

const ForgotPasswordScreen = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePasswordReset = async () => {
    setError("");
    setSuccess("");

    // Validate email
    if (!email) {
      return setError("Please enter your email address.");
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return setError("Please enter a valid email address.");
    }

    setLoading(true);
    try {
      await sendPasswordResetEmail(email);
      setSuccess(
        "Password reset email sent! Please check your inbox and follow the instructions to reset your password."
      );
      
      // Optional: Auto-navigate back after success
      setTimeout(() => {
        router.back();
      }, 3000);
      
    } catch (err) {
      console.error("❌ Password reset error:", err);
      
      // Handle specific Firebase errors
      let errorMessage = "Failed to send reset email. Please try again.";
      if (err.message?.includes("user-not-found")) {
        errorMessage = "No account found with this email address.";
      } else if (err.message?.includes("invalid-email")) {
        errorMessage = "Please enter a valid email address.";
      } else if (err.message?.includes("too-many-requests")) {
        errorMessage = "Too many requests. Please try again later.";
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "center",
            paddingHorizontal: 45,
            paddingBottom: 60,
          }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="items-center mb-8">
            <View className="bg-blue-100 p-4 rounded-full mb-4">
              <Feather name="lock" size={32} color="#2563EB" />
            </View>
            <Text className="text-2xl font-bold text-gray-800 mb-2">
              Forgot Password?
            </Text>
            <Text className="text-gray-500 text-center leading-6">
              No worries! Enter your email address and we'll send you a link to reset your password.
            </Text>
          </View>

          {error ? (
            <View className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <View className="flex-row items-center">
                <Feather name="alert-circle" size={20} color="#DC2626" />
                <Text className="text-red-600 ml-2 flex-1">{error}</Text>
              </View>
            </View>
          ) : null}

          {success ? (
            <View className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <View className="flex-row items-center">
                <Feather name="check-circle" size={20} color="#059669" />
                <Text className="text-green-600 ml-2 flex-1">{success}</Text>
              </View>
            </View>
          ) : null}

          <View className="mb-6">
            <Text className="text-gray-700 mb-2 font-medium">Email Address</Text>
            <TextInput
              placeholder="Enter your registered email"
              placeholderTextColor="#9CA3AF"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              className="bg-gray-100 text-gray-800 rounded-xl px-4 py-3 border border-gray-300"
              editable={!loading}
            />
          </View>

          <TouchableOpacity
            onPress={handlePasswordReset}
            disabled={loading || !email}
            className={`py-3 rounded-xl shadow-md mb-6 ${
              loading || !email ? "bg-gray-400" : "bg-blue-600"
            }`}
          >
            <Text className="text-white font-semibold text-center text-lg">
              {loading ? "⏳ Sending..." : "Send Reset Email"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.back()}
            disabled={loading}
            className="py-3"
          >
            <Text className="text-center text-blue-600 font-medium underline">
              Back to Login
            </Text>
          </TouchableOpacity>

          {/* Help section */}
          <View className="mt-8 p-4 bg-gray-50 rounded-lg">
            <Text className="text-gray-600 text-sm text-center">
              Didn't receive the email? Check your spam folder or try again in a few minutes.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ForgotPasswordScreen;