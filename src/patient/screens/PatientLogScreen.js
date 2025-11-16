import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  SafeAreaView, 
  ScrollView, 
  Alert, 
  ActivityIndicator 
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons'; 
// Importamos las funciones de Firestore
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebaseConfig';
import { useAuth } from '../../context/AuthContext';

const PRIMARY_COLOR = "#3A86FF"; 
const TEXT_DARK = "#1F2937";

// Componente para una entrada de la bitácora
const LogEntryCard = ({ log }) => (
  <View className="bg-white p-4 rounded-xl shadow-md mb-3 border border-gris-acento">
    {/* Encabezado de la entrada */}
    <View className="flex-row justify-between items-center mb-3 border-b border-gris-acento/50 pb-2">
      <View>
        <Text className="text-lg font-bold text-az-primario">{log.tipoServicio}</Text>
        <Text className="text-xs text-gray-500">{log.fecha}</Text>
      </View>
      <View className="flex-row items-center">
        <Ionicons name="person-outline" size={14} color="#6B7280" />
        <Text className="text-sm text-texto-oscuro ml-1">{log.enfermeroNombre}</Text>
      </View>
    </View>
    
    {/* Cuerpo de la nota */}
    <Text className="text-base font-semibold text-texto-oscuro mb-1">Notas Clínicas:</Text>
    <Text className="text-sm text-gray-700 leading-5">
      {log.notasClinicas}
    </Text>
  </View>
);

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
        // Ordenamos por fecha (asumimos que guardaremos 'createdAt' como Timestamp)
        const q = query(logRef, orderBy("createdAt", "desc")); 

        const querySnapshot = await getDocs(q);
        const logList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          // Convertimos el Timestamp a una fecha legible (simplificado)
          fecha: doc.data().createdAt?.toDate().toLocaleDateString('es-ES') || 'Fecha no disponible'
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
  }, [userId]); // Se vuelve a cargar si el userId cambia

  return (
    <SafeAreaView className="flex-1 bg-fondo-claro">
      
      {/* 🧭 Encabezado Superior (Header) */}
      <View className="flex-row items-center px-4 py-5 bg-az-primario rounded-b-lg shadow-md">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back-outline" size={28} color="#FFFFFF" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-texto-claro ml-4">Mi Bitácora Clínica</Text>
      </View>

      <ScrollView className="flex-1 p-4">
        {loading ? (
          <ActivityIndicator size="large" color={PRIMARY_COLOR} className="mt-10" />
        ) : logs.length === 0 ? (
          <View className="p-4 bg-white rounded-lg items-center mt-4 shadow-sm">
            <Text className="text-gray-500 text-center">
              Tu bitácora está vacía. Las notas clínicas aparecerán aquí después de tus citas completadas.
            </Text>
          </View>
        ) : (
          logs.map(log => (
            <LogEntryCard key={log.id} log={log} />
          ))
        )}
      </ScrollView>

      {/* Barra de Navegación Inferior (Tab Bar) - La mantenemos consistente */}
      <View className="flex-row justify-around items-center bg-white border-t border-gris-acento pt-2 pb-4 shadow-xl">
        <TouchableOpacity className="items-center" onPress={() => navigation.navigate('PatientHome')}>
          <Ionicons name="home-outline" size={24} color="#9ca3af" />
          <Text className="text-gray-400 text-xs">Home</Text>
        </TouchableOpacity>
        <TouchableOpacity className="items-center" onPress={() => navigation.navigate('PatientHistory')}>
          <Ionicons name="calendar-outline" size={24} color="#9ca3af" />
          <Text className="text-gray-400 text-xs">Citas</Text>
        </TouchableOpacity>
        <TouchableOpacity className="items-center" onPress={() => navigation.navigate('Chat', { contactName: 'Soporte', contactRole: 'Soporte' })}>
          <Ionicons name="chatbubbles-outline" size={24} color="#9ca3af" />
          <Text className="text-gray-400 text-xs">Mensajes</Text>
        </TouchableOpacity>
        <TouchableOpacity className="items-center" onPress={() => navigation.navigate('PatientProfile')}>
          <Ionicons name="person-outline" size={24} color="#9ca3af" />
          <Text className="text-gray-400 text-xs">Perfil</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default PatientLogScreen;