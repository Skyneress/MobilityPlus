import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Image } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../config/firebaseConfig';

const PRIMARY_COLOR = "#3A86FF";
const TEXT_DARK = "#1F2937";

// ⚠️ REEMPLAZA CON TU URL DE FIREBASE FUNCTIONS (La que guardaste en el Paso 2)
const BACKEND_URL = "https://us-central1-mobilityplus-53365.cloudfunctions.net/createPaymentPreference";

const PaymentScreen = ({ navigation, route }) => {
  const { appointment } = route.params; // Recibimos la cita a pagar
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);

  // Formato de precio
  const formatPrice = (price) => {
    return Number(price).toLocaleString("es-CL", { style: "currency", currency: "CLP" });
  };

  const handleMercadoPago = async () => {
    setLoading(true);
    try {
      // 1. Crear preferencia en el Backend
      const response = await fetch(BACKEND_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `Servicio: ${appointment.serviceType}`,
          price: appointment.price, // Precio real de la cita
          description: `Atención con ${appointment.nurseName}`
        })
      });

      const data = await response.json();
      
      if (!data.sandbox_init_point) {
        throw new Error("No se recibió el link de pago");
      }

      // 2. Abrir Navegador
      const result = await WebBrowser.openAuthSessionAsync(
        data.sandbox_init_point, // Usamos SANDBOX para pruebas
        Linking.createURL("payment-result")
      );

      // 3. Simular éxito al volver (En producción, deberías validar con Webhooks)
      if (result.type === 'success' || result.type === 'dismiss') {
        // Asumimos éxito para la demo si el usuario completó el flujo
        // Opcional: Verificar URL de retorno
        await confirmPaymentSuccess();
      }

    } catch (error) {
      console.error(error);
      Alert.alert("Error", "No se pudo iniciar el pago. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  const confirmPaymentSuccess = async () => {
    try {
      // Actualizamos estado a "en_camino" o "pagado" para que el enfermero proceda
      const appointmentRef = doc(db, "citas", appointment.id);
      await updateDoc(appointmentRef, {
        status: "en_camino", // El pago exitoso activa el flujo
        paymentStatus: "paid",
        paidAt: serverTimestamp()
      });

      Alert.alert("¡Pago Exitoso!", "El profesional ha sido notificado y va en camino.");
      navigation.navigate("PatientHome");
    } catch (error) {
      Alert.alert("Atención", "El pago se realizó pero hubo un error actualizando la cita. Contáctanos.");
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f0f0f0', paddingTop: insets.top }}>
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 bg-az-primario rounded-b-lg shadow-md">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close-outline" size={30} color="#FFFFFF" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-texto-claro ml-4">Confirmar Pago</Text>
      </View>

      <ScrollView className="flex-1 p-6">
        <View className="bg-white p-6 rounded-2xl shadow-lg items-center border border-gris-acento/50">
          <View className="bg-blue-50 p-4 rounded-full mb-4">
            <Ionicons name="card-outline" size={40} color={PRIMARY_COLOR} />
          </View>
          
          <Text className="text-gray-500 text-sm uppercase font-bold tracking-wider mb-1">Total a Pagar</Text>
          <Text className="text-4xl font-extrabold text-texto-oscuro mb-6">
            {formatPrice(appointment.price)}
          </Text>

          <View className="w-full bg-gray-50 p-4 rounded-xl mb-4">
            <Text className="text-gray-500 text-xs mb-1">Servicio</Text>
            <Text className="text-lg font-semibold text-texto-oscuro mb-3">{appointment.serviceType}</Text>
            
            <Text className="text-gray-500 text-xs mb-1">Profesional</Text>
            <Text className="text-lg font-semibold text-texto-oscuro">{appointment.nurseName}</Text>
          </View>

          <View className="flex-row items-center bg-green-50 px-3 py-2 rounded-lg border border-green-200">
            <Ionicons name="shield-checkmark-outline" size={16} color="#15803d" />
            <Text className="text-green-700 text-xs ml-2 font-medium">Pago seguro procesado por Mercado Pago</Text>
          </View>
        </View>
      </ScrollView>

      {/* Footer Botón */}
      <View className="p-4 bg-white border-t border-gray-200" style={{ paddingBottom: insets.bottom + 10 }}>
        <TouchableOpacity 
          onPress={handleMercadoPago}
          disabled={loading}
          className="bg-[#009EE3] py-4 rounded-full flex-row justify-center items-center shadow-md"
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Text className="text-white font-bold text-lg mr-2">Pagar con Mercado Pago</Text>
              <Ionicons name="chevron-forward" size={20} color="white" />
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default PaymentScreen;