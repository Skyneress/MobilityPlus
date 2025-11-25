import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
// 💡 1. Importar funciones de Firestore y el hook de Auth
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
} from "firebase/firestore";
import { db } from "../../config/firebaseConfig";
import { useAuth } from "../../context/AuthContext";
// 💡 IMPORTACIÓN CLAVE: Debes tener este hook
import { useSafeAreaInsets } from "react-native-safe-area-context";

const PRIMARY_COLOR = "#3A86FF";
const TEXT_DARK = "#1F2937";
const GRAY_ACCENT = "#E5E7EB";
const WARNING_COLOR = "#FF9800"; // Naranja para estados en curso
const SUCCESS_COLOR = "#4CAF50"; // Verde para completadas

// --- Función auxiliar para renderizar el encabezado de la sección ---
const ScheduleHeader = ({ date }) => (
  <View className="px-4 py-2 mt-4 mb-2 bg-gris-acento rounded-lg">
    <Text className="text-sm font-bold text-texto-oscuro">{date}</Text>
  </View>
);

// --- Componente para una cita individual (sin cambios) ---
const AppointmentCard = ({ appointment, onPressDetail }) => {
  let statusColor, statusBg, statusText, statusIcon;

  switch (appointment.status) {
    case "aceptada":
    case "en_camino":
    case "en_proceso":
      statusColor = WARNING_COLOR;
      statusBg = "bg-advertencia-naranja/10";
      statusText = appointment.status.toUpperCase().replace("_", " ");
      statusIcon = "time-outline";
      break;
    case "completada":
      statusColor = SUCCESS_COLOR;
      statusBg = "bg-exito-verde/10";
      statusText = "COMPLETADA";
      statusIcon = "checkmark-done-outline";
      break;
    default:
      statusColor = TEXT_DARK;
      statusBg = "bg-gray-300/50";
      statusText = appointment.status.toUpperCase();
      statusIcon = "alert-circle-outline";
  }

  return (
    <TouchableOpacity
      className="bg-white p-4 rounded-xl shadow-sm mb-3 border border-gris-acento/50"
      onPress={() => onPressDetail(appointment)} // 💡 USA la función de callback
    >
      <View className="flex-row justify-between items-center mb-2 border-b border-gris-acento/50 pb-2">
        <Text className="text-lg font-bold text-az-primario">
          {appointment.requestedDate}
        </Text>

        <View
          className={`flex-row items-center px-3 py-1 rounded-full ${statusBg}`}
        >
          <Ionicons name={statusIcon} size={14} color={statusColor} />

          <Text className={`text-xs ml-1`} style={{ color: statusColor }}>
            {statusText}
          </Text>
        </View>
      </View>

      <Text className="text-base font-semibold text-texto-oscuro mt-1">
        {appointment.patientName}
      </Text>

      <View className="flex-row items-center mt-1">
        <Ionicons name="location-outline" size={14} color="#6B7280" />

        <Text className="text-sm text-gray-600 ml-1">
          {appointment.address}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

// --- Componente Principal de la Agenda ---
const NurseScheduleScreen = ({ navigation }) => {
  const { user } = useAuth(); // Obtenemos el enfermero logueado
  // 💡 OBTENER LOS INSETS
  const insets = useSafeAreaInsets();

  const [loading, setLoading] = useState(true);
  const [activeAppointments, setActiveAppointments] = useState([]); // Citas Aceptadas, En Camino, En Proceso
  const [completedAppointments, setCompletedAppointments] = useState([]);

  const handleAppointmentClick = (appointment) => {
    if (["aceptada", "en_camino", "en_proceso"].includes(appointment.status)) {
      // Citas activas van al flujo de servicio
      navigation.navigate("ServiceFlow", {
        appointment: appointment,
      });
    } else if (appointment.status === "completada") {
      // 🚨 Citas completadas van directamente a la Bitácora del paciente
      if (appointment.patientUid && appointment.patientName) {
        navigation.navigate("NursePatientLog", {
          patientUid: appointment.patientUid,
          patientName: appointment.patientName,
        });
      } else {
        Alert.alert(
          "Error",
          "Datos del paciente incompletos para ver la bitácora."
        );
      }
    } else {
      Alert.alert("Estado Desconocido", `Estado: ${appointment.status}`);
    }
  };

  // 💡 2. useEffect para escuchar las citas en tiempo real (sin cambios)
  useEffect(() => {
    if (!user) return;

    setLoading(true); // Consulta para citas ACTIVAS
    const qActive = query(
      collection(db, "citas"),
      where("nurseUid", "==", user.uid),
      where("status", "in", ["aceptada", "en_camino", "en_proceso"]),
      orderBy("createdAt", "desc")
    ); // Consulta para citas COMPLETADAS
    const qCompleted = query(
      collection(db, "citas"),
      where("nurseUid", "==", user.uid),
      where("status", "==", "completada"),
      orderBy("createdAt", "desc")
    );

    const unsubscribeActive = onSnapshot(
      qActive,
      (querySnapshot) => {
        const appointments = [];
        querySnapshot.forEach((doc) => {
          appointments.push({ id: doc.id, ...doc.data() });
        });
        setActiveAppointments(appointments);
        setLoading(false);
      },
      (error) => {
        console.error("Error al cargar citas activas: ", error);
        Alert.alert("Error", "No se pudo cargar la agenda.");
      }
    );

    const unsubscribeCompleted = onSnapshot(
      qCompleted,
      (querySnapshot) => {
        const appointments = [];
        querySnapshot.forEach((doc) => {
          appointments.push({ id: doc.id, ...doc.data() });
        });
        setCompletedAppointments(appointments);
      },
      (error) => {
        console.error("Error al cargar citas completadas: ", error);
      }
    ); // Limpiamos los 'oyentes'

    return () => {
      unsubscribeActive();
      unsubscribeCompleted();
    };
  }, [user]);

  return (
    <View
      style={{ flex: 1, backgroundColor: "#f0f0f0", paddingTop: insets.top }}
    >
      {/* Encabezado */}
      <View className="flex-row justify-between items-center px-4 py-3 bg-az-primario rounded-b-lg shadow-md">
    {/*     <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back-outline" size={28} color="#FFFFFF" />
        </TouchableOpacity>
 */}
        <Text className="text-xl font-bold text-texto-claro">
          Mi Agenda de Citas
        </Text>

{/*         <TouchableOpacity
          onPress={() => Alert.alert("Filtro", "Aplicando filtro de citas")}
        >
          <Ionicons name="filter-outline" size={28} color="#FFFFFF" />
        </TouchableOpacity> */}
      </View>

      <ScrollView className="flex-1 p-4">
        {loading ? (
          <ActivityIndicator
            size="large"
            color={PRIMARY_COLOR}
            className="mt-10"
          />
        ) : (
          <>
            {/* Citas ACTIVAS (Aceptadas, En Camino, En Proceso) */}
            <ScheduleHeader date="Servicios en Curso" />

            {activeAppointments.length > 0 ? (
              activeAppointments.map((appointment) => (
                <AppointmentCard
                  key={appointment.id}
                  appointment={appointment}
                  onPressDetail={handleAppointmentClick}
                />
              ))
            ) : (
              <Text className="text-center text-gray-500 mt-4">
                No tienes servicios en curso.
              </Text>
            )}
            {/* Citas Completadas (Historial) */}
            <ScheduleHeader date="Citas Completadas" />

            {completedAppointments.length > 0 ? (
              completedAppointments.map((appointment) => (
                <AppointmentCard
                  key={appointment.id}
                  appointment={appointment}
                  onPressDetail={handleAppointmentClick}
                />
              ))
            ) : (
              <Text className="text-center text-gray-500 mt-4">
                No tienes historial de citas completadas.
              </Text>
            )}
          </>
        )}
      </ScrollView>
      {/* Barra de Navegación Inferior (Tab Bar) */}
      <View
        className="flex-row justify-around items-center bg-white border-t border-gris-acento pt-2 pb-4 shadow-xl"
        style={{ paddingBottom: insets.bottom }} // 💡 APLICAMOS EL INSET INFERIOR
      >
        <TouchableOpacity
          className="items-center"
          onPress={() => navigation.navigate("NurseHome")}
        >
          <Ionicons name="home-outline" size={24} color="#9ca3af" />
          <Text className="text-gray-400 text-xs">Panel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="items-center"
          onPress={() => navigation.navigate("NurseSchedule")}
        >
          <Ionicons name="calendar" size={24} color={PRIMARY_COLOR} />

          <Text className="text-az-primario text-xs font-semibold">Agenda</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="items-center"
          onPress={() => navigation.navigate("ChatList")}
        >
          <Ionicons name="chatbubbles-outline" size={24} color="#9ca3af" />
          <Text className="text-gray-400 text-xs">Mensajes</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="items-center"
          onPress={() => navigation.navigate("NurseProfile")}
        >
          <Ionicons name="person-outline" size={24} color="#9ca3af" />
          <Text className="text-gray-400 text-xs">Perfil</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default NurseScheduleScreen;
