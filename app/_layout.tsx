/**
 * RootLayout.tsx
 * 
 * Componente raíz de la aplicación que define la estructura base
 * 
 * Funcionalidades:
 * - Inicializa la lógica de notificaciones
 * - Configura la navegación global
 * - Define opciones comunes para todas las pantallas
 * 
 * @version 1.1.0
 */

import { Stack } from "expo-router";
import NotificationLogic from "../App";

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
        {/* Pantalla principal de la aplicación */}
        <Stack.Screen name="index" />
      </Stack>
    </>
  );
}