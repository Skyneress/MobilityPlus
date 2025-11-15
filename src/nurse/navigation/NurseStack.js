import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import NurseHomeScreen from "../screens/NurseHomeScreen";
import NurseScheduleScreen from "../screens/NurseScheduleScreen";
import NurseProfileScreen from "../screens/NurseProfileScreen";
import JobDetailScreen from "../screens/JobDetailScreen";
import NurseEarningsScreen from "../screens/NurseEarningsScreen";
import ChatScreen from "../../shared/screens/ChatScreen";

const Stack = createNativeStackNavigator();

const NurseStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="NurseHome"
        component={NurseHomeScreen}
        options={{ title: "Disponibilidad", headerShown: false }}
      />
      {/* Aquí irían las pantallas específicas del enfermero (Perfil, Mapa, Notificaciones) */}
      <Stack.Screen
        name="NurseSchedule"
        component={NurseScheduleScreen}
        options={{ title: "Mi Agenda", headerShown: false }}
      />
      <Stack.Screen
        name="NurseProfile"
        component={NurseProfileScreen}
        options={{ title: "Mi Perfil", headerShown: false }}
      />

      <Stack.Screen
        name="JobDetail"
        component={JobDetailScreen}
        options={{ title: "Detalles de trabajo", headerShown: false }}
      />
      <Stack.Screen
        name="NurseEarnings"
        component={NurseEarningsScreen}
        options={{ title: "Ganancias", headerShown: false }}
      />
      <Stack.Screen
        name="Chat"
        component={ChatScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

export default NurseStack;
