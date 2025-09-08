import { View, Text, TextInput, TouchableOpacity } from "react-native";
import "../global.css";

export default function LoginScreen({ navigation }) {
  return (
    <View className="flex-1 bg-white px-6 justify-center">
      {/* Logo */}
      <View className="items-center mb-8">
        <View className="w-20 h-20 rounded-full bg-blue-100 items-center justify-center mb-4">
          <Text className="text-blue-600 text-2xl font-bold">🧭</Text>
        </View>
        <Text className="text-2xl font-bold text-blue-700">
          Mobility <Text className="text-green-500">PLUS</Text>
        </Text>
        <Text className="text-gray-500 mt-1">
          Una aplicación para tu bienestar
        </Text>
      </View>

      {/* Form */}
      <View className="space-y-4">
        <View>
          <Text className="text-gray-700 mb-1">Email</Text>
          <TextInput
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-800"
            placeholder="your.email@example.com"
            placeholderTextColor="#9ca3af"
            keyboardType="email-address"
          />
        </View>

        <View>
          <Text className="text-gray-700 mb-1">Password</Text>
          <TextInput
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-800"
            placeholder="••••••••"
            placeholderTextColor="#9ca3af"
            secureTextEntry
          />
        </View>

        <TouchableOpacity
          className="bg-blue-500 rounded-full py-4 mt-2"
          onPress={() => navigation.replace("Home")} // 👈 navega a Home
        >
          <Text className="text-white text-center text-base font-semibold">
            Iniciar Sesión
          </Text>
        </TouchableOpacity>
      </View>

      {/* Divider */}
      <Text className="text-center text-gray-500 my-6">o continua con</Text>

      {/* Social login */}
      <View className="flex-row justify-center space-x-4">
        <TouchableOpacity className="flex-1 border border-gray-300 rounded-lg py-3 items-center">
          <Text className="text-gray-700">Google</Text>
        </TouchableOpacity>
        <TouchableOpacity className="flex-1 border border-gray-300 rounded-lg py-3 items-center">
          <Text className="text-gray-700">Facebook</Text>
        </TouchableOpacity>
      </View>

      {/* Links */}
      <View className="items-center mt-6">
        <TouchableOpacity>
          <Text className="text-blue-600">Olvidaste tu contraseña?</Text>
        </TouchableOpacity>
      </View>

      <View className="flex-row justify-center mt-4">
        <Text className="text-gray-500">No tienes una cuenta? </Text>
        <TouchableOpacity onPress={() => navigation.navigate("Register")}>
          {/* 👆 ahora navega al Register */}
          <Text className="text-blue-600 font-medium">Registrarse</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
