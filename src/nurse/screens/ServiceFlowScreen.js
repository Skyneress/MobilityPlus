import React, { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView, Alert, ActivityIndicator } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons'; 
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../config/firebaseConfig';

const PRIMARY_COLOR = "#3A86FF"; 
const TEXT_DARK = "#1F2937";
const GRAY_ACCENT = "#E5E7EB";
const SUCCESS_COLOR = "#4CAF50";

const ServiceFlowScreen = ({ navigation, route }) => {
    const { appointment } = route.params; 
    const [loading, setLoading] = useState(false);

    // Mapeo de estados y el texto del botón
    const statusMap = {
        'aceptada': { nextStatus: 'en_camino', buttonText: 'Marcar como: En Camino', color: '#FF9800' },
        'en_camino': { nextStatus: 'en_proceso', buttonText: 'Marcar como: En Servicio', color: PRIMARY_COLOR },
        'en_proceso': { nextStatus: 'finalizar', buttonText: 'FINALIZAR SERVICIO (Abrir Bitácora)', color: SUCCESS_COLOR },
        'completada': { nextStatus: 'none', buttonText: 'Servicio Finalizado', color: GRAY_ACCENT },
    };

    const currentFlow = statusMap[appointment.status] || statusMap.completada;

    // Función principal para actualizar el estado
    const handleUpdateStatus = async () => {
        if (loading || appointment.status === 'completada' || currentFlow.nextStatus === 'none') return;
        
        // Si el siguiente estado es 'finalizar', navegamos a la pantalla de Bitácora
        if (currentFlow.nextStatus === 'finalizar') {
            navigation.navigate('CompleteJob', { 
                appointmentId: appointment.id,
                patientUid: appointment.patientUid,
                serviceType: appointment.serviceType,
                patientName: appointment.patientName,
            });
            return;
        }

        // Si es un estado intermedio, actualizamos en Firebase
        setLoading(true);
        try {
            const appointmentRef = doc(db, "citas", appointment.id);
            await updateDoc(appointmentRef, {
                status: currentFlow.nextStatus,
                updatedAt: serverTimestamp()
            });

            Alert.alert(
                'Estado Actualizado', 
                `Cita ahora en estado: ${currentFlow.nextStatus.toUpperCase()}`
            );
            
            // Go back o simplemente refrescará automáticamente si usas un listener en la pantalla anterior
            navigation.goBack(); 

        } catch (error) {
            console.error("Error al actualizar el estado: ", error);
            Alert.alert("Error", "No se pudo actualizar el estado de la cita.");
        } finally {
            setLoading(false);
        }
    };


    return (
        <SafeAreaView className="flex-1 bg-fondo-claro">
            
            {/* Encabezado */}
            <View className="flex-row items-center px-4 py-5 bg-az-primario rounded-b-lg shadow-md">
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back-outline" size={28} color="#FFFFFF" />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-texto-claro ml-4">Gestión de Servicio</Text>
            </View>

            <ScrollView className="flex-1 p-4">
                
                {/* Resumen del Paciente */}
                <View className="bg-white p-4 rounded-xl shadow-md mb-4 border border-gris-acento">
                    <Text className="text-xl font-bold text-texto-oscuro mb-1">{appointment.patientName}</Text>
                    <Text className="text-base text-gray-600 mb-3">{appointment.serviceType}</Text>
                    
                    <View className="flex-row items-center mb-2">
                        <Ionicons name="location-outline" size={20} color={TEXT_DARK} />
                        <Text className="text-base text-texto-oscuro ml-2">{appointment.address}</Text>
                    </View>
                    <View className="flex-row items-center">
                        <Ionicons name="time-outline" size={20} color={TEXT_DARK} />
                        <Text className="text-base text-texto-oscuro ml-2">{appointment.requestedDate}</Text>
                    </View>
                </View>

                {/* Tarjeta de Estado Actual */}
                <View className="p-5 rounded-xl shadow-lg mb-6 items-center border" style={{ backgroundColor: currentFlow.color + '10', borderColor: currentFlow.color }}>
                    <Text className="text-sm text-gray-600 mb-1">Estado Actual</Text>
                    <Text className="text-3xl font-extrabold" style={{ color: currentFlow.color }}>
                        {appointment.status.toUpperCase().replace('_', ' ')}
                    </Text>
                </View>

                {/* Bitácora / Notas (Opcional - solo texto) */}
                <Text className="text-lg font-bold text-texto-oscuro mt-4 mb-2">Notas de la Solicitud:</Text>
                <Text className="text-sm text-gray-600 border border-gris-acento p-3 rounded-lg bg-white">
                    {appointment.notes || "Sin notas adicionales del paciente."}
                </Text>

            </ScrollView>

            {/* Botón de Acción Principal */}
            {currentFlow.nextStatus !== 'none' && (
                <View className="absolute bottom-0 w-full p-4 bg-white border-t border-gris-acento shadow-xl">
                    <TouchableOpacity
                        className="rounded-full py-4 items-center shadow-lg"
                        onPress={handleUpdateStatus}
                        disabled={loading}
                        style={{ backgroundColor: currentFlow.color }}
                    >
                        {loading ? (
                            <ActivityIndicator color="#FFFFFF" />
                        ) : (
                            <Text className="text-texto-claro text-lg font-bold">
                                {currentFlow.buttonText}
                            </Text>
                        )}
                    </TouchableOpacity>
                </View>
            )}

        </SafeAreaView>
    );
};

export default ServiceFlowScreen;