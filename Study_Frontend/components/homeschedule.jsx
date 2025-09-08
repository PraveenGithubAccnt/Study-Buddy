import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";

export default function StudyScheduleForm({ visible, onClose, onSave }) {
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  if (!visible) return null;

  const handleSave = () => {
    if (!subject.trim() || !topic.trim()) {
      Alert.alert("Error", "Please fill all fields!");
      return;
    }
    onSave({ subject, topic, date });
    onClose();
  };

  const isSaveDisabled = !subject.trim() || !topic.trim();

  return (
    <View className="absolute top-0 left-0 right-0 bottom-0 bg-black/50 justify-center items-center">
      <View className="bg-white p-6 rounded-2xl w-[90%]">
        <Text className="text-xl font-bold mb-4">Create Study Schedule</Text>
        <TextInput
          placeholder="Enter subject"
          className="border p-3 rounded-lg mb-3"
          value={subject}
          onChangeText={setSubject}
        />

        <TextInput
          placeholder="Enter topic"
          className="border p-3 rounded-lg mb-3"
          value={topic}
          onChangeText={setTopic}
        />

        <View className="flex-row justify-between mb-3">
          <TouchableOpacity
            className="flex-1 border p-3 rounded-lg mr-2 bg-gray-100"
            onPress={() => setShowDatePicker(true)}
          >
            <Text className="text-gray-700">
              {`📅 Select Date: ${date.toDateString()}`}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-1 border p-3 rounded-lg ml-2 bg-gray-100"
            onPress={() => setShowTimePicker(true)}
          >
            <Text className="text-gray-700">
              {`⏰ Select Time: ${date.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}`}
            </Text>
          </TouchableOpacity>
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setShowDatePicker(false);
              if (selectedDate) setDate(selectedDate);
            }}
          />
        )}

        {showTimePicker && (
          <DateTimePicker
            value={date}
            mode="time"
            display="default"
            onChange={(event, selectedTime) => {
              setShowTimePicker(false);
              if (selectedTime) setDate(selectedTime);
            }}
          />
        )}

        <View className="flex-row justify-between mt-4">
          <TouchableOpacity onPress={onClose} className="px-4 py-2">
            <Text className="text-gray-500 font-medium">Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleSave}
            disabled={isSaveDisabled}
            className={`px-4 py-2 rounded-lg ${
              isSaveDisabled ? "bg-gray-400" : "bg-indigo-600"
            }`}
          >
            <Text className="text-white font-medium text-center">Save</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
