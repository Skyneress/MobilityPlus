import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { ActivityIndicator, View, Text } from 'react-native';
// 1. Importamos el Contexto de Auth y el Hook
import { AuthProvider, useAuth } from './src/context/AuthContext'; 
// Importamos los Stacks
import AuthStack from './src/auth/navigation/AuthStack';
import PatientAppStack from './src/patient/navigation/AppStack'; 
import NurseAppStack from './src/nurse/navigation/NurseStack';   
import "./global.css";

// 2. Importante: Asegurarse de que firebaseConfig se inicialice ANTES que todo
// Esta línea ejecuta el código de firebaseConfig.js
import './src/config/firebaseConfig'; 


// Componente Router que AHORA SÍ lee el estado real de AuthContext
const RootNavigator = () => {
  // 3. Leemos los valores REALES del Contexto (ya no son simulados)
  const { isAuthenticated, role, loading } = useAuth();
  
  // 4. Muestra un "cargando" mientras Firebase Auth se inicializa
  // (Esto evita el "parpadeo" de la pantalla de login)
  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-fondo-claro">
        <ActivityIndicator size="large" color="#3A86FF" />
        <Text className="mt-4 text-texto-oscuro">Cargando aplicación...</Text>
      </View>
    );
  }

  // 5. Si NO está autenticado, muestra el Login
  if (!isAuthenticated) {
    return <AuthStack />;
  }

  // 6. Si SÍ está autenticado, elige el Stack basado en el rol de Firestore
  switch (role) {
    case 'patient':
      return <PatientAppStack />; 
      
    case 'nurse':
      return <NurseAppStack />;
      
    default:
      // Caso de error (Usuario logueado pero sin rol en Firestore)
      return (
        <View className="flex-1 justify-center items-center bg-error-rojo/10 p-10">
          <Text className="text-xl font-bold text-error-rojo text-center">
            Error: Rol de usuario no asignado.
          </Text>
          <Text className="text-sm text-gray-600 mt-2">
            (Asegúrate de que el documento en la colección "users" tenga un campo "role".)
          </Text>
        </View>
      );
  }
};

// 7. El componente App AHORA ENVUELVE todo en el AuthProvider
export default function App() {
  return (
    <AuthProvider> 
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}