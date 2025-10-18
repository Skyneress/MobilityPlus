import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import PatientHomeScreen from '../screens/PatientHomeScreen'; 
// Importa las demás pantallas del paciente aquí (Perfil, Historial, etc.)

const Stack = createNativeStackNavigator();

const AppStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="PatientHome" component={PatientHomeScreen} options={{ headerShown: false }} />
      {/* Otras pantallas del paciente */}
    </Stack.Navigator>
  );
};

export default AppStack;