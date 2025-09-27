import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';

export default function RegisterScreen({ navigation }) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = () => {
    // Aquí iría la lógica de registro
    Alert.alert('Éxito', 'Registro de usuario exitoso.');
    // navigation.replace("Home"); // Navega a la pantalla principal al registrarse
  };

  return (
    <View className="flex-1 bg-fondo-claro px-6 justify-center">
      <Text className="text-2xl font-bold text-az-primario mb-6 text-center">
        Crear cuenta
      </Text>

      <View className="space-y-4">
        <TextInput
          className="w-full border border-gris-acento rounded-lg px-4 py-3 bg-fondo-claro text-texto-oscuro"
          placeholder="Nombre completo"
          placeholderTextColor="#9ca3af"
          value={fullName}
          onChangeText={setFullName}
        />
        <TextInput
          className="w-full border border-gris-acento rounded-lg px-4 py-3 bg-fondo-claro text-texto-oscuro"
          placeholder="Correo electrónico"
          placeholderTextColor="#9ca3af"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          className="w-full border border-gris-acento rounded-lg px-4 py-3 bg-fondo-claro text-texto-oscuro"
          placeholder="Contraseña"
          placeholderTextColor="#9ca3af"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
      </View>

      <TouchableOpacity
        className="bg-az-primario rounded-full py-4 mt-6"
        onPress={handleRegister}
      >
        <Text className="text-texto-claro text-center font-semibold text-base">
          Registrarse
        </Text>
      </TouchableOpacity>

      <View className="flex-row justify-center mt-4">
        <Text className="text-gray-500">¿Ya tienes cuenta? </Text>
        <TouchableOpacity onPress={() => navigation.navigate("Login")}>
          <Text className="text-az-primario font-medium">Inicia sesión</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}