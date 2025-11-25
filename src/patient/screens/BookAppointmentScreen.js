import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView, // Mantener ScrollView, eliminando SafeAreaView de la raíz
  Alert,
  TextInput,
  ActivityIndicator,
  Platform,
  Linking, // Añadido para la gestión de permisos de ubicación
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { Picker } from "@react-native-picker/picker";
import {
  collection,
  addDoc,
  serverTimestamp,
  GeoPoint,
} from "firebase/firestore";
import { db } from "../../config/firebaseConfig";
import { useAuth } from "../../context/AuthContext";
import * as Location from "expo-location";
import DateTimePicker from "@react-native-community/datetimepicker";
// 💡 IMPORTACIÓN CLAVE para las zonas seguras
import { useSafeAreaInsets } from "react-native-safe-area-context";

const PRIMARY_COLOR = "#3A86FF";
const TEXT_DARK = "#1F2937";
const PLACEHOLDER_COLOR = "#9ca3af";

// Servicio fallback siempre válido
const FALLBACK_SERVICE = {
  idServicio: "fallback",
  nombre: "Selecciona un servicio...",
  precioClp: 0,
};

/* -------------------------------
 NORMALIZADOR DE SERVICIOS
 ------------------------------- */
const normalizeServices = (raw) => {
  if (!Array.isArray(raw)) return [];

  return raw.map((s, index) => {
    // CASO 2 → servicios incompletos pero tipo objeto
    return {
      idServicio: s.idServicio || `srv_${index}`,
      nombre: s.nombre || `Servicio ${index + 1}`,
      precioClp: Number(s.precioClp) || 0,
    };
  });
};

// Formateo de precio
const formatPrice = (price) => {
  const num = Number(price);
  if (isNaN(num)) return "N/A";
  return num.toLocaleString("es-CL");
};

const BookAppointmentScreen = ({ route, navigation }) => {
  const { professional } = route.params;
  const { userId, userProfile } = useAuth();
  // 💡 OBTENER LOS INSETS
  const insets = useSafeAreaInsets(); /* -------------------------------
  NORMALIZAR SERVICIOS AQUÍ
  ------------------------------- */

  const servicesList = normalizeServices(professional.servicios);

  const [selectedServiceData, setSelectedServiceData] = useState(
    servicesList[0] || FALLBACK_SERVICE
  ); // Estados de ubicación

  const [address, setAddress] = useState(userProfile?.direccion || "");
  const [locationCoords, setLocationCoords] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [locationStatus, setLocationStatus] = useState("pending"); // Estados de formulario

  const [medicalNotes, setMedicalNotes] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false); // Fecha y hora

  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [pickerMode, setPickerMode] = useState("date");
  const [appointmentDateText, setAppointmentDateText] = useState("");
  const [appointmentTimeText, setAppointmentTimeText] =
    useState(""); /* -------------------------------
  PICKER FUNCIONAL
  ------------------------------- */

  const handleServicePickerChange = (serviceId) => {
    const service =
      servicesList.find((s) => s.idServicio === serviceId) || FALLBACK_SERVICE;
    setSelectedServiceData(service);
  }; /* -------------------------------
  GPS
  ------------------------------- */

  const handleGetLocation = async () => {
    setLoadingLocation(true);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setLocationStatus("denied");
        Alert.alert(
          "Permiso Denegado",
          "No podemos obtener tu ubicación. Por favor, ingresa tu dirección manualmente o habilita el permiso en la configuración.",
          [
            { text: "OK", style: "cancel" },
            {
              text: "Ir a Configuración",
              onPress: () => Linking.openSettings(),
            }, // 💡 LÍNEA CLAVE
          ]
        );
        return;
      }

      setAddress("Obteniendo ubicación...");
      setLocationStatus("fetching");
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      const { latitude, longitude } = location.coords;

      setLocationCoords(new GeoPoint(latitude, longitude));

      let addressResult = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });
      if (addressResult.length > 0) {
        const { street, city, region } = addressResult[0];
        setAddress(`${street}, ${city}, ${region}`);
      }

      setLocationStatus("success");
    } catch (error) {
      console.error("Error al obtener ubicación:", error);
      setLocationStatus("error");
      Alert.alert(
        "Error",
        "No se pudo obtener la ubicación. Intenta de nuevo."
      );
    } finally {
      setLoadingLocation(false);
    }
  };

  useEffect(() => {
    if (Platform.OS !== "web") handleGetLocation();
    else setLocationStatus("success");
  }, []); /* -------------------------------
  FECHA Y HORA (NATIVO)
  ------------------------------- */

  const onChangeNative = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowPicker(Platform.OS === "ios" ? true : false);
    if (event.type === "set" && selectedDate) {
      setDate(currentDate);
      setAppointmentDateText(currentDate.toLocaleDateString("es-ES"));
      setAppointmentTimeText(
        currentDate.toLocaleTimeString("es-ES", {
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    }
  }; /* -------------------------------
  CONFIRMAR CITA
  ------------------------------- */

  const handleConfirmBooking = async () => {
    if (!userId) {
      Alert.alert("Error", "No se pudo identificar al usuario.");
      return;
    }
    if (selectedServiceData.idServicio === FALLBACK_SERVICE.idServicio) {
      Alert.alert("Campos incompletos", "Selecciona un servicio válido.");
      return;
    }
    if (!address || address.trim().length < 5) {
      Alert.alert(
        "Campos incompletos",
        "Debes especificar la dirección del servicio (mín. 5 caracteres)."
      );
      return;
    }

    // Si la dirección fue escrita manualmente, podemos proceder.
    // Solo validamos si la ubicación GPS fue requerida pero falló y la dirección quedó vacía.

    let finalTimestamp = date;
    let finalRequestedDate = date.toLocaleString("es-ES", {
      dateStyle: "long",
      timeStyle: "short",
    });

    if (Platform.OS === "web") {
      if (!appointmentDateText || !appointmentTimeText) {
        Alert.alert("Campos incompletos", "Debes ingresar fecha y hora.");
        return;
      }
      finalRequestedDate = `${appointmentDateText} - ${appointmentTimeText}`;
      finalTimestamp = serverTimestamp();
    }

    setBookingLoading(true);

    try {
      await addDoc(collection(db, "citas"), {
        patientUid: userId,
        nurseUid: professional.uid,

        patientName: `${userProfile?.nombre} ${userProfile?.apellido}`,
        nurseName: `${professional.nombre} ${professional.apellido}`,

        serviceType: selectedServiceData.nombre,
        price: selectedServiceData.precioClp,

        address, // 💡 Si no se obtuvo con éxito, guardamos null
        location: locationStatus === "success" ? locationCoords : null,

        notes: medicalNotes,
        appointmentTimestamp: finalTimestamp,
        requestedDate: finalRequestedDate,

        createdAt: serverTimestamp(),
        status: "pendiente",
      });

      setBookingLoading(false);
      Alert.alert(
        "¡Solicitud enviada!",
        "Tu cita ha sido enviada correctamente."
      );
      navigation.navigate("PatientHome");
    } catch (err) {
      console.error("Error creando cita:", err);
      setBookingLoading(false);
      Alert.alert("Error", "No se pudo crear la cita.");
    }
  }; /* -------------------------------
  UI
  ------------------------------- */

  return (
    <View
      style={{ flex: 1, backgroundColor: "#f0f0f0", paddingTop: insets.top }}
    >
      {/* HEADER */}
      <View className="flex-row items-center px-4 py-3 bg-az-primario rounded-b-lg shadow-md">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back-outline" size={28} color="#FFFFFF" />
        </TouchableOpacity>

        <Text className="text-xl font-bold text-texto-claro ml-4">
          Reservar Cita
        </Text>
      </View>

      <ScrollView className="flex-1 p-4">
        {/* PROFESIONAL */}
        <View className="bg-white p-4 rounded-xl shadow-md mb-6 border border-gris-acento">
          <Text className="text-sm text-gray-500 mb-1">
            Estás reservando con:
          </Text>

          <Text className="text-xl font-bold text-texto-oscuro">
            {professional.nombre} {professional.apellido}
          </Text>

          <Text className="text-base text-az-primario">
            {professional.especialidadNombre || professional.especialidad}
          </Text>
        </View>
        {/* SERVICIOS */}
        <View className="bg-white p-4 rounded-xl shadow-md mb-6 border border-gris-acento">
          <Text className="text-lg font-bold text-az-primario mb-3">
            1. Selecciona el Servicio
          </Text>

          <View className="w-full border border-gris-acento rounded-lg bg-fondo-claro overflow-hidden">
            <Picker
              selectedValue={selectedServiceData.idServicio}
              onValueChange={handleServicePickerChange}
              style={{ height: 50, color: TEXT_DARK }}
            >
              <Picker.Item
                label={FALLBACK_SERVICE.nombre}
                value={FALLBACK_SERVICE.idServicio}
              />

              {servicesList.map((srv) => (
                <Picker.Item
                  key={srv.idServicio}
                  label={`${srv.nombre} ($${formatPrice(srv.precioClp)} CLP)`}
                  value={srv.idServicio}
                />
              ))}
            </Picker>
          </View>
        </View>
        {/* FECHA Y HORA */}
        <View className="bg-white p-4 rounded-xl shadow-md mb-6 border border-gris-acento">
          <Text className="text-lg font-bold text-az-primario mb-3">
            2. Elige Fecha y Hora
          </Text>

          {Platform.OS === "web" ? (
            <>
              <TextInput
                className="w-full border border-gris-acento rounded-lg px-4 py-3 bg-fondo-claro mb-3"
                placeholder="Fecha (Ej: 20 de Noviembre)"
                placeholderTextColor={PLACEHOLDER_COLOR}
                value={appointmentDateText}
                onChangeText={setAppointmentDateText}
              />

              <TextInput
                className="w-full border border-gris-acento rounded-lg px-4 py-3 bg-fondo-claro"
                placeholder="Hora (Ej: 14:30 PM)"
                placeholderTextColor={PLACEHOLDER_COLOR}
                value={appointmentTimeText}
                onChangeText={setAppointmentTimeText}
              />
            </>
          ) : (
            <View className="flex-row space-x-2">
              <TouchableOpacity
                onPress={() => setShowPicker(true) || setPickerMode("date")}
                className="flex-1 bg-fondo-claro border border-gris-acento rounded-lg p-3 items-center"
              >
                <Text className="text-texto-oscuro font-semibold">
                  Fecha: {date.toLocaleDateString("es-ES")}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setShowPicker(true) || setPickerMode("time")}
                className="flex-1 bg-fondo-claro border border-gris-acento rounded-lg p-3 items-center"
              >
                <Text className="text-texto-oscuro font-semibold">
                  Hora:
                  {date.toLocaleTimeString("es-ES", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
        {/* UBICACIÓN */}
        <View className="bg-white p-4 rounded-xl shadow-md mb-6 border border-gris-acento">
          <Text className="text-lg font-bold text-az-primario mb-3">
            3. Ubicación del Servicio
          </Text>

          <TextInput
            className="w-full border border-gris-acento rounded-lg px-4 py-3 bg-fondo-claro mb-3"
            placeholder={
              Platform.OS === "web"
                ? "Ingresa tu dirección"
                : "Dirección obtenida por GPS"
            }
            placeholderTextColor={PLACEHOLDER_COLOR}
            value={address}
            onChangeText={setAddress}
            editable={locationStatus !== "fetching"}
          />

          {Platform.OS !== "web" && (
            <TouchableOpacity
              className={`rounded-full py-3 mt-3 flex-row justify-center items-center border ${locationStatus === "success" ? "bg-green-50 border-green-400" : "bg-az-primario/10 border-az-primario"}`}
              onPress={handleGetLocation}
              disabled={loadingLocation}
            >
              {loadingLocation ? (
                <ActivityIndicator color={PRIMARY_COLOR} />
              ) : (
                <>
                  <Ionicons
                    name="locate-outline"
                    size={20}
                    color={
                      locationStatus === "success" ? "#10B981" : PRIMARY_COLOR
                    }
                  />

                  <Text
                    className={`font-semibold text-base ml-2 ${locationStatus === "success" ? "text-green-600" : "text-az-primario"}`}
                  >
                    {locationStatus === "success"
                      ? "Ubicación lista"
                      : "Obtener Ubicación"}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>
        {/* NOTAS */}
        <View className="bg-white p-4 rounded-xl shadow-md mb-6 border border-gris-acento">
          <Text className="text-lg font-bold text-az-primario mb-3">
            4. Notas Adicionales (Opcional)
          </Text>

          <TextInput
            className="w-full border border-gris-acento rounded-lg px-4 py-3 bg-fondo-claro h-24"
            multiline
            textAlignVertical="top"
            placeholder="Describe tu necesidad..."
            placeholderTextColor={PLACEHOLDER_COLOR}
            value={medicalNotes}
            onChangeText={setMedicalNotes}
          />
        </View>
        {/* RESUMEN DE COSTO */}
        <View className="flex-row justify-between items-center bg-white p-4 rounded-xl shadow-md mb-20 border border-gris-acento">
          <Text className="text-lg font-bold text-texto-oscuro">
            Costo: {selectedServiceData.nombre}
          </Text>

          <Text className="text-xl font-bold text-exito-verde">
            ${formatPrice(selectedServiceData.precioClp)} CLP
          </Text>
        </View>
      </ScrollView>
      {/* PICKER NATIVO */}
      {showPicker && (
        <DateTimePicker
          value={date}
          mode={pickerMode}
          is24Hour={false}
          display="default"
          onChange={(e, selected) => {
            const current = selected || date;
            setShowPicker(false);
            setDate(current);
          }}
        />
      )}
      {/* BOTÓN FINAL */}
      <View
        className="w-full p-4 bg-white border-t border-gris-acento shadow-xl"
        style={{ paddingBottom: insets.bottom }} // 💡 APLICAMOS EL INSET INFERIOR
      >
        <TouchableOpacity
          className="bg-az-primario rounded-full py-4 shadow-lg items-center"
          onPress={handleConfirmBooking}
          disabled={bookingLoading}
        >
          {bookingLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text className="text-texto-claro text-lg font-bold">
              Confirmar Solicitud
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default BookAppointmentScreen;
