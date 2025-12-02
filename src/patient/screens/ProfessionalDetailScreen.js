import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
  ActivityIndicator,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "../../config/firebaseConfig";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const PRIMARY_COLOR = "#3A86FF";

// Componente auxiliar para mostrar un servicio con su precio
const ServiceDetailRow = ({ name, price }) => {
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

// 💡 NUEVO COMPONENTE: Para mostrar una reseña individual (CORREGIDO)
const ReviewEntry = ({ patientName, rating, comment, date }) => {
  const starIcons = Array(5)
    .fill(0)
    .map((_, i) => (
      <FontAwesome
        key={i}
        name={i < rating ? "star" : "star-o"}
        size={14}
        color="#FFD700"
        style={{ marginRight: 2 }}
      />
    ));

  let formattedDate = "Fecha desconocida";
  if (date && typeof date.toDate === "function") {
    formattedDate = date.toDate().toLocaleDateString("es-CL");
  } else if (date) {
    formattedDate = new Date(date).toLocaleDateString("es-CL");
  }

  return (
    <View className="p-3 bg-fondo-claro rounded-lg mb-2 border border-gris-acento/50">
      <View className="flex-row items-center justify-between mb-1">
        <Text className="text-sm font-bold text-texto-oscuro">
          {patientName}
        </Text>
        <Text className="text-xs text-gray-400">{formattedDate}</Text>
      </View>
      {/* 🚨 CORRECCIÓN AQUÍ: Eliminados espacios en blanco alrededor de {starIcons} */}
      <View className="flex-row mb-1">{starIcons}</View>
      <Text className="text-sm text-gray-700 italic">"{comment}"</Text>
    </View>
  );
};

const ProfessionalDetailScreen = ({ route, navigation }) => {
  const { professionalId } = route.params;
  const insets = useSafeAreaInsets();

  const [loading, setLoading] = useState(true);
  const [professional, setProfessional] = useState(null);
  const [reviewsList, setReviewsList] = useState([]);

  // 💡 FUNCIÓN PARA CARGAR LAS RESEÑAS DETALLADAS
  const fetchReviews = async (id) => {
    try {
      const reviewsQuery = query(
        collection(db, "citas"),
        where("nurseUid", "==", id),
        where("status", "==", "calificada")
      );
      const querySnapshot = await getDocs(reviewsQuery);
      const fetchedReviews = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.reviewComment && data.reviewRating) {
          fetchedReviews.push({
            id: doc.id,
            patientName: data.patientName || "Paciente Anónimo",
            rating: data.reviewRating,
            comment: data.reviewComment,
            date:
              data.reviewDate ||
              data.completionDate ||
              data.appointmentTimestamp,
          });
        }
      });
      setReviewsList(fetchedReviews);
    } catch (error) {
      console.error("Error al cargar las reseñas: ", error);
    }
  };

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
          const professionalData = { id: docSnap.id, ...docSnap.data() };
          setProfessional(professionalData);
          await fetchReviews(professionalData.id);
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
      <View
        className="flex-1 bg-fondo-claro"
        style={{ paddingTop: insets.top }}
      >
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
      </View>
    );
  }

  return (
    // 💡 CONTENEDOR PRINCIPAL
    <View style={{ flex: 1, backgroundColor: "#f0f0f0" }}>
      {/* Header */}
      <View
        className="flex-row items-center px-4 py-5 bg-az-primario rounded-b-lg shadow-md"
        style={{ paddingTop: insets.top }}
      >
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back-outline" size={28} color="#FFFFFF" />
        </TouchableOpacity>

        <Text className="text-xl font-bold text-texto-claro ml-4">
          Perfil del Profesional
        </Text>
      </View>

      <ScrollView className="flex-1">
        {/* Sección de Foto y Nombre */}
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

            {/* SECCIÓN DE SERVICIOS */}
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

              <ServiceDetailRow
                name="Consulta General / Base"
                price={professional.precioConsulta}
              />
            </View>
          </View>
        </View>

        {/* 💡 SECCIÓN DE RESEÑAS DETALLADAS */}
        <View className="p-4 mt-1 mb-20">
          <View className="bg-white p-4 rounded-xl shadow-md border border-gris-acento">
            <Text className="text-lg font-bold text-az-primario mb-3 flex-row items-center">
              <Ionicons
                name="star-half-outline"
                size={20}
                color="#FFD700"
                style={{ marginRight: 5 }}
              />
              Opiniones de Pacientes ({professional.reviews || 0})
            </Text>

            {reviewsList.length > 0 ? (
              <View className="space-y-3">
                {reviewsList.map((review) => (
                  <ReviewEntry
                    key={review.id}
                    patientName={review.patientName}
                    rating={review.rating}
                    comment={review.comment}
                    date={review.date}
                  />
                ))}
              </View>
            ) : (
              <Text className="text-sm text-gray-500 italic text-center">
                Aún no hay opiniones detalladas para este profesional.
              </Text>
            )}
          </View>
        </View>

        {/* 🚨 ESPACIADOR CRÍTICO */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* 🟢 Botón de Acción Flotante */}
      <View
        className="w-full p-4 bg-white border-t border-gris-acento shadow-xl absolute bottom-0 left-0 right-0"
        style={{ paddingBottom: insets.bottom }}
      >
        <TouchableOpacity
          className="bg-az-primario rounded-full py-4 shadow-lg items-center"
          onPress={handleRequestBooking}
        >
          <Text className="text-texto-claro text-lg font-bold">
            Solicitar Cita
          </Text>
        </TouchableOpacity>
      </View>
    </View>
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