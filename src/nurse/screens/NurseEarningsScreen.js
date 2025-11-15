import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView, Alert } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons'; 
import FontAwesome from 'react-native-vector-icons/FontAwesome';

const PRIMARY_COLOR = "#3A86FF"; 
const TEXT_DARK = "#1F2937";
const GRAY_ACCENT = "#E5E7EB";

// Datos de ejemplo para las transacciones
const mockTransactions = [
  { id: 1, date: '08 Nov 2025', service: 'Curación de Heridas', amount: 55.00, status: 'Completed' },
  { id: 2, date: '07 Nov 2025', service: 'Inyección Intravenosa', amount: 45.00, status: 'Completed' },
  { id: 3, date: '07 Nov 2025', service: 'Terapia de Movilidad', amount: 60.00, status: 'Completed' },
  { id: 4, date: '06 Nov 2025', service: 'Monitoreo Glicemia', amount: 30.00, status: 'Completed' },
];

// Componente para una fila de transacción
const TransactionRow = ({ transaction }) => (
  <View className="flex-row justify-between items-center py-3 border-b border-gris-acento/70">
    <View className="flex-row items-center">
      <View className="p-2 bg-az-primario/10 rounded-full mr-3">
        <Ionicons name="bandage-outline" size={20} color={PRIMARY_COLOR} />
      </View>
      <View>
        <Text className="text-base font-medium text-texto-oscuro">{transaction.service}</Text>
        <Text className="text-xs text-gray-500">{transaction.date}</Text>
      </View>
    </View>
    <Text className="text-lg font-bold text-exito-verde">${transaction.amount.toFixed(2)}</Text>
  </View>
);


const NurseEarningsScreen = ({ navigation }) => {
  const totalBalance = 295.00;
  
  const handleWithdrawal = () => {
    Alert.alert(
      "Solicitar Retiro", 
      `Se procesará el retiro de $${totalBalance.toFixed(2)} a tu cuenta bancaria.`,
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Confirmar", onPress: () => Alert.alert("Retiro Enviado", "El pago está en proceso.") }
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
        <Text className="text-xl font-bold text-texto-claro ml-4">Mis Ganancias</Text>
      </View>

      <ScrollView className="flex-1 p-4">
        
        {/* 💰 Tarjeta de Balance Actual */}
        <View className="bg-white p-6 rounded-2xl shadow-lg mb-6 items-center border border-gris-acento">
          <Text className="text-base text-gray-500 mb-2">Balance Disponible</Text>
          <Text className="text-5xl font-extrabold text-exito-verde mb-4">
            ${totalBalance.toFixed(2)}
          </Text>
          
          <TouchableOpacity
            className="bg-az-primario rounded-full py-3 px-6 shadow-md"
            onPress={handleWithdrawal}
          >
            <Text className="text-texto-claro text-lg font-semibold">
              Solicitar Retiro
            </Text>
          </TouchableOpacity>
        </View>

        {/* 📈 Resumen Semanal/Mensual */}
        <View className="flex-row justify-between mb-6">
          <View className="w-[48%] bg-white p-4 rounded-xl shadow-md border border-gris-acento/50">
            <Text className="text-sm text-gray-500">Servicios (Semana)</Text>
            <Text className="text-2xl font-bold text-texto-oscuro mt-1">12</Text>
          </View>
          <View className="w-[48%] bg-white p-4 rounded-xl shadow-md border border-gris-acento/50">
            <Text className="text-sm text-gray-500">Ingresos (Mes)</Text>
            <Text className="text-2xl font-bold text-texto-oscuro mt-1">$2,145</Text>
          </View>
        </View>

        {/* 🧾 Historial de Transacciones */}
        <View className="bg-white p-4 rounded-xl shadow-md mb-6 border border-gris-acento">
          <Text className="text-lg font-bold text-az-primario mb-4">Transacciones Recientes</Text>
          {mockTransactions.map(t => (
            <TransactionRow key={t.id} transaction={t} />
          ))}
          <TouchableOpacity className="mt-4 items-center">
             <Text className="text-sm font-semibold text-az-primario">Ver Historial Completo</Text>
          </TouchableOpacity>
        </View>
        
      </ScrollView>

      {/* Barra de Navegación Inferior (Tab Bar) - Se mantiene igual */}
      {/* Asumimos que esta vista estará en un Tab Navigator, por ahora la navegación se mantiene en los botones */}
      <View className="flex-row justify-around items-center bg-white border-t border-gris-acento pt-2 pb-4 shadow-xl">
        <TouchableOpacity className="items-center" onPress={() => navigation.navigate('NurseHome')}>
          <Ionicons name="home-outline" size={24} color="#9ca3af" />
          <Text className="text-gray-400 text-xs">Panel</Text>
        </TouchableOpacity>
        <TouchableOpacity className="items-center" onPress={() => navigation.navigate('NurseSchedule')}>
          <Ionicons name="calendar-outline" size={24} color="#9ca3af" />
          <Text className="text-gray-400 text-xs">Agenda</Text>
        </TouchableOpacity>
        <TouchableOpacity className="items-center">
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

export default NurseEarningsScreen;