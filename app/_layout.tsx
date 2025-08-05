import { Stack } from "expo-router";
import NotificationLogic from "../App"; // Ajusta la ruta según sea necesario

export default function RootLayout() {
  return (
    <>
      <NotificationLogic />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "#fff" },
          animation: "none",
        }}
      >
        <Stack.Screen name="index" />
      </Stack>
    </>
  );
}