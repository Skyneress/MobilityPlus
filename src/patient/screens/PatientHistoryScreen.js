import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../config/firebaseConfig";
import { useAuth } from "../../context/AuthContext";

const PRIMARY_COLOR = "#3A86FF";
const TEXT_DARK = "#1F2937";
const GRAY_ACCENT = "#E5E7EB";
const WARNING_COLOR = "#FF9800"; // Naranja

// --- Componente de Tarjeta de Cita (ACTUALIZADO CON FLUJO DE ESTADOS Y BITÁCORA) ---
const AppointmentCard = ({
  appointment,
  onCancel,
  onReview,
  onChat,
  onViewLog,
}) => {
  // 💡 Definición de Nuevos y Viejos Estados
  const status = appointment.status;

  let statusText;
  let statusColorClass;
  let statusDisplayColor; // Para colores directos

  switch (status) {
    case "pendiente":
      statusText = "Pendiente de Aprobación";
      statusColorClass = "text-advertencia-naranja";
      statusDisplayColor = WARNING_COLOR;
      break;
    case "aceptada":
      statusText = "Aceptada por Profesional";
      statusColorClass = "text-blue-500";
      statusDisplayColor = "#3B82F6"; // Azul
      break;
    case "en_camino": // NUEVO ESTADO
      statusText = "¡Profesional en Camino! 🚗";
      statusColorClass = "text-az-primario";
      statusDisplayColor = PRIMARY_COLOR;
      break;
    case "en_proceso": // NUEVO ESTADO
      statusText = "Servicio en Curso 🩺";
      statusColorClass = "text-exito-verde";
      statusDisplayColor = "#4CAF50";
      break;
    case "completada":
      statusText = "Completado (Pendiente Review)";
      statusColorClass = "text-exito-verde";
      statusDisplayColor = "#4CAF50";
      break;
    case "calificada":
      statusText = "Completado y Calificado";
      statusColorClass = "text-gray-500";
      statusDisplayColor = "#6B7280";
      break;
    case "cancelada":
      statusText = "Cancelado";
      statusColorClass = "text-error-rojo";
      statusDisplayColor = "#EF4444";
      break;
    default:
      statusText = "Estado Desconocido";
      statusColorClass = "text-gray-400";
      statusDisplayColor = "#9CA3AF";
  }

  const isPendingOrAccepted = [
    "pendiente",
    "aceptada",
    "en_camino",
    "en_proceso",
  ].includes(status);
  const isCompleted = ["completada", "calificada"].includes(status);

  // Si está en el flujo activo, tiene un borde de color
  const isFlowing = ["aceptada", "en_camino", "en_proceso"].includes(status);

  return (
    <View
      className="bg-white p-4 rounded-xl shadow-md mb-3 border"
      style={{ borderColor: isFlowing ? statusDisplayColor : GRAY_ACCENT }}
    >
      {/* Encabezado: Fecha y Estado */}
      <View className="flex-row justify-between items-start mb-3 border-b border-gris-acento/50 pb-2">
        <View>
          <Text className="text-sm text-gray-500">
            {appointment.requestedDate}
          </Text>
          <Text className="text-lg font-bold text-texto-oscuro mt-1">
            {appointment.serviceType}
          </Text>
        </View>
        <Text
          className={`text-sm font-semibold`}
          style={{ color: statusDisplayColor }}
        >
          {statusText}
        </Text>
      </View>

      {/* Profesional y Botón de Chat */}
      <View className="flex-row justify-between items-center mb-4">
        <TouchableOpacity onPress={() => onChat(appointment)}>
          <Text className="text-sm text-gray-600">Profesional:</Text>
          <View className="flex-row items-center">
            <Text className="text-base font-semibold text-az-primario">
              {appointment.nurseName}
            </Text>
            <Ionicons
              name="chatbubble-ellipses-outline"
              size={16}
              color={PRIMARY_COLOR}
              className="ml-2"
            />
          </View>
        </TouchableOpacity>
      </View>

      {/* Botones de Acción */}
      <View className="flex-row space-x-2 pt-2 border-t border-gris-acento/50 justify-end">
        {/* Cancelar (Si está pendiente, aceptada o en camino) */}
        {isPendingOrAccepted &&
          status !== "en_proceso" && ( // No cancelar si está en proceso
            <TouchableOpacity
              className="bg-error-rojo/10 px-3 py-2 rounded-full border border-error-rojo"
              onPress={() => onCancel(appointment.id)}
            >
              <Text className="text-error-rojo text-xs font-semibold">
                Cancelar Cita
              </Text>
            </TouchableOpacity>
          )}

        {/* Dejar Review (Si está completada, pero no calificada) */}
        {status === "completada" && (
          <TouchableOpacity
            className="bg-az-primario/10 px-3 py-2 rounded-full border border-az-primario/20"
            onPress={() => onReview(appointment)}
          >
            <Text className="text-az-primario text-xs font-semibold">
              Dejar Review
            </Text>
          </TouchableOpacity>
        )}

        {/* Ver Bitácora (Si está completada o calificada) */}
        {isCompleted && (
          <TouchableOpacity
            className="bg-exito-verde/10 px-3 py-2 rounded-full border border-exito-verde/20"
            onPress={() => onViewLog(appointment)} // 💡 NUEVA ACCIÓN
          >
            <Text
              style={{ color: "#4CAF50" }}
              className="text-xs font-semibold"
            >
              Ver Notas
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const PatientHistoryScreen = ({ navigation }) => {
  const { userId } = useAuth();
  const [tab, setTab] = useState("pending");
  const [loading, setLoading] = useState(true);
  const [pendingAppointments, setPendingAppointments] = useState([]);
  const [completedAppointments, setCompletedAppointments] = useState([]);

  // 💡 Lógica de Navegación a Bitácora (Nueva)
  const handleViewLog = (appointment) => {
    navigation.navigate("PatientJobLog", {
      appointmentId: appointment.id,
      patientUid: userId, // Necesario para la subcolección
      professionalName: appointment.nurseName,
      serviceType: appointment.serviceType,
    });
  };

  // useEffect para escuchar las citas en tiempo real (ACTUALIZADO)
  useEffect(() => {
    if (!userId) return;
    setLoading(true);

    // 💡 Consulta para citas ACTIVAS (PENDIENTES, ACEPTADAS, EN CAMINO, EN PROCESO)
    const qPending = query(
      collection(db, "citas"),
      where("patientUid", "==", userId),
      where("status", "in", [
        "pendiente",
        "aceptada",
        "en_camino",
        "en_proceso",
      ]),
      orderBy("createdAt", "desc")
    );

    // Consulta para citas HISTORIAL (COMPLETADAS, CANCELADAS o CALIFICADAS)
    const qHistory = query(
      collection(db, "citas"),
      where("patientUid", "==", userId),
      where("status", "in", ["completada", "cancelada", "calificada"]),
      orderBy("createdAt", "desc")
    );

    // Oyente para activas
    const unsubscribePending = onSnapshot(
      qPending,
      (querySnapshot) => {
        const appointments = [];
        querySnapshot.forEach((doc) => {
          appointments.push({ id: doc.id, ...doc.data() });
        });
        setPendingAppointments(appointments);
        setLoading(false);
      },
      (error) => {
        console.error("Error al cargar citas activas: ", error);
      }
    );

    // Oyente para historial
    const unsubscribeHistory = onSnapshot(
      qHistory,
      (querySnapshot) => {
        const appointments = [];
        querySnapshot.forEach((doc) => {
          appointments.push({ id: doc.id, ...doc.data() });
        });
        setCompletedAppointments(appointments);
      },
      (error) => {
        console.error("Error al cargar historial: ", error);
      }
    );
    return () => {
      unsubscribePending();
      unsubscribeHistory();
    };
  }, [userId]);

  // Lógica de Cancelación (sin cambios)
  const handleCancel = (id) => {
    const cancelInFirebase = async () => {
      try {
        const appointmentRef = doc(db, "citas", id);
        await updateDoc(appointmentRef, { status: "cancelada" });
        Alert.alert("Éxito", "Tu cita ha sido cancelada.");
      } catch (error) {
        console.error("Error al cancelar la cita: ", error);
        Alert.alert("Error", "No se pudo cancelar la cita. Intenta de nuevo.");
      }
    };

    if (Platform.OS === "web") {
      if (window.confirm("¿Estás seguro de que quieres cancelar esta cita?")) {
        cancelInFirebase();
      }
    } else {
      Alert.alert(
        "Confirmar Cancelación",
        "¿Estás seguro de que quieres cancelar esta cita?",
        [
          { text: "No", style: "cancel" },
          {
            text: "Sí, Cancelar",
            style: "destructive",
            onPress: cancelInFirebase,
          },
        ]
      );
    }
  };

  // Lógica de Review (sin cambios)
  const handleReview = (appointment) => {
    navigation.navigate("Rating", {
      appointmentId: appointment.id,
      professionalId: appointment.nurseUid,
      professionalName: appointment.nurseName,
    });
  };

  // Lógica de Chat (sin cambios)
  const handleChat = (appointment) => {
    navigation.navigate("Chat", {
      chatWithUser: {
        id: appointment.nurseUid,
        name: appointment.nurseName,
        role: "Profesional",
      },
    });
  };

  // ------------------------- RENDERIZADO -------------------------
  return (
    <SafeAreaView className="flex-1 bg-fondo-claro">
      {/* Encabezado (sin cambios) */}
      <View className="flex-row items-center px-4 py-5 bg-az-primario rounded-b-lg shadow-md">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back-outline" size={28} color="#FFFFFF" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-texto-claro ml-4">
          Mis Citas y Historial
        </Text>
      </View>

      {/* Selector de Pestañas (sin cambios) */}
      <View className="flex-row mx-4 mt-4 bg-white rounded-xl p-1 shadow-sm border border-gris-acento">
        <TouchableOpacity
          className={`flex-1 items-center py-2 rounded-lg ${tab === "pending" ? "bg-az-primario" : "bg-white"}`}
          onPress={() => setTab("pending")}
        >
          <Text
            className={`font-semibold ${tab === "pending" ? "text-texto-claro" : "text-texto-oscuro"}`}
          >
            Activas ({pendingAppointments.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className={`flex-1 items-center py-2 rounded-lg ${tab === "completed" ? "bg-az-primario" : "bg-white"}`}
          onPress={() => setTab("completed")}
        >
          <Text
            className={`font-semibold ${tab === "completed" ? "text-texto-claro" : "text-texto-oscuro"}`}
          >
            Historial ({completedAppointments.length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 p-4 pt-0">
        <View className="mt-4">
          {loading ? (
            <ActivityIndicator
              size="large"
              color={PRIMARY_COLOR}
              className="mt-10"
            />
          ) : (
            <>
              {tab === "pending" && (
                <>
                  {pendingAppointments.length === 0 ? (
                    <Text className="text-center text-gray-500 mt-10">
                      ¡Genial! No tienes citas activas.
                    </Text>
                  ) : (
                    pendingAppointments.map((app) => (
                      <AppointmentCard
                        key={app.id}
                        appointment={app}
                        onCancel={handleCancel}
                        onChat={handleChat}
                        onViewLog={handleViewLog} // Añadida aunque no se usa en este tab
                      />
                    ))
                  )}
                </>
              )}

              {tab === "completed" && (
                <>
                  {completedAppointments.length === 0 ? (
                    <Text className="text-center text-gray-500 mt-10">
                      Aún no tienes historial de citas.
                    </Text>
                  ) : (
                    completedAppointments.map((app) => (
                      <AppointmentCard
                        key={app.id}
                        appointment={app}
                        onReview={handleReview}
                        onChat={handleChat}
                        onViewLog={handleViewLog} // 💡 AÑADIDA ACCIÓN DE BITÁCORA
                      />
                    ))
                  )}
                </>
              )}
            </>
          )}
        </View>
      </ScrollView>

      {/* Barra de Navegación Inferior (sin cambios) */}
      <View className="flex-row justify-around items-center bg-white border-t border-gris-acento pt-2 pb-4 shadow-xl">
        <TouchableOpacity
          className="items-center"
          onPress={() => navigation.navigate("PatientHome")}
        >
          <Ionicons name="home-outline" size={24} color="#9ca3af" />
          <Text className="text-gray-400 text-xs">Home</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="items-center"
          onPress={() => navigation.navigate("PatientHistory")}
        >
          <Ionicons name="calendar" size={24} color={PRIMARY_COLOR} />
          <Text className="text-az-primario text-xs font-semibold">Citas</Text>
        </TouchableOpacity>
        <TouchableOpacity className="items-center" onPress={() => navigation.navigate('ChatList')}>
          <Ionicons name="chatbubbles-outline" size={24} color="#9ca3af" />
          <Text className="text-gray-400 text-xs">Mensajes</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="items-center"
          onPress={() => navigation.navigate("PatientProfile")}
        >
          <Ionicons name="person-outline" size={24} color="#9ca3af" />
          <Text className="text-gray-400 text-xs">Perfil</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default PatientHistoryScreen;
