import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  SafeAreaView, 
  ScrollView, 
  Alert, 
  TextInput,
  ActivityIndicator
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons'; 
// 💡 1. Importar funciones de Firestore y hook de Auth
import { doc, updateDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../../config/firebaseConfig';
import { useAuth } from '../../context/AuthContext';

const PRIMARY_COLOR = "#3A86FF"; 
const TEXT_DARK = "#1F2937";
const PLACEHOLDER_COLOR = "#9ca3af";

// Eliminamos los datos mock


const CompleteJobScreen = ({ navigation, route }) => {
  // 💡 2. Obtenemos los datos reales pasados desde JobDetailScreen
  const { appointmentId, patientUid, serviceType, patientName } = route.params;
  
  const { user } = useAuth(); // Obtenemos el enfermero logueado (para su ID y nombre)
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  // 💡 3. Lógica real para completar el servicio
  const handleCompleteService = async () => {
    if (notes.trim() === '') {
      Alert.alert("Notas vacías", "Por favor, añade las notas clínicas de la visita.");
      return;
    }
    if (!user) {
        Alert.alert("Error", "No se pudo identificar al enfermero.");
        return;
    }

    setLoading(true);

    try {
      // 3A. Actualizar el estado de la cita a "completada"
      const appointmentRef = doc(db, "citas", appointmentId);
      await updateDoc(appointmentRef, {
        status: 'completada',
        updatedAt: serverTimestamp()
      });

      // 3B. Crear la entrada en la bitácora del paciente
      // Ruta: /users/{patientUid}/bitacora/
      const logRef = collection(db, "users", patientUid, "bitacora");
      await addDoc(logRef, {
        createdAt: serverTimestamp(),
        // Idealmente, tomamos el nombre del perfil del enfermero,
        // pero por ahora usamos el del objeto auth o el nombre de la cita
        enfermeroNombre: (user.displayName || "Profesional Asignado"), 
        enfermeroUid: user.uid,
        tipoServicio: serviceType,
        notasClinicas: notes
      });

      setLoading(false);
      Alert.alert(
        "¡Servicio Completado!",
        `La cita ha sido marcada como completada y las notas se han guardado en la bitácora de ${patientName}.`
      );
      // Regresamos al Panel de Enfermero
      navigation.navigate('NurseHome');

    } catch (error) {
      console.error("Error al completar el servicio: ", error);
      setLoading(false);
      Alert.alert("Error", "No se pudo finalizar el servicio. Intenta de nuevo.");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-fondo-claro">
      
      {/* Encabezado */}
      <View className="flex-row items-center px-4 py-5 bg-az-primario rounded-b-lg shadow-md">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back-outline" size={28} color="#FFFFFF" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-texto-claro ml-4">Finalizar Servicio</Text>
      </View>

      <ScrollView className="flex-1 p-4">
        
        {/* 💡 4. Usamos datos reales en el resumen */}
        <View className="bg-white p-4 rounded-xl shadow-md mb-6 border border-gris-acento">
          <Text className="text-sm text-gray-500 mb-1">Completando cita para:</Text>
          <Text className="text-xl font-bold text-texto-oscuro">{patientName}</Text>
          <Text className="text-base text-az-primario mt-1">{serviceType}</Text>
        </View>
        
        {/* Notas para la Bitácora (sin cambios) */}
        <View className="bg-white p-4 rounded-xl shadow-md mb-6 border border-gris-acento">
          <Text className="text-lg font-bold text-az-primario mb-3">
            <Ionicons name="document-text-outline" size={20} /> Notas para la Bitácora
          </Text>
          <Text className="text-xs text-gray-500 mb-2">(Estas notas serán visibles para el paciente en su historial clínico)</Text>
          
          <TextInput
            className="w-full border border-gris-acento rounded-lg px-4 py-3 bg-fondo-claro text-texto-oscuro h-48"
            placeholder="Escribe aquí el resumen del procedimiento, signos vitales, y recomendaciones..."
            placeholderTextColor={PLACEHOLDER_COLOR}
            multiline
            textAlignVertical="top"
            value={notes}
            onChangeText={setNotes}
          />
        </View>

        <View className="h-24" />
      </ScrollView>

      {/* Botón de Acción Flotante */}
      <View className="w-full p-4 bg-white border-t border-gris-acento shadow-xl">
        <TouchableOpacity
          className="bg-exito-verde rounded-full py-4 shadow-lg items-center"
          onPress={handleCompleteService}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text className="text-texto-claro text-lg font-bold">
              Marcar como Completada y Guardar
            </Text>
          )}
        </TouchableOpacity>
      </View>
      
    </SafeAreaView>
  );
};

export default CompleteJobScreen;