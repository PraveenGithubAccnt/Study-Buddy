import { Stack } from "expo-router";

export default function Layout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="loginscreen" />
      <Stack.Screen name="registerscreen" />
    </Stack>
  );
}
