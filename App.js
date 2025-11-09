import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Text, View } from 'react-native'; // Importamos 'Text' y 'View' para el manejo de errores
import AuthStack from './src/auth/navigation/AuthStack';
import PatientAppStack from './src/patient/navigation/AppStack'; // Renombrado de 'AppStack' a 'PatientAppStack'
import NurseAppStack from './src/nurse/navigation/NurseStack';   // ¡Nueva importación para el Enfermero!
import "./global.css";

// ⚠️ SIMULACIÓN DE ESTADO DE AUTENTICACIÓN Y ROL ⚠️
// En una aplicación real, estas variables se manejarían con React Context o Redux,
// y se actualizarían con los datos recibidos del inicio de sesión.
const isAuthenticated = true; // true = Muestra la app | false = Muestra Login/Registro
const userRole = 'nurse'; // Define el rol: 'patient' o 'nurse'

// Componente que decide qué Stack de navegación mostrar (EL ROUTER)
const RootNavigator = () => {
  // 1. Si NO está autenticado, muestra la pantalla de autenticación
  if (!isAuthenticated) {
    return <AuthStack />;
  }

  // 2. Si SÍ está autenticado, elige el Stack basado en el rol
  switch (userRole) {
    case 'patient':
      // Si es paciente, carga la navegación del paciente
      return <PatientAppStack />; 
      
    case 'nurse':
      // Si es enfermero, carga la navegación del enfermero
      return <NurseAppStack />;
      
    default:
      // Caso de error si el rol es desconocido
      return (
        <View className="flex-1 justify-center items-center bg-error-rojo/10 p-10">
          <Text className="text-xl font-bold text-error-rojo text-center">
            Error Crítico: Rol de usuario no reconocido.
          </Text>
          <Text className="text-sm text-gray-600 mt-2">
            Por favor, cierra e inicia sesión nuevamente o contacta a soporte.
          </Text>
        </View>
      );
  }
};

export default function App() {
  return (
    <NavigationContainer>
      <RootNavigator />
    </NavigationContainer>
  );
}