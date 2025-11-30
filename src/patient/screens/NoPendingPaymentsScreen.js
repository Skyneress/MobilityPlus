import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const NoPendingPaymentsScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();

  return (
    <View 
      className="flex-1 bg-[#f0f0f0] items-center justify-center p-6"
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
    >
      {/* Círculo de fondo decorativo */}
      <View className="bg-green-100 p-8 rounded-full mb-6 shadow-sm border border-green-200">
        <Ionicons name="checkmark-done-circle" size={100} color="#4CAF50" />
      </View>

      <Text className="text-2xl font-bold text-texto-oscuro mb-2 text-center">
        ¡Estás al día!
      </Text>

      <Text className="text-base text-gray-500 text-center mb-10 px-4 leading-6">
        No tienes pagos pendientes por realizar en este momento. Tus servicios anteriores están al día.
      </Text>

      {/* Botón Volver */}
      <TouchableOpacity 
        onPress={() => navigation.goBack()}
        className="bg-az-primario w-full max-w-xs py-4 rounded-full shadow-lg flex-row justify-center items-center"
      >
        <Text className="text-white font-bold text-lg">Volver al Inicio</Text>
      </TouchableOpacity>
    </View>
  );
};

export default NoPendingPaymentsScreen;