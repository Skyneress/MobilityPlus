import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../config/firebaseConfig';

const PRIMARY_COLOR = "#3A86FF";

// Tu URL de Backend (Cloud Function)
const BACKEND_URL = "https://us-central1-mobilityplus-53365.cloudfunctions.net/createPaymentPreference";

const PaymentScreen = ({ navigation, route }) => {
  const { appointment } = route.params; 
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);

  // Formato de precio a CLP
  const formatPrice = (price) => {
    return Number(price).toLocaleString("es-CL", { style: "currency", currency: "CLP" });
  };

  const handleMercadoPago = async () => {
    setLoading(true);
    try {
      // 1. Generar la URL de retorno exacta para Expo Go
      const returnUrl = Linking.createURL("payment-result"); 
      console.log("URL de retorno enviada:", returnUrl);

      // 2. Crear preferencia en el Backend
      const response = await fetch(BACKEND_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `Servicio: ${appointment.serviceType}`,
          price: appointment.price, 
          description: `Atención con ${appointment.nurseName}`,
          redirectUrl: returnUrl, // Para que MP sepa dónde volver
          // 👇 AQUÍ ESTÁ LA CLAVE PARA QUE NO FALLE EL PAGO EN SANDBOX 👇
          payerEmail: "test_user_5663781133402100837@testuser.com" 
        })
      });

      const data = await response.json();
      
      if (!data.sandbox_init_point) {
        throw new Error("No se recibió el link de pago del servidor");
      }

      // 3. Abrir Navegador y esperar resultado
      const result = await WebBrowser.openAuthSessionAsync(
        data.sandbox_init_point, 
        returnUrl 
      );

      // 4. VALIDACIÓN ESTRICTA (Sin puertas traseras)
      if (result.type === 'success' && result.url) {
        // Mercado Pago devuelve el estado en los parámetros de la URL
        if (result.url.includes("collection_status=approved")) {
          await confirmPaymentSuccess(); 
        } else if (result.url.includes("collection_status=pending")) {
          Alert.alert("Pago Pendiente", "Tu pago se está procesando. Te avisaremos cuando se confirme.");
        } else {
          Alert.alert("Pago Rechazado", "La transacción fue rechazada o cancelada. Intenta con otro medio de pago.");
        }
      } else {
        // Si el usuario cierra la ventana manualmente o cancela con "X"
        Alert.alert("Proceso Cancelado", "No se completó el pago.");
      }

    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Ocurrió un error al iniciar el pago. Verifica tu conexión.");
    } finally {
      setLoading(false);
    }
  };

  const confirmPaymentSuccess = async () => {
    try {
      // Actualizamos estado a "en_camino" para activar el flujo del enfermero
      const appointmentRef = doc(db, "citas", appointment.id);
      await updateDoc(appointmentRef, {
        status: "en_camino", 
        paymentStatus: "paid",
        paidAt: serverTimestamp()
      });

      Alert.alert("¡Pago Exitoso!", "El profesional ha sido notificado y va en camino.");
      navigation.navigate("PatientHome");
    } catch (error) {
      console.error("Error actualizando Firebase:", error);
      Alert.alert("Atención", "El pago se realizó, pero hubo un error actualizando la cita. Por favor contáctanos.");
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
        {/* Tarjeta de Resumen */}
        <View className="bg-white p-6 rounded-2xl shadow-lg items-center border border-gris-acento/50">
          
          <View className="bg-blue-50 p-4 rounded-full mb-4">
            <Ionicons name="card-outline" size={40} color={PRIMARY_COLOR} />
          </View>
          
          <Text className="text-gray-500 text-sm uppercase font-bold tracking-wider mb-1">Total a Pagar</Text>
          <Text className="text-4xl font-extrabold text-texto-oscuro mb-6">
            {formatPrice(appointment.price)}
          </Text>

          {/* Detalles */}
          <View className="w-full bg-gray-50 p-4 rounded-xl mb-4 border border-gray-100">
            <Text className="text-gray-500 text-xs mb-1">Servicio</Text>
            <Text className="text-lg font-semibold text-texto-oscuro mb-3">{appointment.serviceType}</Text>
            
            <Text className="text-gray-500 text-xs mb-1">Profesional</Text>
            <Text className="text-lg font-semibold text-texto-oscuro">{appointment.nurseName}</Text>
          </View>

          {/* Sello de seguridad */}
          <View className="flex-row items-center bg-green-50 px-3 py-2 rounded-lg border border-green-200">
            <Ionicons name="shield-checkmark-outline" size={16} color="#15803d" />
            <Text className="text-green-700 text-xs ml-2 font-medium">Procesado seguro por Mercado Pago</Text>
          </View>
        </View>
      </ScrollView>

      {/* Footer Botón */}
      <View className="p-4 bg-white border-t border-gray-200 shadow-xl" style={{ paddingBottom: insets.bottom + 10 }}>
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