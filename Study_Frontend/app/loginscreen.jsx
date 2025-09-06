// LoginScreen.js
import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";

import { loginUser } from "../api/firebaseauth"; // call backend

const LoginScreen = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    setError("");
    if (!email || !password) {
      return setError("Please enter both email and password.");
    }

    setLoading(true);
    try {
      // Call backend (this function stores token/user into AsyncStorage already)
      const res = await loginUser(email, password);
      console.log("✅ Backend login response:", res);

      // If you want to keep additional local storage handling here, do it.
      // But your loginUser() already stores token & user as implemented.

      // Navigate
      router.replace("/(tabs)/home");
    } catch (err) {
      console.error("❌ Login error:", err);
      // err may be an Error object or string depending on thrown value
      setError(err.message || String(err) || "Login failed. Try again.");
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
          <View className="items-center mb-10">
            <Text className="text-4xl font-extrabold text-blue-600">
              Study Buddy
            </Text>
            <Text className="text-lg text-gray-500 mt-2">
              Welcome back! Please login
            </Text>
          </View>

          {error ? (
            <Text className="text-red-600 text-center mb-4 bg-red-50 p-3 rounded-lg">
              {error}
            </Text>
          ) : null}

          <TextInput
            placeholder="Email"
            placeholderTextColor="#9CA3AF" 
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            className="bg-gray-100 text-gray-800 rounded-xl px-4 py-3 mb-4 border border-gray-300"
            editable={!loading}
          />

          <View className="relative mb-6">
            <TextInput
              placeholder="Password"
              placeholderTextColor="#9CA3AF" 
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              className="bg-gray-100 text-gray-800 rounded-xl px-4 py-3 border border-gray-300 pr-12"
              editable={!loading}
            />
            <TouchableOpacity
              className="absolute right-4 top-3"
              onPress={() => setShowPassword(!showPassword)}
            >
              <Feather
                name={showPassword ? "eye" : "eye-off"}
                size={22}
                color="gray"
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={handleLogin}
            disabled={loading}
            className={`py-3 rounded-xl shadow-md mb-4 ${
              loading ? "bg-gray-400" : "bg-blue-600"
            }`}
          >
            <Text className="text-white font-semibold text-center text-lg">
              {loading ? "⏳ Signing In..." : "Login"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/registerscreen")}
            disabled={loading}
          >
            <Text className="text-center text-blue-600 underline">
              Don't have an account? Register
            </Text>
          </TouchableOpacity>

           <TouchableOpacity className="mt-4"
            onPress={() => router.push("/forgotpwd")}
            disabled={loading}
          >
            <Text className="text-center text-blue-600 underline">
              Forgot Password?
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LoginScreen;
