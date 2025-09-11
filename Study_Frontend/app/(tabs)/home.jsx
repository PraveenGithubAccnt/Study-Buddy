import { useEffect, useState } from "react";
import { ScrollView, ActivityIndicator, View, Alert } from "react-native";
import { isAuthenticated } from "../../api/firebaseauth";
import { createSchedule, getUpcomingTasks } from "../../api/schedulefetch";
import { registerForPushNotificationsAsync, scheduleTaskNotification } from "../../api/notification";

import { useRouter } from "expo-router";
import Header from "../../components/homeheader";
import ProgressCard from "../../components/homeprogresscard";
import QuickActions from "../../components/homequickactionbtn";
import UpcomingTasks from "../../components/homeupcomingtsk";
import StudyScheduleForm from "../../components/homeschedule";

export default function Home() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
   const router = useRouter();
  // --- State for tasks ---
  const [tasks, setTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(true);

  // ✅ Request notification permissions on mount
  useEffect(() => {
    registerForPushNotificationsAsync();
  }, []);

  // ✅ Fetch user and initial tasks
  useEffect(() => {
    const initialize = async () => {
      const result = await isAuthenticated();
      if (result.isAuth) {
        setUser(result.user);
        await fetchTasks(); // Fetch tasks after user is confirmed
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    initialize();
  }, []);

  // --- Function to fetch tasks from your backend ---
  const fetchTasks = async () => {
    setTasksLoading(true);
    try {
      const upcomingTasks = await getUpcomingTasks();
      setTasks(upcomingTasks);
    } catch (error) {
      console.error("❌ Failed to fetch tasks on Home screen:", error);
      Alert.alert("Error", "Could not load your tasks.");
    } finally {
      setTasksLoading(false);
    }
  };

  const handleActionPress = (action) => {
    if (action === "Create Schedule") 
      {
      setShowForm(true);
    } 
     else if (action === "AI Doubt Solver") {
    router.push("/aidoubtsolver"); 
  } 
    else if (action === "Find Notes & Videos") 
      { router.push("/study"); 
  } else if (action === "Take Quiz") {
    router.push("/aiquiz");
   } 
else {
    console.log("Action pressed:", action);
    }
  };

// ✅ Updated handleSaveSchedule function for home.jsx
const handleSaveSchedule = async (formData) => {
  try {
    // The `date` object from the form contains both date and time
    const scheduleData = {
      subject: formData.subject,
      topic: formData.topic,
      // Format date to YYYY-MM-DD
      date: formData.date.toISOString().split("T")[0],
      // Format time to HH:MM
      time: formData.date.toTimeString().split(" ")[0].substring(0, 5),
      description: "", 
      priority: "medium",
    };

    // Save to backend
    const savedTask = await createSchedule(scheduleData);

    Alert.alert("✅ Success!", "Your schedule has been saved.");
    setShowForm(false);
    await fetchTasks(); 
    // Schedule notification
    await scheduleTaskNotification({
      id: savedTask?.id, // Include task ID if available
      subjectName: scheduleData.subject,
      topic: scheduleData.topic,
      date: scheduleData.date,
      time: scheduleData.time,
    });

    console.log("📝 Task saved and notification scheduled:", scheduleData);

  } catch (error) {
    console.error("🔥 Error saving schedule:", error);
    Alert.alert("❌ Error", error.message || "Something went wrong.");
  }
};

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-100 p-4">
      <Header user={user} />
      <ProgressCard progress={0.75} />
      <QuickActions onActionPress={handleActionPress} />
      
      {/* 👇 Pass tasks, loading state, and the refresh function as props */}
      <UpcomingTasks 
        tasks={tasks} 
        loading={tasksLoading} 
        onTaskUpdate={fetchTasks} 
      />

      <StudyScheduleForm
        visible={showForm}
        onClose={() => setShowForm(false)}
        onSave={handleSaveSchedule}
      />
    </ScrollView>
  );
}