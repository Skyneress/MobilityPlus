import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Image } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { doc, getDoc, updateDoc, runTransaction, serverTimestamp } from "firebase/firestore";
import { db } from "../../config/firebaseConfig";
import { useSafeAreaInsets } from "react-native-safe-area-context"; 

const PRIMARY_COLOR = "#3A86FF";
const ERROR_COLOR = "#EF4444";
const SUCCESS_COLOR = "#10B981";
const WARNING_COLOR = "#FF9800"; // Usado para Pendiente

// 🚨 CORRECCIÓN CLAVE: Definición del objeto STATUS_COLORS
const STATUS_COLORS = {
    "pendiente": WARNING_COLOR, // #FF9800
    "verificado": SUCCESS_COLOR, // #10B981
    "rechazado": ERROR_COLOR,    // #EF4444
};

// Componente auxiliar para mostrar un servicio con su precio
const ServiceDetailRow = ({ name, price }) => {
 // Helper para formatear el precio de forma segura
 const formattedPrice = Number(price)
  ? Number(price).toLocaleString("es-CL")
  : "N/A";

 return (
  <View className="flex-row justify-between items-center py-1.5 border-b border-gris-acento/10">
   <Text className="text-base text-gray-700">{name}</Text>
   <Text className="text-base font-semibold text-texto-oscuro">
    ${formattedPrice} CLP
   </Text>
  </View>
 );
};

// Componente auxiliar InfoRow
const InfoRow = ({ icon, label, value }) => (
 <View className="flex-row items-start py-2 border-b border-gris-acento/30">
  <Ionicons name={icon} size={20} color="#6B7280" className="mt-1" />
  <View className="ml-4 flex-1">
   <Text className="text-xs text-gray-500">{label}</Text>
   <Text className="text-base font-medium text-gray-900">{value}</Text>
  </View>
 </View>
);


const AdminProfessionalDetailScreen = ({ route, navigation }) => {
 const { professionalId } = route.params;
 const insets = useSafeAreaInsets();

 const [professional, setProfessional] = useState(null);
 const [loading, setLoading] = useState(true);
 const [submitting, setSubmitting] = useState(false);

 // Lógica para APROBAR al profesional
 const handleApprove = () => {
  Alert.alert("Aprobar", "¿Deseas aprobar este perfil?", 
       [{ text: "Cancelar", style: "cancel" }, { text: "Aprobar", style: "default", onPress: () => updateProfessionalStatus('verificado') }]
    );
 };

 // Lógica para RECHAZAR al profesional
 const handleReject = () => {
  Alert.alert(
   "Rechazar Profesional",
   "¿Estás seguro de que quieres RECHAZAR este perfil? Se le notificará al usuario.",
   [{ text: "Cancelar", style: "cancel" }, { text: "Rechazar", style: "destructive", onPress: () => updateProfessionalStatus('rechazado') }]
  );
 };
    
  // Lógica para REVERTIR a Pendiente (si ya está aprobado/rechazado)
  const handleRevert = () => {
    Alert.alert("Revertir Estado", "¿Quieres cambiar el estado a PENDIENTE para revisión?",
        [{ text: "Cancelar", style: "cancel" }, { text: "Sí, Revertir", style: "destructive", onPress: () => updateProfessionalStatus('pendiente') }]
    );
  };

  // 💡 FUNCIÓN DE CAMBIO DE ESTADO CENTRALIZADA
  const updateProfessionalStatus = async (newStatus) => {
    setSubmitting(true);
    try {
        const profRef = doc(db, "profesionales", professionalId);
        const userRef = doc(db, "users", professionalId); 
        
        await runTransaction(db, async (transaction) => {
            transaction.update(profRef, {
                estadoVerificacion: newStatus,
                approvedAt: newStatus === 'verificado' ? serverTimestamp() : null,
                rejectedAt: newStatus === 'rechazado' ? serverTimestamp() : null,
            });
            
            transaction.update(userRef, { estadoVerificacion: newStatus });
        });

        Alert.alert("Éxito", `Perfil actualizado a: ${newStatus.toUpperCase()}`);
        navigation.goBack(); 

    } catch (error) {
        console.error("Error al actualizar estado:", error);
        Alert.alert("Error", `No se pudo actualizar el estado a ${newStatus}.`);
    } finally {
        setSubmitting(false);
    }
  };


 useEffect(() => {
  const fetchDetails = async () => {
    try {
      const docRef = doc(db, "profesionales", professionalId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setProfessional(docSnap.data());
      } else {
        Alert.alert("Error", "Perfil no encontrado.");
      }
     } catch (error) {
        console.error("Error cargando detalles del admin:", error);
      } finally {
        setLoading(false);
      }
    };
  fetchDetails();
 }, [professionalId]);


 if (loading) {
    return <View className="flex-1 justify-center items-center" style={{ paddingTop: insets.top }}><ActivityIndicator size="large" color={PRIMARY_COLOR} /></View>;
  }

 if (!professional) return null;

    // 💡 DETERMINAR EL ESTADO DE VERIFICACIÓN PARA LA UI
    const currentStatus = professional.estadoVerificacion;
    const isPending = currentStatus === 'pendiente';
    const statusColor = STATUS_COLORS[currentStatus] || PRIMARY_COLOR;


 return (
  <View style={{ flex: 1, backgroundColor: '#f0f0f0' }}>
    
    {/* Header */}
    <View className="flex-row items-center px-4 py-5 bg-blue-600" style={{ paddingTop: insets.top }}>
      <TouchableOpacity onPress={() => navigation.goBack()} disabled={submitting}>
        <Ionicons name="arrow-back-outline" size={28} color="#FFFFFF" />
      </TouchableOpacity>
      <Text className="text-xl text-white font-bold ml-4 flex-1">Verificación</Text>
    </View>

    <ScrollView className="flex-1 p-4">
            
            {/* 🚨 TARJETA DE ESTADO ACTUAL (Si NO está pendiente) */}
            {!isPending && (
                <View className="bg-white p-4 rounded-xl shadow-md mb-4 items-center" style={{ borderColor: statusColor, borderWidth: 2 }}>
                    <Text className="text-lg font-bold" style={{ color: statusColor }}>
                        ESTADO: {currentStatus.toUpperCase()}
                    </Text>
                    <TouchableOpacity onPress={handleRevert} className="mt-2">
                         <Text className="text-sm underline" style={{ color: PRIMARY_COLOR }}>
                            Revertir a PENDIENTE
                        </Text>
                    </TouchableOpacity>
                </View>
            )}
      
      {/* 1. SECCIÓN DE DATOS PERSONALES */}
      <View className="bg-white p-4 rounded-xl shadow-md mb-4 border border-gray-300">
        <Text className="text-lg font-bold text-gray-800 mb-2">Datos Personales</Text>
        <InfoRow icon="person-outline" label="Nombre Completo" value={`${professional.nombre} ${professional.apellido}`} />
        <InfoRow icon="card-outline" label="RUT" value={professional.rut} />
        <InfoRow icon="call-outline" label="Contacto" value={professional.telefono} />
        <InfoRow icon="mail-outline" label="Correo" value={professional.email} />
      </View>

      {/* 2. SECCIÓN DE CREDENCIALES PROFESIONALES */}
      <View className="bg-white p-4 rounded-xl shadow-md mb-6 border border-gray-300">
        <Text className="text-lg font-bold text-gray-800 mb-2">Credenciales</Text>
        <InfoRow icon="briefcase-outline" label="Especialidad" value={professional.especialidadNombre || professional.especialidad} />
        <InfoRow icon="card-outline" label="Registro MINSAL" value={professional.numeroRegistroMinsal} />
        <InfoRow icon="school-outline" label="Experiencia" value={`${professional.experiencia || 0} años`} />
      </View>
      
      {/* 3. SECCIÓN DE TARIFAS Y SERVICIOS */}
      <View className="bg-white p-4 rounded-xl shadow-md mb-6 border border-gray-300">
        <Text className="text-lg font-bold text-gray-800 mb-3">Tarifas y Servicios</Text>
        {professional.servicios && professional.servicios.length > 0 ? (
          professional.servicios.map((srv, index) => (
            <ServiceDetailRow key={srv.idServicio || index} name={srv.nombre} price={srv.precioClp} />
          ))
        ) : (
          <Text className="text-sm text-gray-500 italic">No se listaron servicios específicos.</Text>
        )}
        <Text className="text-sm text-gray-500 mt-2">Precio Base de Consulta: ${professional.precioConsulta || 0}</Text>
      </View>

      {/* Espaciador para el botón fijo */}
      <View style={{ height: 100 }} /> 

    </ScrollView>

    {/* BOTONES DE ACCIÓN FIJOS */}
    {isPending && (
      <View 
        className="absolute bottom-0 w-full p-4 bg-white border-t border-gray-200 shadow-xl flex-row justify-between space-x-4"
        style={{ paddingBottom: insets.bottom || 10 }}
      >
        <TouchableOpacity
          className="flex-1 py-3 rounded-full items-center"
          style={{ backgroundColor: ERROR_COLOR }}
          onPress={handleReject}
          disabled={submitting}
        >
          <Text className="text-white font-bold text-lg">Rechazar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="flex-1 py-3 rounded-full items-center"
          style={{ backgroundColor: SUCCESS_COLOR }}
          onPress={handleApprove}
          disabled={submitting}
        >
          <Text className="text-white font-bold text-lg">
            {submitting ? 'Aprobando...' : 'Aprobar'}
          </Text>
        </TouchableOpacity>
      </View>
    )}
        
        {/* 🚨 REVERTIR ESTADO (Si NO está pendiente) */}
        {!isPending && (
            <View 
                className="absolute bottom-0 w-full p-4 bg-white border-t border-gray-200 shadow-xl flex-row justify-center"
        style={{ paddingBottom: insets.bottom || 10 }}
            >
                <View className="flex-1 flex-row justify-between items-center bg-gray-100 p-3 rounded-xl">
                    <Text 
                        className="text-lg font-bold" 
                        style={{ color: currentStatus === 'verificado' ? SUCCESS_COLOR : ERROR_COLOR }}
                    >
                        ESTADO: {currentStatus.toUpperCase()}
                    </Text>
                    <TouchableOpacity
                        className="py-1 px-3 rounded-full"
                        style={{ backgroundColor: PRIMARY_COLOR }}
                        onPress={handleRevert}
                    >
                        <Text className="text-white font-semibold">Revisar</Text>
                    </TouchableOpacity>
                </View>
            </View>
        )}
        
    </View>
  );
};

export default AdminProfessionalDetailScreen;