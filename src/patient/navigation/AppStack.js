import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import PatientHomeScreen from '../screens/PatientHomeScreen'; 
import PatientHistoryScreen from '../screens/PatientHistoryScreen';
import PatientProfileScreen from '../screens/PatientProfileScreen';
import ChatScreen from '../../shared/screens/ChatScreen';
import ProfessionalDetailScreen from '../screens/ProfessionalDetailScreen'
import BookAppointmentScreen from '../screens/BookAppointmentScreen';
import PatientLogScreen from '../screens/PatientLogScreen';
import RatingScreen from '../screens/RatingScreen';
import ChatListScreen from '../../shared/screens/ChatListScreen';

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
        <Stack.Screen name="ProfessionalDetail" 
      component={ProfessionalDetailScreen} 
      options={{ headerShown: false }} />
      <Stack.Screen 
        name="BookAppointment" 
        component={BookAppointmentScreen} 
        options={{ headerShown: false }} 
      />
        <Stack.Screen 
        name="PatientLog" 
        component={PatientLogScreen} 
        options={{ headerShown: false }} 
      />
        <Stack.Screen 
        name="Rating" 
        component={RatingScreen} 
        options={{ headerShown: false }} 
      />
        <Stack.Screen
        name="ChatList"
        component={ChatListScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
    
  );
};

export default AppStack;