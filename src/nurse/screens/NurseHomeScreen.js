import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, Switch, ScrollView, Alert, ActivityIndicator } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons'; 
// 💡 1. Importar MÁS funciones de Firestore: updateDoc, doc, y getDoc
import { collection, query, where, onSnapshot, orderBy, doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebaseConfig';
import { useAuth } from '../../context/AuthContext';

const PRIMARY_COLOR = "#3A86FF";

const NurseHomeScreen = ({ navigation }) => {
  const { user } = useAuth(); // Obtenemos el usuario (enfermero) logueado
  const [isAvailable, setIsAvailable] = useState(true); // Estado de disponibilidad
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState([]);
  const [loadingToggle, setLoadingToggle] = useState(false); // Estado para el Switch

  // useEffect para cargar las citas y el estado de disponibilidad
  useEffect(() => {
    if (!user) return; // Si no hay usuario, no hacer nada

    setLoading(true);
    
    // 💡 2. Cargar el estado inicial de disponibilidad del profesional
    const fetchAvailability = async () => {
      try {
        const profRef = doc(db, "profesionales", user.uid);
        const docSnap = await getDoc(profRef);
        if (docSnap.exists()) {
          setIsAvailable(docSnap.data().disponibilidad);
        }
      } catch (error) {
        console.error("Error al cargar disponibilidad: ", error);
        // Mantenemos el estado por defecto si falla
      }
    };
    fetchAvailability();
    
    // 3. Escuchar solicitudes pendientes (sin cambios)
    const q = query(
      collection(db, "citas"),
      where("nurseUid", "==", user.uid), 
      where("status", "==", "pendiente"), 
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const activeRequests = [];
      querySnapshot.forEach((doc) => {
        activeRequests.push({ id: doc.id, ...doc.data() });
      });
      setRequests(activeRequests); 
      setLoading(false);
    }, (error) => {
      console.error("Error al escuchar solicitudes: ", error);
      Alert.alert("Error", "No se pudo conectar para recibir solicitudes.");
      setLoading(false);
    });

    // Limpiamos el 'oyente' cuando el componente se desmonta
    return () => unsubscribe(); 

  }, [user]); // Este efecto se ejecuta cada vez que el 'user' cambia

  // 💡 4. Lógica de Disponibilidad ACTUALIZADA
  const toggleAvailability = async () => {
    if (!user) return;

    const newState = !isAvailable; // El nuevo estado al que cambiaremos
    setLoadingToggle(true); // Bloqueamos el switch
    
    try {
      // Actualizamos el documento en la colección "profesionales"
      const profRef = doc(db, "profesionales", user.uid);
      await updateDoc(profRef, {
        disponibilidad: newState 
      });
      
      // Si la actualización es exitosa, actualizamos el estado local
      setIsAvailable(newState);
      
      Alert.alert(
        "Estado Actualizado", 
        newState ? "Ahora estás EN LÍNEA." : "Ahora estás FUERA DE SERVICIO."
      );
    } catch (error) {
      console.error("Error al actualizar disponibilidad: ", error);
      Alert.alert("Error", "No se pudo cambiar tu estado. Intenta de nuevo.");
    } finally {
      setLoadingToggle(false); // Desbloqueamos el switch
    }
  };

  const handleAcceptJob = (cita) => {
    // Navegamos al detalle, pasando el ID de la cita y el ID del paciente
    navigation.navigate('JobDetail', { 
      appointmentId: cita.id, 
      patientUid: cita.patientUid 
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-fondo-claro">
      
      {/* Encabezado (sin cambios) */}
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
        
        {/* 💡 5. Tarjeta de Disponibilidad ACTUALIZADA */}
        <View className={`p-6 rounded-2xl shadow-lg mb-6 items-center ${isAvailable ? 'bg-exito-verde' : 'bg-error-rojo'}`}>
          <Text className="text-texto-claro text-2xl font-bold mb-2">
            {isAvailable ? "EN LÍNEA" : "FUERA DE SERVICIO"}
          </Text>
          <Text className="text-texto-claro text-sm mb-4">
            {isAvailable ? "Recibirás notificaciones de trabajo cercanas" : "Ponte en línea para aceptar solicitudes."}
          </Text>
          <Switch
            onValueChange={toggleAvailability}
            value={isAvailable}
            disabled={loadingToggle} // Deshabilitado mientras se guarda
            trackColor={{ false: "#FCA5A5", true: "#DCFCE7" }}
            thumbColor={isAvailable ? "#FFFFFF" : "#FFFFFF"}
          />
        </View>

        {/* Métricas Rápidas (sin cambios, aún son mock) */}
        <View className="flex-row justify-between mb-6">
          <View className="w-[48%] bg-white p-4 rounded-xl shadow-md border border-gris-acento/50">
            <Text className="text-xl font-bold text-texto-oscuro">$1,250</Text>
            <Text className="text-sm text-gray-500">Ganancia Semanal</Text>
          </View>
          <View className="w-[48%] bg-white p-4 rounded-xl shadow-md border border-gris-acento/50">
            <Text className="text-xl font-bold text-texto-oscuro">18</Text>
            <Text className="text-sm text-gray-500">Servicios Hoy</Text>
          </View>
        </View>

        {/* Solicitudes de Trabajo Reales */}
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
              className="bg-white p-4 rounded-xl shadow-md mb-3 border border-gris-acento/50 flex-row justify-between items-center"
            >
              <View className="flex-1 mr-3">
                <Text className="text-lg font-semibold text-texto-oscuro">{request.serviceType}</Text>
                <Text className="text-sm text-gray-600 mt-1">Paciente: {request.patientName}</Text>
                <View className="flex-row items-center mt-2">
                  <Ionicons name="location-outline" size={14} color="#6B7280" />
                  <Text className="text-sm text-gray-500 ml-1">{request.address}</Text>
                </View>
              </View>
              <TouchableOpacity 
                className="bg-az-primario py-2 px-4 rounded-full shadow-sm"
                onPress={() => handleAcceptJob(request)} // Pasamos el objeto de cita completo
              >
                <Text className="text-texto-claro font-bold text-sm">Ver</Text>
              </TouchableOpacity>
            </View>
          ))
        )}

      </ScrollView>

      {/* Barra de Navegación Inferior (Tab Bar) - Conectada */}
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
          onPress={() => navigation.navigate('Chat', { contactName: 'Soporte', contactRole: 'Soporte' })} 
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