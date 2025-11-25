import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  TextInput,
  ActivityIndicator,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import {
  doc,
  updateDoc,
  getDoc,
  runTransaction,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../config/firebaseConfig";
import { useAuth } from "../../context/AuthContext";
import { useSafeAreaInsets } from "react-native-safe-area-context"; // Importación necesaria

const PRIMARY_COLOR = "#3A86FF";
const TEXT_DARK = "#1F2937";
const PLACEHOLDER_COLOR = "#9ca3af";
const STAR_COLOR_FILLED = "#FFD700"; // Dorado

// Componente de Estrellas (sin cambios)
const StarRating = ({ rating, setRating }) => {
  return (
    <View className="flex-row justify-center my-4">
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity key={star} onPress={() => setRating(star)}>
          <Ionicons
            name={rating >= star ? "star" : "star-outline"}
            size={40}
            color={STAR_COLOR_FILLED}
            className="mx-2"
          />
        </TouchableOpacity>
      ))}
    </View>
  );
};

const RatingScreen = ({ navigation, route }) => {
  // 💡 OBTENER LOS INSETS
  const insets = useSafeAreaInsets();

  const { appointmentId, professionalId, professionalName } = route.params;
  const { user } = useAuth();

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  // Lógica para enviar la calificación
  const handleSubmitReview = async () => {
    if (rating === 0) {
      Alert.alert(
        "Calificación vacía",
        "Por favor, selecciona de 1 a 5 estrellas."
      );
      return;
    }
    if (comment.trim() === "") {
      Alert.alert(
        "Comentario vacío",
        "Por favor, deja un breve comentario sobre el servicio."
      );
      return;
    }

    setLoading(true);

    try {
      const professionalRef = doc(db, "profesionales", professionalId);
      const appointmentRef = doc(db, "citas", appointmentId); // Referencia a la cita

      await runTransaction(db, async (transaction) => {
        const profDoc = await transaction.get(professionalRef);
        if (!profDoc.exists()) {
          throw new Error("Profesional no encontrado");
        }

        // 1. Calculamos los nuevos valores agregados
        const data = profDoc.data();
        const oldRatingTotal = (data.calificacion || 0) * (data.reviews || 0);
        const oldReviews = data.reviews || 0;
        const newReviews = oldReviews + 1;
        const newRating = (oldRatingTotal + rating) / newReviews;

        // 2. Actualizamos el documento del profesional (rating promedio y conteo)
        transaction.update(professionalRef, {
          calificacion: newRating,
          reviews: newReviews,
        });

        // 🚨 CORRECCIÓN CLAVE: Actualizamos la cita con el estado y los detalles de la reseña
        transaction.update(appointmentRef, {
          status: "calificada",
          reviewRating: rating, // 💡 GUARDAMOS LA CALIFICACIÓN ESPECÍFICA
          reviewComment: comment.trim(), // 💡 GUARDAMOS EL TEXTO DEL COMENTARIO
          reviewDate: serverTimestamp(), // 💡 GUARDAMOS LA FECHA DE RESEÑA
        });
      });

      setLoading(false);
      Alert.alert(
        "¡Gracias por tu opinión!",
        "Tu calificación ha sido enviada y ayudará a otros pacientes."
      );
      navigation.goBack();
    } catch (error) {
      console.error("Error al enviar la calificación: ", error);
      setLoading(false);
      Alert.alert(
        "Error",
        "No se pudo enviar tu calificación. Intenta de nuevo."
      );
    }
  };

  return (
    <View
      style={{ flex: 1, backgroundColor: "#f0f0f0", paddingTop: insets.top }}
    >
      {/* Encabezado */}
      <View className="flex-row items-center px-4 py-3 bg-az-primario rounded-b-lg shadow-md">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back-outline" size={28} color="#FFFFFF" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-texto-claro ml-4">
          Calificar Servicio
        </Text>
      </View>

      <ScrollView className="flex-1 p-4">
        {/* Resumen */}
        <View className="bg-white p-4 rounded-xl shadow-md mb-6 border border-gris-acento items-center">
          <Text className="text-sm text-gray-500 mb-1">
            Estás calificando a:
          </Text>
          <Text className="text-xl font-bold text-texto-oscuro">
            {professionalName}
          </Text>
        </View>

        {/* 1. Selección de Estrellas */}
        <View className="bg-white p-4 rounded-xl shadow-md mb-6 border border-gris-acento">
          <Text className="text-lg font-bold text-az-primario mb-1 text-center">
            Tu Calificación
          </Text>
          <StarRating rating={rating} setRating={setRating} />
        </View>

        {/* 2. Comentario */}
        <View className="bg-white p-4 rounded-xl shadow-md mb-6 border border-gris-acento">
          <Text className="text-lg font-bold text-az-primario mb-3">
            Deja un Comentario
          </Text>
          <TextInput
            className="w-full border border-gris-acento rounded-lg px-4 py-3 bg-fondo-claro text-texto-oscuro h-32"
            placeholder="¿Cómo fue tu experiencia con el profesional?"
            placeholderTextColor={PLACEHOLDER_COLOR}
            multiline
            textAlignVertical="top"
            value={comment}
            onChangeText={setComment}
          />
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Botón de Acción Flotante */}
      <View
        className="w-full p-4 bg-white border-t border-gris-acento shadow-xl absolute bottom-0"
        style={{ paddingBottom: insets.bottom }} // 💡 APLICAMOS EL INSET INFERIOR
      >
        <TouchableOpacity
          className="bg-az-primario rounded-full py-4 shadow-lg items-center"
          onPress={handleSubmitReview}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text className="text-texto-claro text-lg font-bold">
              Enviar Calificación
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default RatingScreen;
