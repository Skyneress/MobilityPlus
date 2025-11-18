import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { collection, query, orderBy, getDocs } from "firebase/firestore";
import { db } from "../../config/firebaseConfig";
import { useAuth } from "../../context/AuthContext";

const PRIMARY_COLOR = "#3A86FF";
const TEXT_DARK = "#1F2937";
const GRAY_ACCENT = "#E5E7EB";

// --- Componente para una entrada de la bitácora (MEJORADO) ---
const LogEntryCard = ({ log, navigation }) => {
  // Función para formatear la fecha y hora
  const formatDateTime = (timestamp) => {
    if (!timestamp) return "Fecha no disponible";
    // Usamos toLocaleString para obtener fecha y hora
    return timestamp.toDate().toLocaleString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleChat = () => {
    if (log.enfermeroUid) {
      navigation.navigate("Chat", {
        chatWithUser: {
          id: log.enfermeroUid,
          name: log.enfermeroNombre,
          role: "Profesional",
        },
      });
    } else {
      Alert.alert("Error", "ID de profesional no encontrado.");
    }
  };

  return (
    <View className="bg-white p-4 rounded-xl shadow-lg mb-4 border border-gris-acento">
      {/* 1. Título y Profesional */}
      <View className="flex-row justify-between items-start mb-3 border-b border-gris-acento/50 pb-3">
        <View className="flex-row items-center flex-1">
          <Ionicons
            name="bandage-outline"
            size={24}
            color={PRIMARY_COLOR}
            className="mr-2"
          />
          <View className="flex-1">
            <Text className="text-sm text-gray-500">
              {formatDateTime(log.createdAt)}
            </Text>
            <Text className="text-lg font-bold text-texto-oscuro">
              {log.tipoServicio}
            </Text>
          </View>
        </View>
      </View>

      {/* 2. Notas Clínicas */}
      <View className="bg-gray-50 p-3 rounded-lg border border-gris-acento/70 mb-4">
        <Text className="text-base font-semibold text-az-primario mb-2">
          Notas de la Sesión:
        </Text>
        <Text className="text-sm text-gray-700 leading-5 italic">
          {log.notasClinicas ||
            "El profesional no dejó notas clínicas para esta visita."}
        </Text>
      </View>

      {/* 3. Información del Profesional y Chat */}
      <View className="flex-row justify-between items-center pt-2">
        <View>
          <Text className="text-sm text-gray-500">Atendido por:</Text>
          <Text className="text-base font-semibold text-texto-oscuro">
            {log.enfermeroNombre}
          </Text>
        </View>

        <TouchableOpacity
          className="flex-row items-center bg-az-primario/10 px-4 py-2 rounded-full"
          onPress={handleChat}
          disabled={!log.enfermeroUid}
        >
          <Ionicons
            name="chatbubbles-outline"
            size={18}
            color={PRIMARY_COLOR}
          />
          <Text className="text-az-primario text-sm font-semibold ml-2">
            Contactar
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const PatientLogScreen = ({ navigation }) => {
  const { userId } = useAuth(); // Obtenemos el ID del paciente logueado
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const fetchLogs = async () => {
      if (!userId) return;

      try {
        // Consultamos la sub-colección "bitacora" dentro del documento del usuario
        const logRef = collection(db, "users", userId, "bitacora");
        // Ordenamos por fecha (de más reciente a más antiguo)
        const q = query(logRef, orderBy("createdAt", "desc"));

        const querySnapshot = await getDocs(q);
        const logList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setLogs(logList);
      } catch (error) {
        console.error("Error al cargar la bitácora: ", error);
        Alert.alert("Error", "No se pudo cargar tu historial clínico.");
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [userId]);

  return (
    <SafeAreaView className="flex-1 bg-fondo-claro">
      {/* 🧭 Encabezado Superior (Header) */}
      <View className="flex-row items-center px-4 py-5 bg-az-primario rounded-b-lg shadow-md">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back-outline" size={28} color="#FFFFFF" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-texto-claro ml-4">
          Mi Bitácora Clínica
        </Text>
      </View>

      <ScrollView className="flex-1 p-4">
        {loading ? (
          <ActivityIndicator
            size="large"
            color={PRIMARY_COLOR}
            className="mt-10"
          />
        ) : logs.length === 0 ? (
          <View className="p-4 bg-white rounded-lg items-center mt-4 shadow-sm">
            <Text className="text-gray-500 text-center">
              Tu bitácora está vacía. Las notas clínicas aparecerán aquí después
              de tus citas completadas.
            </Text>
          </View>
        ) : (
          logs.map((log) => (
            <LogEntryCard key={log.id} log={log} navigation={navigation} />
          ))
        )}
      </ScrollView>

      {/* Barra de Navegación Inferior (Tab Bar) - La mantenemos consistente */}
      <View className="flex-row justify-around items-center bg-white border-t border-gris-acento pt-2 pb-4 shadow-xl">
        <TouchableOpacity
          className="items-center"
          onPress={() => navigation.navigate("PatientHome")}
        >
          <Ionicons name="home-outline" size={24} color="#9ca3af" />
          <Text className="text-gray-400 text-xs">Home</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="items-center"
          onPress={() => navigation.navigate("PatientHistory")}
        >
          <Ionicons name="calendar-outline" size={24} color="#9ca3af" />
          <Text className="text-gray-400 text-xs">Citas</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="items-center"
          onPress={() => navigation.navigate("ChatList")}
        >
          <Ionicons name="chatbubbles-outline" size={24} color="#9ca3af" />
          <Text className="text-gray-400 text-xs">Mensajes</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="items-center"
          onPress={() => navigation.navigate("PatientProfile")}
        >
          <Ionicons name="person-outline" size={24} color="#9ca3af" />
          <Text className="text-gray-400 text-xs">Perfil</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default PatientLogScreen;
