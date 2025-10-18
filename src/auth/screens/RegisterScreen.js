// screens/RegisterScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, Switch } from 'react-native';

export default function RegisterScreen({ navigation }) {
  const [isNurse, setIsNurse] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [specialty, setSpecialty] = useState('');

  const handleRegister = () => {
    // Aquí iría tu lógica de registro
    if (isNurse && (!licenseNumber || !specialty)) {
      Alert.alert('Error', 'Por favor, completa todos los campos del enfermero.');
      return;
    }
    Alert.alert('Éxito', 'Registro de usuario exitoso.');
  };

  return (
    <View className="flex-1 bg-fondo-claro px-6 justify-center">
      <Text className="text-2xl font-bold text-az-primario mb-6 text-center">
        Crear cuenta
      </Text>

      {/* Tipo de Usuario */}
      <View className="flex-row items-center justify-center mb-6">
        <Text className="text-gray-500 mr-2">¿Eres un enfermero?</Text>
        <Switch
          onValueChange={setIsNurse}
          value={isNurse}
          trackColor={{ false: "#E5E7EB", true: "#4CAF50" }}
          thumbColor={isNurse ? "#FFFFFF" : "#F3F4F6"}
        />
      </View>

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

        {/* Campos adicionales para enfermero */}
        {isNurse && (
          <View className="space-y-4">
            <TextInput
              className="w-full border border-gris-acento rounded-lg px-4 py-3 bg-fondo-claro text-texto-oscuro"
              placeholder="Número de licencia"
              placeholderTextColor="#9ca3af"
              value={licenseNumber}
              onChangeText={setLicenseNumber}
            />
            <TextInput
              className="w-full border border-gris-acento rounded-lg px-4 py-3 bg-fondo-claro text-texto-oscuro"
              placeholder="Especialidad (ej. Geriátrica, Pediátrica)"
              placeholderTextColor="#9ca3af"
              value={specialty}
              onChangeText={setSpecialty}
            />
          </View>
        )}
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