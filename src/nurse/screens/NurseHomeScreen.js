import React, { useState } from 'react';
import { View, Text, Switch, SafeAreaView, Alert, ScrollView } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';

const NurseHomeScreen = () => {
  const [isAvailable, setIsAvailable] = useState(false);
  
  const toggleAvailability = () => {
    setIsAvailable(previousState => !previousState);
    Alert.alert(
      isAvailable ? 'Desconectado' : 'Conectado',
      isAvailable ? 'Ya no recibirás nuevas solicitudes de servicio.' : 'Estás disponible para recibir solicitudes de pacientes.',
    );
  };

  const currentRequests = [
    { id: 1, patientName: 'Jorge A.', service: 'Inyección Intramuscular', distance: '2.1 km', time: '5 min' },
    { id: 2, patientName: 'María P.', service: 'Toma de Muestras', distance: '4.5 km', time: '12 min' },
  ];

  return (
    <SafeAreaView className="flex-1 bg-fondo-claro">
      
      {/* 🟢 Toggle de Disponibilidad */}
      <View className={`p-4 flex-row items-center justify-between ${isAvailable ? 'bg-exito-verde/10' : 'bg-error-rojo/10'}`}>
        <Text className="text-xl font-bold text-texto-oscuro">
          Estado: {isAvailable ? '¡Disponible ahora!' : 'No Disponible'}
        </Text>
        <Switch
          trackColor={{ false: '#767577', true: '#81b0ff' }}
          thumbColor={isAvailable ? '#f5dd4b' : '#f4f3f4'}
          onValueChange={toggleAvailability}
          value={isAvailable}
        />
      </View>
      
      {/* 📋 Solicitudes Pendientes */}
      <Text className="text-2xl font-bold text-texto-oscuro p-4 pt-6">
        {isAvailable ? 'Solicitudes Recibidas' : 'Conéctate para ver solicitudes'}
      </Text>

      <ScrollView className="px-4">
        {isAvailable && currentRequests.length > 0 ? (
          currentRequests.map(request => (
            <View key={request.id} className="bg-white p-4 mb-3 rounded-lg shadow-md border-l-4 border-az-primario">
              <Text className="text-lg font-semibold text-texto-oscuro">{request.service}</Text>
              <Text className="text-sm text-gray-500 mt-1">Paciente: {request.patientName}</Text>
              <View className="flex-row justify-between mt-3">
                <Text className="text-az-primario font-medium">Distancia: {request.distance}</Text>
                <Text className="text-az-primario font-medium">Llegada Est.: {request.time}</Text>
              </View>
              <TouchableOpacity className="mt-4 bg-az-primario rounded-lg py-3 items-center" onPress={() => Alert.alert('Aceptar', `Has aceptado la solicitud de ${request.patientName}`)}>
                <Text className="text-texto-claro font-bold">Aceptar Servicio</Text>
              </TouchableOpacity>
            </View>
          ))
        ) : (
          <Text className="text-gray-400 text-center mt-8">
            {isAvailable ? 'No hay solicitudes activas por el momento.' : 'Activa tu disponibilidad para empezar a trabajar.'}
          </Text>
        )}
      </ScrollView>

    </SafeAreaView>
  );
};

export default NurseHomeScreen;
