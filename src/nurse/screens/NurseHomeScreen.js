import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, Switch, ScrollView, Alert, ActivityIndicator, Image } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { collection, query, where, onSnapshot, orderBy, doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebaseConfig';
import { useAuth } from '../../context/AuthContext';

const PRIMARY_COLOR = "#3A86FF";
const TEXT_DARK = "#1F2937";
const GRAY_ACCENT = "#E5E7EB";

const NurseHomeScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [isAvailable, setIsAvailable] = useState(true);
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState([]);
  const [loadingToggle, setLoadingToggle] = useState(false);

  // 💡 1. Función para obtener los datos del paciente dado su UID
  const getPatientData = useCallback(async (patientUid) => {
    try {
      const patientDocRef = doc(db, "users", patientUid);
      const patientDocSnap = await getDoc(patientDocRef);
      if (patientDocSnap.exists()) {
        return patientDocSnap.data();
      }
      return null;
    } catch (error) {
      console.error("Error al obtener datos del paciente:", error);
      return null;
    }
  }, []);

  // useEffect para cargar las citas y el estado de disponibilidad
  useEffect(() => {
    if (!user) return;

    setLoading(true);

    const fetchAvailabilityAndRequests = async () => {
      // 1. Cargar el estado inicial de disponibilidad
      try {
        const profRef = doc(db, "profesionales", user.uid);
        const docSnap = await getDoc(profRef);
        if (docSnap.exists()) {
          setIsAvailable(docSnap.data().disponibilidad);
        } else {
          console.warn("No se encontró el perfil del profesional en 'profesionales'");
          setIsAvailable(false); 
        }
      } catch (error) {
        console.error("Error al cargar disponibilidad: ", error);
      }

      // 2. Escuchar solicitudes pendientes (en tiempo real)
      const q = query(
        collection(db, "citas"),
        where("nurseUid", "==", user.uid),
        where("status", "==", "pendiente"),
        orderBy("createdAt", "desc")
      );

      const unsubscribe = onSnapshot(q, async (querySnapshot) => {
        // 💡 3. Usamos Promise.all para esperar los datos de los pacientes
        const activeRequestsPromises = querySnapshot.docs.map(async (doc) => {
          const citaData = { id: doc.id, ...doc.data() };
          // Obtener datos del paciente real
          const patientData = await getPatientData(citaData.patientUid);
          return {
            ...citaData,
            // 💡 Ahora sí se mostrará el nombre y dirección reales
            patientName: patientData ? `${patientData.nombre} ${patientData.apellido}` : 'Paciente Desconocido',
            patientProfilePic: patientData ? patientData.fotoPerfil : null,
            address: patientData ? patientData.direccion : 'Dirección no disponible',
            patientPhoneNumber: patientData ? patientData.telefono : null, 
          };
        });
        const requestsWithPatientData = await Promise.all(activeRequestsPromises);
        setRequests(requestsWithPatientData);
        setLoading(false);
      }, (error) => {
        console.error("Error al escuchar solicitudes: ", error);
        Alert.alert("Error", "No se pudo conectar para recibir solicitudes.");
        setLoading(false);
      });

      return () => unsubscribe();
    };

    fetchAvailabilityAndRequests();

  }, [user, getPatientData]); // Dependencia de getPatientData

  const toggleAvailability = async () => {
    if (!user) return;

    const newState = !isAvailable;
    setLoadingToggle(true);
    setIsAvailable(newState); 

    try {
      const profRef = doc(db, "profesionales", user.uid);
      await updateDoc(profRef, {
        disponibilidad: newState
      });
      Alert.alert(
        "Estado Actualizado",
        newState ? "Ahora estás EN LÍNEA." : "Ahora estás FUERA DE SERVICIO."
      );
    } catch (error) {
      console.error("Error al actualizar disponibilidad: ", error);
      Alert.alert("Error", "No se pudo cambiar tu estado. Intenta de nuevo.");
      setIsAvailable(!newState); 
    } finally {
      setLoadingToggle(false);
    }
  };

  const handleViewDetails = (cita) => {
    navigation.navigate('JobDetail', { 
      appointment: cita 
    });
  };

  const handleChat = (request) => {
    if (request.patientUid && request.patientName) {
      navigation.navigate('Chat', {
        chatWithUser: {
          id: request.patientUid,
          name: request.patientName,
          role: 'patient',
        }
      });
    } else {
      Alert.alert("Error", "No se pudo iniciar el chat. Datos del paciente incompletos.");
    }
  };


  return (
    <SafeAreaView className="flex-1 bg-fondo-claro">

      {/* Encabezado */}
      <View className="flex-row justify-between items-center px-4 py-5 bg-az-primario/90 rounded-b-2xl shadow-md">
        <TouchableOpacity onPress={() => navigation.navigate('NurseProfile')}>
          <Ionicons name="settings-outline" size={28} color="#FFFFFF" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-texto-claro">Panel de Enfermero</Text>
        <TouchableOpacity onPress={() => navigation.navigate('NurseEarnings')}>
          <Ionicons name="wallet-outline" size={28} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 p-4">

        {/* Tarjeta de Disponibilidad */}
        <View className={`p-6 rounded-2xl shadow-lg mb-6 items-center ${isAvailable ? 'bg-exito-verde' : 'bg-error-rojo'}`}>
          <Text className="text-texto-claro text-2xl font-bold mb-2">
            {isAvailable ? "EN LÍNEA" : "FUERA DE SERVICIO"}
          </Text>
          <Text className="text-texto-claro text-sm mb-4">
            {isAvailable ? "Recibirás notificaciones de trabajo" : "Ponte en línea para aceptar solicitudes."}
          </Text>
          <Switch
            onValueChange={toggleAvailability}
            value={isAvailable}
            disabled={loadingToggle}
            trackColor={{ false: "#FCA5A5", true: "#DCFCE7" }}
            thumbColor={isAvailable ? "#FFFFFF" : "#FFFFFF"}
          />
        </View>

        {/* Métricas Rápidas */}
        <View className="flex-row justify-between mb-6">
          <View className="w-[48%] bg-white p-4 rounded-xl shadow-md border border-gris-acento/50">
            <Text className="text-xl font-bold text-texto-oscuro">$0.00</Text>
            <Text className="text-sm text-gray-500">Ganancia Semanal</Text>
          </View>
          <View className="w-[48%] bg-white p-4 rounded-xl shadow-md border border-gris-acento/50">
            <Text className="text-xl font-bold text-texto-oscuro">{requests.length}</Text>
            <Text className="text-sm text-gray-500">Servicios Pendientes</Text>
          </View>
        </View>

        {/* Solicitudes de Trabajo Reales y REDISEÑADAS */}
        <Text className="text-xl font-bold text-texto-oscuro mb-4">
          Solicitudes Pendientes ({requests.length})
        </Text>

        {loading ? (
          <ActivityIndicator size="large" color={PRIMARY_COLOR} className="my-10" />
        ) : requests.length === 0 ? (
          <Text className="text-gray-500 text-center">No tienes solicitudes pendientes por ahora.</Text>
        ) : (
          requests.map(request => (
            <View
              key={request.id}
              className="bg-white p-4 rounded-xl shadow-md mb-4 border border-gris-acento/50"
            >
              {/* Sección superior: Tipo de Servicio y Fecha/Hora */}
              <View className="flex-row justify-between items-center mb-2 pb-2 border-b border-gris-acento/50">
                <Text className="text-lg font-bold text-texto-oscuro max-w-[70%]">
                  {request.serviceType || "Servicio Desconocido"}
                </Text>
                <Text className="text-sm font-semibold text-gray-500">
                  {request.requestedDate || "Fecha/Hora Pendiente"}
                </Text>
              </View>

              {/* Sección del Paciente (Usa datos reales del fetch) */}
              <View className="flex-row items-center mb-3">
                <Image
                  source={{ uri: request.patientProfilePic || `https://placehold.co/50x50/EBF8FF/3A86FF?text=${request.patientName.charAt(0)}` }}
                  className="w-12 h-12 rounded-full border-2 border-az-primario mr-3"
                />
                <View className="flex-1">
                  {/* 💡 AHORA MUESTRA EL NOMBRE REAL */}
                  <Text className="text-base font-semibold text-texto-oscuro">{request.patientName}</Text>
                  <View className="flex-row items-center mt-1">
                    <Ionicons name="location-outline" size={16} color="#6B7280" />
                    <Text className="text-sm text-gray-500 ml-1" numberOfLines={1}>
                      {request.address || "Dirección no especificada"}
                    </Text>
                  </View>
                </View>
                {/* Botón de Chat */}
                <TouchableOpacity onPress={() => handleChat(request)} className="ml-3 p-2 bg-fondo-claro rounded-full border border-gris-acento">
                  <Ionicons name="chatbubbles-outline" size={24} color={PRIMARY_COLOR} />
                </TouchableOpacity>
              </View>

              {/* Botones de Acción */}
              <View className="flex-row justify-between items-center pt-3 border-t border-gris-acento/50">
                <TouchableOpacity
                  className="bg-az-primario py-3 flex-1 rounded-full shadow-sm flex-row justify-center items-center"
                  onPress={() => handleViewDetails(request)}
                >
                  <Ionicons name="information-circle-outline" size={20} color="#FFFFFF" className="mr-2" />
                  <Text className="text-texto-claro font-bold text-base ml-1">Ver Detalles</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}

      </ScrollView>

      {/* Barra de Navegación Inferior (Tab Bar) */}
      <View className="flex-row justify-around items-center bg-white border-t border-gris-acento pt-2 pb-4 shadow-xl">
        <TouchableOpacity className="items-center" onPress={() => navigation.navigate('NurseHome')}>
          <Ionicons name="home" size={24} color={PRIMARY_COLOR} />
          <Text className="text-az-primario text-xs font-semibold">Panel</Text>
        </TouchableOpacity>
        <TouchableOpacity className="items-center" onPress={() => navigation.navigate('NurseSchedule')}>
          <Ionicons name="calendar-outline" size={24} color="#9ca3af" />
          <Text className="text-gray-400 text-xs">Agenda</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="items-center"
          onPress={() => navigation.navigate('ChatList')}
        >
          <Ionicons name="chatbubbles-outline" size={24} color="#9ca3af" />
          <Text className="text-gray-400 text-xs">Mensajes</Text>
        </TouchableOpacity>
        <TouchableOpacity className="items-center" onPress={() => navigation.navigate('NurseProfile')}>
          <Ionicons name="person-outline" size={24} color="#9ca3af" />
          <Text className="text-gray-400 text-xs">Perfil</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default NurseHomeScreen;