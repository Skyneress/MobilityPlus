import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView, Alert, ActivityIndicator } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons'; 
// 💡 1. Importar funciones de Firestore y el hook de Auth
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../../config/firebaseConfig';
import { useAuth } from '../../context/AuthContext';

const PRIMARY_COLOR = "#3A86FF"; 
const TEXT_DARK = "#1F2937";
const GRAY_ACCENT = "#E5E7EB";

// Componente para una fila de transacción
const TransactionRow = ({ transaction }) => (
  <View className="flex-row justify-between items-center py-3 border-b border-gris-acento/70">
    <View className="flex-row items-center">
      <View className="p-2 bg-az-primario/10 rounded-full mr-3">
        {/* Usamos un ícono genérico o uno basado en serviceType si tuviéramos un map */}
        <Ionicons name="bandage-outline" size={20} color={PRIMARY_COLOR} />
      </View>
      <View>
        <Text className="text-base font-medium text-texto-oscuro">{transaction.serviceType}</Text>
        <Text className="text-xs text-gray-500">{transaction.requestedDate}</Text>
      </View>
    </View>
    <Text className="text-lg font-bold text-exito-verde">${transaction.price.toFixed(2)}</Text>
  </View>
);


const NurseEarningsScreen = ({ navigation }) => {
  const { user } = useAuth(); // Obtenemos el enfermero logueado
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [totalBalance, setTotalBalance] = useState(0);

  // 💡 2. useEffect para escuchar las citas COMPLETADAS en tiempo real
  useEffect(() => {
    if (!user) return; 

    setLoading(true);
    
    // Consulta para citas COMPLETADAS
    const q = query(
      collection(db, "citas"),
      where("nurseUid", "==", user.uid), 
      where("status", "==", "completada"), 
      orderBy("createdAt", "desc") // Ordenamos por fecha
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const transactionsList = [];
      let balance = 0;
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        transactionsList.push({ id: doc.id, ...data });
        balance += data.price || 0; // Sumamos el precio de cada cita completada
      });
      
      setTransactions(transactionsList);
      setTotalBalance(balance);
      setLoading(false);
      
    }, (error) => {
      console.error("Error al cargar ganancias: ", error);
      Alert.alert("Error", "No se pudo cargar tu historial de ganancias.");
      setLoading(false);
    });

    // Limpiamos el 'oyente'
    return () => unsubscribe();

  }, [user]); // Se ejecuta si el 'user' cambia

  
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
      
      {/* Encabezado */}
      <View className="flex-row items-center px-4 py-5 bg-az-primario rounded-b-lg shadow-md">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back-outline" size={28} color="#FFFFFF" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-texto-claro ml-4">Mis Ganancias</Text>
      </View>

      <ScrollView className="flex-1 p-4">
        
        {/* 💰 Tarjeta de Balance Actual (Datos Reales) */}
        <View className="bg-white p-6 rounded-2xl shadow-lg mb-6 items-center border border-gris-acento">
          <Text className="text-base text-gray-500 mb-2">Balance Disponible</Text>
          <Text className="text-5xl font-extrabold text-exito-verde mb-4">
            ${totalBalance.toFixed(2)}
          </Text>
          
          <TouchableOpacity
            className="bg-az-primario rounded-full py-3 px-6 shadow-md"
            onPress={handleWithdrawal}
            disabled={totalBalance === 0}
          >
            <Text className="text-texto-claro text-lg font-semibold">
              Solicitar Retiro
            </Text>
          </TouchableOpacity>
        </View>

        {/* 📈 Resumen Semanal/Mensual (aún mock) */}
        <View className="flex-row justify-between mb-6">
          <View className="w-[48%] bg-white p-4 rounded-xl shadow-md border border-gris-acento/50">
            <Text className="text-sm text-gray-500">Servicios (Semana)</Text>
            <Text className="text-2xl font-bold text-texto-oscuro mt-1">{transactions.length}</Text>
          </View>
          <View className="w-[48%] bg-white p-4 rounded-xl shadow-md border border-gris-acento/50">
            <Text className="text-sm text-gray-500">Ingresos (Mes)</Text>
            <Text className="text-2xl font-bold text-texto-oscuro mt-1">${totalBalance.toFixed(2)}</Text>
          </View>
        </View>

        {/* 🧾 Historial de Transacciones (Datos Reales) */}
        <View className="bg-white p-4 rounded-xl shadow-md mb-6 border border-gris-acento">
          <Text className="text-lg font-bold text-az-primario mb-4">Transacciones Recientes</Text>
          
          {loading ? (
            <ActivityIndicator size="large" color={PRIMARY_COLOR} className="my-5" />
          ) : transactions.length === 0 ? (
            <Text className="text-center text-gray-500 my-4">
              No tienes transacciones completadas.
            </Text>
          ) : (
            transactions.map(t => (
              <TransactionRow key={t.id} transaction={t} />
            ))
          )}
          
          <TouchableOpacity className="mt-4 items-center">
             <Text className="text-sm font-semibold text-az-primario">Ver Historial Completo</Text>
          </TouchableOpacity>
        </View>
        
      </ScrollView>

    </SafeAreaView>
  );
};

export default NurseEarningsScreen;