import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import PatientHomeScreen from '../screens/PatientHomeScreen'; 
import PatientHistoryScreen from '../screens/PatientHistoryScreen';
import PatientProfileScreen from '../screens/PatientProfileScreen';
import ChatScreen from '../../shared/screens/ChatScreen';
// Importa las demás pantallas del paciente aquí (Perfil, Historial, etc.)

const Stack = createNativeStackNavigator();

const AppStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="PatientHome" 
      component={PatientHomeScreen} 
      options={{ headerShown: false }} />
      {/* Otras pantallas del paciente */}
      <Stack.Screen
        name="PatientHistory"
        component={PatientHistoryScreen}
        options={{ title: "Citas", headerShown: false }}
      />
      <Stack.Screen
        name="PatientProfile"
        component={PatientProfileScreen}
        options={{ title: "Perfil", headerShown: false }}
      />
      <Stack.Screen
        name="Chat"
        component={ChatScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
    
  );
};

export default AppStack;