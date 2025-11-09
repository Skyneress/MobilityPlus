import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    // Aquí puedes agregar tu lógica de autenticación real
    if (email === "test@example.com" && password === "password") {
      Alert.alert("Éxito", "Inicio de sesión exitoso!");
      navigation.replace("Home"); // 👈 navega a Home
    } else {
      Alert.alert("Error", "Correo o contraseña incorrectos.");
    }
  };

  return (
    <View className="flex-1 bg-fondo-claro px-6 justify-center">
      {/* Logo */}
      <View className="items-center mb-8">
        <View className="w-20 h-20 rounded-full bg-gris-acento items-center justify-center mb-4">
          <Text className="text-az-primario text-2xl font-bold">🧭</Text>
        </View>
        <Text className="text-2xl font-bold text-texto-oscuro">
          Mobility <Text className="text-az-primario">Plus</Text>
        </Text>
        <Text className="text-gray-500 mt-1">
          Una aplicación para tu bienestar
        </Text>
      </View>

      {/* Form */}
      <View className="space-y-4">
        <View>
          <Text className="text-texto-oscuro mb-1">Email</Text>
          <TextInput
            className="w-full border border-gris-acento rounded-lg px-4 py-3 text-texto-oscuro bg-fondo-claro"
            placeholder="your.email@example.com"
            placeholderTextColor="#9ca3af"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        <View>
          <Text className="text-texto-oscuro mb-1">Password</Text>
          <TextInput
            className="w-full border border-gris-acento rounded-lg px-4 py-3 text-texto-oscuro bg-fondo-claro"
            placeholder="••••••••"
            placeholderTextColor="#9ca3af"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
        </View>

        <TouchableOpacity
          className="bg-az-primario rounded-full py-4 mt-2 shadow-md"
          onPress={handleLogin}
        >
          <Text className="text-texto-claro text-center text-base font-semibold">
            Iniciar Sesión
          </Text>
        </TouchableOpacity>
      </View>

      {/* Divider */}
      <Text className="text-center text-gray-500 my-6">o continúa con</Text>

      {/* Social login */}
      <View className="flex-row justify-center space-x-4">
        <TouchableOpacity className="flex-1 border border-gris-acento rounded-lg py-3 items-center">
          <Text className="text-texto-oscuro">Google</Text>
        </TouchableOpacity>
        <TouchableOpacity className="flex-1 border border-gris-acento rounded-lg py-3 items-center">
          <Text className="text-texto-oscuro">Facebook</Text>
        </TouchableOpacity>
      </View>

      {/* Links */}
      <View className="items-center mt-6">
        <TouchableOpacity>
          <Text className="text-az-primario">¿Olvidaste tu contraseña?</Text>
        </TouchableOpacity>
      </View>

      <View className="flex-row justify-center mt-4">
        <Text className="text-gray-500">¿No tienes una cuenta? </Text>
        <TouchableOpacity onPress={() => navigation.navigate("Register")}>
          <Text className="text-az-primario font-medium">Registrarse</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}