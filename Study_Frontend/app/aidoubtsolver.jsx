import { useEffect, useRef, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  StatusBar,
  Dimensions,
  Keyboard,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { aiChat } from "../api/googleai";
import { LinearGradient } from 'expo-linear-gradient';
import { isAuthenticated } from "../api/firebaseauth"; 

const { width } = Dimensions.get('window');

// Helper function moved outside of the component
function cryptoRandomId() {
  const bytes =
    typeof crypto !== "undefined" && crypto.getRandomValues
      ? crypto.getRandomValues(new Uint8Array(8))
      : Array.from({ length: 8 }, () => Math.floor(Math.random() * 256));
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

// Function to clean AI response text
function cleanAIResponse(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/`(.*?)`/g, '$1')
    .replace(/#{1,6}\s/g, '')
    .replace(/^\s*[-*+]\s/gm, '• ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export default function AIDoubtChat() {
  const router = useRouter();
  const listRef = useRef(null);
  const inputRef = useRef(null);

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [typing, setTyping] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [userName, setUserName] = useState(null); 

  // ✅ fetch user fullname from Firestore
  useEffect(() => {
    const initialize = async () => {
      const result = await isAuthenticated();
      if (result.isAuth && result.user) {
        const name = result.user.fullname || result.user.displayName || result.user.email;
        setUserName(name);
        setMessages([
          {
            id: cryptoRandomId(),
            role: "assistant",
            content: `Hey ${name}! I'm Study Buddy 🤖. Ask me any doubt—math, science, coding, anything! I'm here to help you learn.`,
            createdAt: new Date().toISOString(),
          },
        ]);
      } else {
        setMessages([
          {
            id: cryptoRandomId(),
            role: "assistant",
            content: "Hey! I'm Study Buddy 🤖. Ask me any doubt—math, science, coding, anything! I'm here to help you learn.",
            createdAt: new Date().toISOString(),
          },
        ]);
      }
    };

    initialize();
  }, []);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', (e) => {
      setKeyboardHeight(e.endCoordinates.height);
    });
    
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardHeight(0);
    });

    return () => {
      keyboardDidShowListener?.remove();
      keyboardDidHideListener?.remove();
    };
  }, []);

  useEffect(() => {
    if (listRef.current) {
      setTimeout(() => {
        listRef.current.scrollToOffset({ offset: 0, animated: true });
      }, 100);
    }
  }, [messages]);

  const MessageBubble = ({ item }) => {
    const isUser = item.role === "user";
    const cleanContent = isUser ? item.content : cleanAIResponse(item.content);

    return (
      <View
        style={{
          alignSelf: isUser ? "flex-end" : "flex-start",
          maxWidth: width * 0.8,
          marginHorizontal: 16,
          marginVertical: 4,
        }}
      >
        {isUser ? (
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              paddingHorizontal: 16,
              paddingVertical: 12,
              borderRadius: 20,
              borderBottomRightRadius: 8,
            }}
          >
            <Text style={{ color: 'white', fontSize: 16, lineHeight: 22 }}>
              {cleanContent}
            </Text>
            <Text style={{ 
              color: 'rgba(255, 255, 255, 0.7)', 
              fontSize: 12, 
              marginTop: 4, 
              textAlign: 'right' 
            }}>
              {new Date(item.createdAt).toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </Text>
          </LinearGradient>
        ) : (
          <View style={{
            backgroundColor: 'white',
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderRadius: 20,
            borderBottomLeftRadius: 8,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 3,
            elevation: 3,
          }}>
            <Text style={{ color: '#374151', fontSize: 16, lineHeight: 22 }}>
              {cleanContent}
            </Text>
            <Text style={{ 
              color: '#9CA3AF', 
              fontSize: 12, 
              marginTop: 4,
              textAlign: 'right' 
            }}>
              {new Date(item.createdAt).toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </Text>
          </View>
        )}
      </View>
    );
  };

  const onSend = async () => {
    const text = input.trim();
    if (!text || sending) return;

    const userMsg = {
      id: cryptoRandomId(),
      role: "user",
      content: text,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [userMsg, ...prev]);
    setInput("");
    setSending(true);
    setTyping(true);

    try {
      const recentChatHistory = [userMsg, ...messages]
        .slice(0, 12)
        .reverse()
        .map(({ role, content }) => ({ role, content }));

      const aiReply = await aiChat(text, '', recentChatHistory);

      const botMsg = {
        id: cryptoRandomId(),
        role: "assistant",
        content: String(aiReply || "I didn't catch that—try rephrasing? 🤔"),
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [botMsg, ...prev]);
    } catch (e) {
      console.error("AI chat error:", e);
      Alert.alert(
        "Connection Error",
        "Unable to reach Study Buddy right now. Please check your connection and try again.",
        [{ text: "OK", style: "default" }]
      );
    } finally {
      setSending(false);
      setTyping(false);
    }
  };

  // ✅ fixed new chat
  const onNewChat = () => {
    setMessages([
      {
        id: cryptoRandomId(),
        role: "assistant",
        content: `Fresh start ${userName || ""}! What would you like to explore today? I'm excited to help you learn something new! ✨`,
        createdAt: new Date().toISOString(),
      },
    ]);
  };

  const TypingIndicator = () => (
    <View style={{
      alignSelf: 'flex-start',
      marginHorizontal: 16,
      marginVertical: 8,
      backgroundColor: 'white',
      borderRadius: 20,
      paddingHorizontal: 16,
      paddingVertical: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 3,
    }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View style={{ flexDirection: 'row' }}>
          {[0, 1, 2].map((i) => (
            <View
              key={i}
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: '#667eea',
                marginHorizontal: 2,
                opacity: 0.7,
              }}
            />
          ))}
        </View>
        <Text style={{ marginLeft: 12, color: '#6B7280' }}>
          Study Buddy is thinking...
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />

      {/* Header */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          paddingHorizontal: 16,
          paddingVertical: 16,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity 
            onPress={() => router.back()} 
            style={{ 
              marginRight: 16, 
              padding: 8,
              borderRadius: 20,
              backgroundColor: 'rgba(255, 255, 255, 0.2)' 
            }}
          >
            <Ionicons name="chevron-back" size={24} color="white" />
          </TouchableOpacity>
          <View>
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: 'white' }}>
              Study Buddy
            </Text>
            <Text style={{ fontSize: 14, color: 'rgba(255, 255, 255, 0.8)' }}>
              Online
            </Text>
          </View>
        </View>
        <TouchableOpacity 
          onPress={onNewChat} 
          style={{ 
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: 20,
            backgroundColor: 'rgba(255, 255, 255, 0.2)' 
          }}
        >
          <Ionicons name="add" size={20} color="white" />
          <Text style={{ 
            color: 'white', 
            fontSize: 14, 
            fontWeight: '600',
            marginLeft: 6 
          }}>
            New Chat
          </Text>
        </TouchableOpacity>
      </LinearGradient>

      {/* Chat Area */}
      <View style={{ flex: 1 }}>
        <FlatList
          ref={listRef}
          style={{ flex: 1 }}
          contentContainerStyle={{ 
            paddingVertical: 16,
            paddingBottom: keyboardHeight > 0 ? 120 : 16 
          }}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <MessageBubble item={item} />}
          inverted
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={typing ? <TypingIndicator /> : null}
        />

        {/* Input Area */}
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
        >
          <View style={{
            backgroundColor: 'white',
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderTopWidth: 1,
            borderTopColor: '#E5E7EB',
            marginBottom: keyboardHeight > 0 && Platform.OS === 'android' ? keyboardHeight : 0,
          }}>
            <View style={{
              flexDirection: 'row',
              alignItems: 'flex-end',
              backgroundColor: '#F3F4F6',
              borderRadius: 25,
              paddingHorizontal: 16,
              paddingVertical: 8,
              minHeight: 50,
            }}>
              <TextInput
                ref={inputRef}
                style={{
                  flex: 1,
                  fontSize: 16,
                  maxHeight: 120,
                  paddingVertical: 8,
                  paddingRight: 8,
                  color: '#374151',
                }}
                placeholder="Ask me anything..."
                placeholderTextColor="#9CA3AF"
                multiline
                value={input}
                onChangeText={setInput}
                textAlignVertical="top"
              />
              <TouchableOpacity
                onPress={onSend}
                disabled={sending || input.trim().length === 0}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: sending || input.trim().length === 0 ? '#D1D5DB' : '#667eea',
                  marginLeft: 8,
                }}
              >
                {sending ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Ionicons name="send" size={20} color="#fff" />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
}
