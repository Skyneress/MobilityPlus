import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import NurseHomeScreen from '../screens/NurseHomeScreen';

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
    </Stack.Navigator>
  );
};

export default NurseStack;
