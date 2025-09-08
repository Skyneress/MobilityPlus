import { View, Text, TextInput, TouchableOpacity } from "react-native";
import "../global.css";

export default function RegisterScreen({ navigation }) {
  return (
    <View className="flex-1 bg-white px-6 justify-center">
      <Text className="text-2xl font-bold text-blue-700 mb-6 text-center">
        Crear cuenta
      </Text>

      <View className="space-y-4">
        <TextInput
          className="w-full border border-gray-300 rounded-lg px-4 py-3"
          placeholder="Nombre completo"
          placeholderTextColor="#9ca3af"
        />
        <TextInput
          className="w-full border border-gray-300 rounded-lg px-4 py-3"
          placeholder="Correo electrónico"
          placeholderTextColor="#9ca3af"
          keyboardType="email-address"
        />
        <TextInput
          className="w-full border border-gray-300 rounded-lg px-4 py-3"
          placeholder="Contraseña"
          placeholderTextColor="#9ca3af"
          secureTextEntry
        />
      </View>

      <TouchableOpacity
        className="bg-green-600 rounded-full py-4 mt-6"
        onPress={() => navigation.replace("Home")}
      >
        <Text className="text-white text-center font-semibold text-base">
          Registrarse
        </Text>
      </TouchableOpacity>

      <View className="flex-row justify-center mt-4">
        <Text className="text-gray-500">¿Ya tienes cuenta? </Text>
        <TouchableOpacity onPress={() => navigation.navigate("Login")}>
          <Text className="text-blue-600 font-medium">Inicia sesión</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
