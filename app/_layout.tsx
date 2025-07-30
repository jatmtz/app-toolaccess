import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#fff" },
        animation: "none",
      }}
    >
      <Stack.Screen name="index" />
    </Stack>
  );
}
