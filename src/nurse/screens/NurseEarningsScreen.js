import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons'; 
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../../config/firebaseConfig';
import { useAuth } from '../../context/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context'; 

const PRIMARY_COLOR = "#3A86FF"; 
const TEXT_DARK = "#1F2937";
const GRAY_ACCENT = "#E5E7EB";

// 💡 FUNCIÓN UTILITARIA: Formatea el número a CLP (sin decimales)
const formatCLP = (amount) => {
    const num = Number(amount);
    if (isNaN(num)) return '$0';
    // Usamos es-CL para el formato de miles y el símbolo $.
    return `$${num.toLocaleString('es-CL', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    })}`;
};

// Componente para una fila de transacción (CORREGIDO)
const TransactionRow = ({ transaction }) => (
<View className="flex-row justify-between items-center py-3 border-b border-gris-acento/70">
 <View className="flex-row items-center">
 <View className="p-2 bg-az-primario/10 rounded-full mr-3">
  <Ionicons name="bandage-outline" size={20} color={PRIMARY_COLOR} />
 </View>
 <View>
  <Text className="text-base font-medium text-texto-oscuro">{transaction.serviceType}</Text>
  <Text className="text-xs text-gray-500">{transaction.requestedDate}</Text>
 </View>
 </View>
 {/* 💡 APLICAMOS FORMATO CLP AQUÍ */}
 <Text className="text-lg font-bold text-exito-verde">{formatCLP(transaction.price)}</Text>
</View>
);


const NurseEarningsScreen = ({ navigation }) => {
const { user } = useAuth(); // Obtenemos el enfermero logueado
const insets = useSafeAreaInsets();
 
const [loading, setLoading] = useState(true);
const [transactions, setTransactions] = useState([]);
const [totalBalance, setTotalBalance] = useState(0);

// 💡 2. useEffect para escuchar las citas COMPLETADAS en tiempo real (sin cambios)
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
 // 💡 APLICAMOS FORMATO CLP AQUÍ
 `Se procesará el retiro de ${formatCLP(totalBalance)} a tu cuenta bancaria.`,
 [
  { text: "Cancelar", style: "cancel" },
  { text: "Confirmar", onPress: () => Alert.alert("Retiro Enviado", "El pago está en proceso.") }
 ]
 );
};

return (
 <View style={{ flex: 1, backgroundColor: '#f0f0f0', paddingTop: insets.top }}>
 
 {/* Encabezado */}
 <View className="flex-row items-center px-4 py-3 bg-az-primario rounded-b-lg shadow-md">
  <TouchableOpacity onPress={() => navigation.goBack()}>
  <Ionicons name="arrow-back-outline" size={28} color="#FFFFFF" />
  </TouchableOpacity>
  <Text className="text-xl font-bold text-texto-claro ml-4">Mis Ganancias</Text>
 </View>

 <ScrollView className="flex-1 p-4" style={{ paddingBottom: insets.bottom }}>
  
  {/* 💰 Tarjeta de Balance Actual (Datos Reales) */}
  <View className="bg-white p-6 rounded-2xl shadow-lg mb-6 items-center border border-gris-acento">
  <Text className="text-base text-gray-500 mb-2">Balance Disponible</Text>
  <Text className="text-5xl font-extrabold text-exito-verde mb-4">
   {/* 💡 APLICAMOS FORMATO CLP AQUÍ */}
   {formatCLP(totalBalance)}
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

  {/* 📈 Resumen Semanal/Mensual */}
  <View className="flex-row justify-between mb-6">
  <View className="w-[48%] bg-white p-4 rounded-xl shadow-md border border-gris-acento/50">
   <Text className="text-sm text-gray-500">Servicios (Semana)</Text>
   <Text className="text-2xl font-bold text-texto-oscuro mt-1">{transactions.length}</Text>
  </View>
  <View className="w-[48%] bg-white p-4 rounded-xl shadow-md border border-gris-acento/50">
   <Text className="text-sm text-gray-500">Ingresos (Mes)</Text>
   {/* 💡 APLICAMOS FORMATO CLP AQUÍ */}
   <Text className="text-2xl font-bold text-texto-oscuro mt-1">{formatCLP(totalBalance)}</Text>
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
  
{/*   <TouchableOpacity className="mt-4 items-center">
   <Text className="text-sm font-semibold text-az-primario">Ver Historial Completo</Text>
  </TouchableOpacity> */}
  </View>
  
 </ScrollView>

 </View>
);
};

export default NurseEarningsScreen;