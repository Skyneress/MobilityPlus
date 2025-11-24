import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  Image,
  ActivityIndicator,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../config/firebaseConfig";

const PRIMARY_COLOR = "#3A86FF";

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

const ProfessionalDetailScreen = ({ route, navigation }) => {
  const { professionalId } = route.params;

  const [loading, setLoading] = useState(true);
  const [professional, setProfessional] = useState(null);

  useEffect(() => {
    const fetchProfessionalData = async () => {
      if (!professionalId) {
        Alert.alert("Error", "No se proporcionó un ID de profesional.");
        setLoading(false);
        return;
      }

      try {
        const docRef = doc(db, "profesionales", professionalId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setProfessional({ id: docSnap.id, ...docSnap.data() });
        } else {
          Alert.alert("Error", "No se encontró el perfil del profesional.");
        }
      } catch (error) {
        console.error("Error al cargar detalle del profesional: ", error);
        Alert.alert("Error", "No se pudo cargar el perfil.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfessionalData();
  }, [professionalId]);

  const handleRequestBooking = () => {
    // Navegamos a la pantalla de reserva y le pasamos el objeto 'professional'
    navigation.navigate("BookAppointment", { professional: professional });
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-fondo-claro">
        <ActivityIndicator size="large" color={PRIMARY_COLOR} />
      </View>
    );
  }

  if (!professional) {
    return (
      <SafeAreaView className="flex-1 bg-fondo-claro">
        <View className="flex-row items-center px-4 py-5 bg-az-primario rounded-b-lg shadow-md">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back-outline" size={28} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        <View className="flex-1 justify-center items-center">
          <Text className="text-texto-oscuro text-lg">
            Perfil no encontrado.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-fondo-claro">
      {/* Header */}
      <View className="flex-row items-center px-4 py-5 bg-az-primario rounded-b-lg shadow-md">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back-outline" size={28} color="#FFFFFF" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-texto-claro ml-4">
          Perfil del Profesional
        </Text>
      </View>

      <ScrollView className="flex-1">
        {/* Sección de Foto y Nombre (sin cambios) */}
        <View className="items-center py-6 bg-white shadow-md -mt-1">
          <Image
            source={{
              uri: professional.fotoPerfil || "https://via.placeholder.com/150",
            }}
            className="w-24 h-24 rounded-full border-4 border-az-primario shadow-lg"
          />
          <Text className="text-2xl font-bold text-texto-oscuro mt-3">
            {professional.nombre} {professional.apellido}
          </Text>
          <Text className="text-base text-az-primario font-semibold">
            {professional.especialidadNombre || professional.especialidad}
          </Text>

          <View className="flex-row items-center mt-2">
            <FontAwesome name="star" size={18} color="#FFD700" />
            <Text className="text-lg font-semibold text-texto-oscuro ml-2">
              {professional.calificacion || 0}
            </Text>
            <Text className="text-sm text-gray-500 ml-1">
              ({professional.reviews || 0} Reviews)
            </Text>
          </View>
        </View>

        {/* Información Profesional y Servicios */}
        <View className="p-4 mt-4">
          <View className="bg-white p-4 rounded-xl shadow-md border border-gris-acento">
            <Text className="text-lg font-bold text-az-primario mb-3">
              Información Profesional
            </Text>

            <InfoRow
              icon="briefcase-outline"
              label="Especialidad"
              value={
                professional.especialidadNombre || professional.especialidad
              }
            />
            <InfoRow
              icon="school-outline"
              label="Experiencia"
              value={`${professional.experiencia || 0} años`}
            />
            <InfoRow
              icon="card-outline"
              label="Registro MINSAL"
              value={professional.numeroRegistroMinsal}
            />

            {/* 💡 SECCIÓN DE SERVICIOS ACTUALIZADA */}
            <View className="mt-4 pt-3 border-t border-gris-acento/50">
              <Text className="text-lg font-bold text-az-primario mb-3 flex-row items-center">
                <Ionicons
                  name="bandage-outline"
                  size={20}
                  color={PRIMARY_COLOR}
                  style={{ marginRight: 5 }}
                />
                Servicios y Tarifas
              </Text>

              {professional.servicios && professional.servicios.length > 0 ? (
                // Mapeamos el nuevo array de objetos 'servicios'
                professional.servicios.map((srv, index) => (
                  <ServiceDetailRow
                    key={srv.idServicio || index}
                    name={srv.nombre || "Servicio no especificado"}
                    price={srv.precioClp}
                  />
                ))
              ) : (
                <Text className="text-sm text-gray-500 italic">
                  Este profesional aún no ha definido servicios específicos.
                </Text>
              )}

              {/* Mostramos la Consulta General como un servicio básico */}
              <ServiceDetailRow
                name="Consulta General / Base"
                price={professional.precioConsulta}
              />
            </View>
          </View>
        </View>
      </ScrollView>

      {/* 🟢 Botón de Acción Flotante (sin cambios) */}
      <View className="w-full p-4 bg-white border-t border-gris-acento shadow-xl">
        <TouchableOpacity
          className="bg-az-primario rounded-full py-4 shadow-lg items-center"
          onPress={handleRequestBooking}
        >
          <Text className="text-texto-claro text-lg font-bold">
            Solicitar Cita
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// Componente auxiliar
const InfoRow = ({ icon, label, value }) => (
  <View className="flex-row items-start py-2 border-b border-gris-acento/30">
    <Ionicons name={icon} size={20} color="#6B7280" className="mt-1" />
    <View className="ml-4 flex-1">
      <Text className="text-xs text-gray-500">{label}</Text>
      <Text className="text-base font-medium text-texto-oscuro">{value}</Text>
    </View>
  </View>
);

export default ProfessionalDetailScreen;
