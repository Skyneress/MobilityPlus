import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Alert, 
  SafeAreaView, 
  ActivityIndicator, 
  ScrollView 
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth'; // Importamos la función de Login
import { auth } from '../../config/firebaseConfig'; // Importamos el servicio de Auth

// Colores definidos en tu tailwind.config.js
const PRIMARY_COLOR = "#3A86FF"; 
const TEXT_DARK = "#1F2937";
const PLACEHOLDER_COLOR = "#9ca3af";

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false); // Estado para el indicador de carga

  const handleLogin = async () => {
    // 1. Validar que los campos no estén vacíos
    if (!email || !password) {
      Alert.alert('Campos vacíos', 'Por favor, introduce tu correo y contraseña.');
      return;
    }

    setLoading(true);

    try {
      // 2. Iniciar sesión con Firebase Auth
      await signInWithEmailAndPassword(auth, email, password);
      
      // 3. ¡Éxito!
      // No necesitamos navegar manualmente (ej. navigation.navigate('Home')).
      // El 'AuthContext' detectará el inicio de sesión automáticamente
      // y el 'RootNavigator' en App.js hará el resto.

    } catch (error) {
      // 4. Manejo de Errores
      console.error("Error en el inicio de sesión:", error.code);
      let message = 'Ocurrió un error al iniciar sesión.';
      
      // Códigos de error comunes de Firebase Auth
      if (error.code === 'auth/user-not-found' || 
          error.code === 'auth/wrong-password' || 
          error.code === 'auth/invalid-credential') {
          message = 'Correo electrónico o contraseña incorrectos.';
      } else if (error.code === 'auth/invalid-email') {
          message = 'El formato del correo es inválido.';
      } else if (error.code === 'auth/network-request-failed') {
          message = 'Error de red. Revisa tu conexión a internet.';
      } else if (error.code === 'auth/too-many-requests') {
          message = 'Has intentado iniciar sesión demasiadas veces. Inténtalo más tarde.';
      }

      Alert.alert('Error', message);
    } finally {
      // 5. Quitar el indicador de carga
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-fondo-claro">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="px-6">
        <View className="flex-1 justify-center">
            
            {/* Logo y Título */}
            <View className="items-center mb-10">
              <View className="w-20 h-20 rounded-full bg-gris-acento items-center justify-center mb-4">
                <Ionicons name="compass-outline" size={40} color={PRIMARY_COLOR} />
              </View>
              <Text className="text-4xl font-bold text-texto-oscuro text-center">
                Mobility <Text className="text-az-primario">PLUS</Text>
              </Text>
              <Text className="text-lg text-gray-600 mt-2 text-center">
                Bienvenido de vuelta
              </Text>
            </View>

            {/* Formulario */}
            <View className="space-y-4">
              <View>
                <Text className="text-texto-oscuro mb-1 font-medium">Email</Text>
                <TextInput
                  className="w-full border border-gris-acento rounded-lg px-4 py-3 bg-white text-texto-oscuro"
                  placeholder="tu.correo@ejemplo.com"
                  placeholderTextColor={PLACEHOLDER_COLOR}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                  editable={!loading} // No editable mientras carga
                />
              </View>

              <View>
                <Text className="text-texto-oscuro mb-1 font-medium">Contraseña</Text>
                <TextInput
                  className="w-full border border-gris-acento rounded-lg px-4 py-3 bg-white text-texto-oscuro"
                  placeholder="••••••••"
                  placeholderTextColor={PLACEHOLDER_COLOR}
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                  editable={!loading} // No editable mientras carga
                />
              </View>

              <TouchableOpacity
                className="bg-az-primario rounded-full py-4 mt-6 flex-row justify-center items-center shadow-md"
                onPress={handleLogin}
                disabled={loading} // Deshabilita el botón mientras carga
              >
                {loading ? (
                  // Muestra el indicador si está cargando
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  // Muestra el texto si no está cargando
                  <Text className="text-texto-claro text-center font-semibold text-base">
                    Iniciar Sesión
                  </Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Links inferiores */}
            <View className="items-center mt-6">
              <TouchableOpacity onPress={() => Alert.alert('Recuperar', 'Implementar flujo de recuperación de contraseña.')}>
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
      </ScrollView>
    </SafeAreaView>
  );
};

export default LoginScreen;