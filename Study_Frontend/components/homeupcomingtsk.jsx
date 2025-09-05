import { View, Text, ActivityIndicator, Alert } from "react-native";
import { Checkbox } from "expo-checkbox";
import { markScheduleCompleted } from "../api/schedulefetch";

export default function UpcomingTasks({ tasks, loading, onTaskUpdate }) {

  const handleComplete = async (scheduleId) => {
    // This check prevents the API call if the ID is somehow still undefined
    if (!scheduleId) {
      console.error("🔥 Attempted to complete a task with no ID.");
      Alert.alert("Error", "Cannot update a task with a missing ID.");
      return;
    }

    try {
      await markScheduleCompleted(scheduleId);
      Alert.alert("Great job!", "Task marked as complete.");
      if (onTaskUpdate) {
        onTaskUpdate(); 
      }
    } catch (err) {
      console.error("🔥 Error completing task:", err);
      Alert.alert("Error", "Could not update the task.");
    }
  };

  if (loading) {
    return (
      <View className="bg-white p-4 rounded-xl shadow-md mb-4 items-center justify-center min-h-[100px]">
        <ActivityIndicator size="small" color="#4F46E5" />
        <Text className="text-gray-500 mt-2">Loading tasks...</Text>
      </View>
    );
  }

  return (
    <View className="bg-white p-4 rounded-xl shadow-md mb-4">
      <Text className="text-lg font-semibold mb-3">Upcoming Tasks</Text>

      {tasks.length === 0 ? (
        <Text className="text-gray-500 text-center py-4">No upcoming tasks. Time to schedule! 🎉</Text>
      ) : (
        tasks.map((task, index) => {
          const displayDate = new Date(`${task.date}T${task.time}:00`).toLocaleString([], {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          });

          return (
            // 👇 Using task.id for the key for consistency
            <View key={task.id || `task-${index}`} className="flex-row items-center mb-3 p-2 border-b border-gray-100">
              <Checkbox
                value={task.status === 'completed'}
                // 👇 FIX: Pass task.id instead of task._id
                onValueChange={() => handleComplete(task.id)}
                color={task.status === 'completed' ? "#4ade80" : "#4F46E5"}
              />
              <View className="ml-3 flex-1">
                <Text className="text-base font-medium capitalize">
                  {task.subject || "Untitled"} 
                </Text>
                {task.topic && (
                  <Text className="text-gray-500 text-sm capitalize">
                    {task.topic}
                  </Text>
                )}
                <Text className="text-gray-500 text-sm mt-1">
                  {displayDate}
                </Text>
              </View>
            </View>
          );
        })
      )}
    </View>
  );
}

