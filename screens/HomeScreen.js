import { View, Text, TouchableOpacity } from "react-native";
import "../global.css";

export default function HomeScreen({ navigation }) {
  return (
    <View className="flex-1 items-center justify-center bg-blue-50">
      <Text className="text-3xl font-bold text-blue-700 mb-4">
        Bienvenido a Mobility Plus 🚗✨
      </Text>

      <TouchableOpacity
        className="bg-red-500 px-6 py-3 rounded-full mt-4"
        onPress={() => navigation.replace("Login")}
      >
        <Text className="text-white font-semibold">Cerrar sesión</Text>
      </TouchableOpacity>
    </View>
  );
}
