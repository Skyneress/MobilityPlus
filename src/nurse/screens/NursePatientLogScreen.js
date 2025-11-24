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

const PRIMARY_COLOR = "#3A86FF";
const TEXT_DARK = "#1F2937";
const GRAY_ACCENT = "#E5E7EB";

// --- Componente para una entrada de la bitácora (Reutilizado) ---
const LogEntryCard = ({ log }) => {
  const formatDateTime = (timestamp) => {
    if (!timestamp) return "Fecha no disponible";
    return timestamp.toDate().toLocaleString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <View className="bg-white p-4 rounded-xl shadow-md mb-4 border border-gris-acento">
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

      <View className="bg-gray-50 p-3 rounded-lg border border-gris-acento/70 mb-4">
        <Text className="text-base font-semibold text-az-primario mb-2">
          Notas de la Sesión (por {log.enfermeroNombre}):
        </Text>
        <Text className="text-sm text-gray-700 leading-5 italic">
          {log.notasClinicas || "Sin notas clínicas registradas."}
        </Text>
      </View>
    </View>
  );
};

const NursePatientLogScreen = ({ navigation, route }) => {
  // 💡 OBTIENE LOS PARÁMETROS DEL PACIENTE DESDE JobDetailScreen
  const { patientUid, patientName } = route.params;

  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const fetchLogs = async () => {
      if (!patientUid) {
        setLoading(false);
        Alert.alert("Error", "ID de paciente no encontrado.");
        return;
      }

      try {
        // CONSULTA CRUCIAL: /users/{patientUid}/bitacora/
        const logRef = collection(db, "users", patientUid, "bitacora");
        const q = query(logRef, orderBy("createdAt", "desc"));

        const querySnapshot = await getDocs(q);
        const logList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setLogs(logList);
      } catch (error) {
        console.error("Error al cargar la bitácora: ", error);
        Alert.alert(
          "Error",
          "No se pudo cargar el historial clínico del paciente."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [patientUid]);

  return (
    <SafeAreaView className="flex-1 bg-fondo-claro">
      {/* 🧭 Encabezado Superior (Header) */}
      <View className="flex-row items-center px-4 py-5 bg-az-primario rounded-b-lg shadow-md">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back-outline" size={28} color="#FFFFFF" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-texto-claro ml-4">
          Historial de {patientName}
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
              {patientName} aún no tiene notas clínicas registradas en su
              bitácora.
            </Text>
          </View>
        ) : (
          logs.map((log) => <LogEntryCard key={log.id} log={log} />)
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default NursePatientLogScreen;
