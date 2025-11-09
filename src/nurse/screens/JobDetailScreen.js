import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView, Alert } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons'; 

const PRIMARY_COLOR = "#3A86FF"; 
const TEXT_DARK = "#1F2937";
const GRAY_ACCENT = "#E5E7EB";
const SUCCESS_COLOR = "#4CAF50";

// Datos de ejemplo simulados para una solicitud
const mockJob = {
  id: 'REQ-987',
  patient: 'Sra. Viviana López',
  service: 'Curación de Úlcera de Presión',
  time: 'Hoy, 14:30 PM',
  address: 'Calle Falsa 123, Depto 4B',
  distance: '2.5 km',
  phone: '+56 9 1234 5678',
  notes: 'La paciente tiene movilidad reducida. Traer guantes estériles y solución salina.',
  status: 'Pendiente de Inicio',
  fee: '$55 USD',
};

// Componente para una sección de información
const DetailSection = ({ title, children }) => (
  <View className="bg-white p-4 rounded-xl shadow-md mb-4 border border-gris-acento">
    <Text className="text-lg font-bold text-az-primario mb-3">{title}</Text>
    {children}
  </View>
);

const JobDetailScreen = ({ navigation }) => {
  const handleStartTrip = () => {
    Alert.alert(
      "Iniciar Viaje", 
      `Confirmar que inicias el viaje hacia ${mockJob.patient}. Se activará el GPS.`,
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Confirmar", onPress: () => Alert.alert('Viaje Iniciado', 'Ruta de GPS activada.') }
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-fondo-claro">
      
      {/* 🧭 Encabezado Superior (Header) */}
      <View className="flex-row items-center px-4 py-5 bg-az-primario rounded-b-lg shadow-md">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back-outline" size={28} color="#FFFFFF" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-texto-claro ml-4">Detalle de Solicitud #{mockJob.id}</Text>
      </View>

      <ScrollView className="flex-1 p-4">
        
        {/* 🗺️ Sección de Ubicación y Mapa */}
        <DetailSection title="Ubicación del Servicio">
          <View className="flex-row items-center mb-2">
            <Ionicons name="location-outline" size={20} color={TEXT_DARK} />
            <Text className="text-base text-texto-oscuro ml-2 font-medium">{mockJob.address}</Text>
          </View>
          <Text className="text-sm text-gray-500 mb-3 ml-6">{mockJob.distance} de distancia</Text>
          
          {/* Marcador de Mapa Simulada */}
          <View className="w-full h-32 bg-gris-acento rounded-lg items-center justify-center mt-2">
             <Text className="text-gray-500 text-lg">Mapa de Ruta Aquí</Text>
             <Text className="text-sm text-gray-400">Toca para abrir en Google Maps</Text>
          </View>
        </DetailSection>

        {/* 🧑 Detalles del Paciente */}
        <DetailSection title="Detalles del Paciente">
          <InfoRow icon="person-outline" label="Nombre" value={mockJob.patient} />
          <InfoRow icon="call-outline" label="Contacto" value={mockJob.phone} onPress={() => Alert.alert("Llamar", `Llamando a ${mockJob.patient}`)} />
          <InfoRow icon="cash-outline" label="Tarifa Estimada" value={mockJob.fee} />
        </DetailSection>
        
        {/* 💉 Detalles del Servicio */}
        <DetailSection title="Detalles del Servicio">
          <InfoRow icon="bandage-outline" label="Tipo de Servicio" value={mockJob.service} />
          <InfoRow icon="time-outline" label="Hora Programada" value={mockJob.time} />
          
          <Text className="text-base font-semibold text-texto-oscuro mt-4 mb-2">Notas Médicas:</Text>
          <Text className="text-sm text-gray-600 border border-gris-acento p-3 rounded-lg bg-fondo-claro">
            {mockJob.notes}
          </Text>
        </DetailSection>

        {/* Espacio para que el botón flotante no cubra el contenido */}
        <View className="h-20" /> 
        
      </ScrollView>

      {/* 🟢 Botón de Acción Flotante */}
      <View className="absolute bottom-0 w-full p-4 bg-white border-t border-gris-acento shadow-xl">
        <TouchableOpacity
          className="bg-az-primario rounded-full py-4 shadow-lg items-center"
          onPress={handleStartTrip}>
          <Text className="text-texto-claro text-lg font-bold">
            <Ionicons name="navigate-circle-outline" size={20} color="#FFFFFF" /> Iniciar Viaje Ahora
          </Text>
        </TouchableOpacity>
      </View>
      
    </SafeAreaView>
  );
};

// Componente auxiliar reutilizado para filas de información
const InfoRow = ({ icon, label, value, onPress }) => (
  <TouchableOpacity 
    className="flex-row items-center justify-between py-2"
    onPress={onPress}
    disabled={!onPress}
  >
    <View className="flex-row items-center flex-1">
      <Ionicons name={icon} size={20} color="#6B7280" />
      <View className="ml-4">
        <Text className="text-base font-medium text-texto-oscuro">{value}</Text>
      </View>
    </View>
    {onPress && (
        <Ionicons name="chevron-forward-outline" size={24} color="#6B7280" />
    )}
  </TouchableOpacity>
);

export default JobDetailScreen;