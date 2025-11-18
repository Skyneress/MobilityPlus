import React, { useState, useEffect } from 'react';
import { 
  View, Text, TouchableOpacity, SafeAreaView, ScrollView, 
  Alert, Image, ActivityIndicator, Platform 
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons'; 
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { signOut } from 'firebase/auth';

import { auth, db, storage } from '../../config/firebaseConfig';
import { useAuth } from '../../context/AuthContext';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

import * as ImagePicker from 'expo-image-picker';

const PRIMARY_COLOR = "#3A86FF"; 
const TEXT_DARK = "#1F2937";
const GRAY_ACCENT = "#E5E7EB";

/* ─────────────────────────────────────────────
   COMPONENTE REUTILIZABLE PARA FILAS EDITABLES
────────────────────────────────────────────── */
const InfoRow = ({ icon, label, value, onPressEdit }) => (
  <View className="flex-row items-center justify-between py-3 border-b border-gris-acento/70">
    <View className="flex-row items-center flex-1">
      <Ionicons name={icon} size={20} color={PRIMARY_COLOR} />
      <View className="ml-4">
        <Text className="text-xs text-gray-500">{label}</Text>
        <Text className="text-base font-medium text-texto-oscuro">{value}</Text>
      </View>
    </View>
    <TouchableOpacity onPress={onPressEdit}>
      <Ionicons name="create-outline" size={24} color="#6B7280" />
    </TouchableOpacity>
  </View>
);



/* ─────────────────────────────────────────────
                 PANTALLA PRINCIPAL
────────────────────────────────────────────── */
const PatientProfileScreen = ({ navigation }) => {
  
  const { user, role } = useAuth();

  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);


  /* ╔══════════════════════════════════════╗
     ║      CARGAR PERFIL DESDE FIRESTORE   ║
     ╚══════════════════════════════════════╝ */
  useEffect(() => {
    if (user) {
      const fetchProfileData = async () => {
        setLoading(true);
        try {
          const docRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            setProfileData(docSnap.data());
          }
        } catch (error) {
          console.error("Error al cargar perfil:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchProfileData();
    }
  }, [user]);



  /* ╔══════════════════════════════════════╗
     ║         PICKER UNIVERSAL             ║
     ╚══════════════════════════════════════╝ */
  const pickImage = async () => {

    /* 🌐 WEB: usar input HTML */
    if (Platform.OS === "web") {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";

      input.onchange = async () => {
        const file = input.files[0];
        if (!file) return;
        await uploadBlobImage(file);
      };

      input.click();
      return;
    }

    /* 📱 MOBILE: usar expo-image-picker */
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permiso requerido", "Debes habilitar acceso a tu galería.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images, 
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (result.canceled) return;

    const { uri } = result.assets[0];
    await uploadImage(uri);
  };



  /* ╔══════════════════════════════════════╗
     ║     FUNCION SUBIR IMAGEN — MOBILE    ║
     ╚══════════════════════════════════════╝ */
  const uploadImage = async (uri) => {
    if (!user) return;
    setUploading(true);

    try {
      const response = await fetch(uri);
      const blob = await response.blob();

      const storageRef = ref(storage, `profile_pictures/${user.uid}.jpg`);
      await uploadBytes(storageRef, blob);

      const downloadURL = await getDownloadURL(storageRef);

      await updateUserPhoto(downloadURL);

      Alert.alert("¡Éxito!", "Tu foto de perfil ha sido actualizada.");
    } catch (error) {
      console.log("ERROR SUBIENDO IMAGEN:", error);
      Alert.alert("Error", "No se pudo subir la imagen.");
    } finally {
      setUploading(false);
    }
  };


  /* ╔══════════════════════════════════════╗
     ║     FUNCION SUBIR IMAGEN — WEB       ║
     ╚══════════════════════════════════════╝ */
  const uploadBlobImage = async (blob) => {
    if (!user) return;
    setUploading(true);

    try {
      const storageRef = ref(storage, `profile_pictures/${user.uid}.jpg`);
      await uploadBytes(storageRef, blob);

      const downloadURL = await getDownloadURL(storageRef);

      await updateUserPhoto(downloadURL);

      Alert.alert("Listo", "Tu foto de perfil fue actualizada.");
    } catch (e) {
      console.log("Error subiendo imagen web:", e);
    } finally {
      setUploading(false);
    }
  };


  /* ╔══════════════════════════════════════╗
     ║   ACTUALIZAR URL EN FIRESTORE        ║
     ╚══════════════════════════════════════╝ */
  const updateUserPhoto = async (url) => {
    const mainRef = doc(db, "users", user.uid);
    await updateDoc(mainRef, { fotoPerfil: url });

    if (role === "nurse") {
      const nurseRef = doc(db, "profesionales", user.uid);
      await updateDoc(nurseRef, { fotoPerfil: url });
    }

    setProfileData(prev => ({ ...prev, fotoPerfil: url }));
  };


  /* ╔══════════════════════════════════════╗
     ║                LOGOUT                ║
     ╚══════════════════════════════════════╝ */
  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      Alert.alert("Error", "No se pudo cerrar sesión.");
    }
  };



  /* ╔══════════════════════════════════════╗
     ║          LOADING DEL PERFIL          ║
     ╚══════════════════════════════════════╝ */
  if (loading || !profileData) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-fondo-claro">
        <ActivityIndicator size="large" color={PRIMARY_COLOR} />
      </SafeAreaView>
    );
  }



  /* ╔══════════════════════════════════════╗
     ║              RENDER UI                ║
     ╚══════════════════════════════════════╝ */
  return (
    <SafeAreaView className="flex-1 bg-fondo-claro">

      {/* Header */}
      <View className="flex-row items-center px-4 py-5 bg-az-primario rounded-b-lg shadow-md">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back-outline" size={28} color="#FFFFFF" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-texto-claro ml-4">Mi Perfil</Text>
      </View>

      <ScrollView className="flex-1 p-4">

        {/* FOTO DE PERFIL */}
        <View className="items-center py-6 bg-white rounded-xl shadow-md mb-6 border border-gris-acento">
      
          <TouchableOpacity onPress={pickImage} disabled={uploading}>
            <Image
              source={{
                uri: profileData.fotoPerfil ||
                  `https://placehold.co/150x150/EBF8FF/3A86FF?text=${profileData.nombre.charAt(0)}`
              }}
              className="w-24 h-24 rounded-full border-4 border-az-primario shadow-lg"
            />
            {uploading && (
              <View className="absolute inset-0 justify-center items-center bg-black/50 rounded-full">
                <ActivityIndicator color="#FFF" />
              </View>
            )}

            <View className="absolute bottom-0 right-0 bg-az-primario p-1 rounded-full border-2 border-white">
              <Ionicons name="camera-outline" size={16} color="#FFF" />
            </View>
          </TouchableOpacity>

          <Text className="text-2xl font-bold text-texto-oscuro mt-3">
            {profileData.nombre} {profileData.apellido}
          </Text>
          <Text className="text-base text-gray-500">
            {role === 'nurse' ? 'Profesional' : 'Paciente'}
          </Text>
        </View>



        {/* Acceso a Bitácora */}
        <View className="bg-white p-4 rounded-xl shadow-md mb-6 border border-gris-acento">
          <TouchableOpacity 
            className="flex-row items-center justify-between py-2"
            onPress={() => navigation.navigate('PatientLog')}
          >
            <View className="flex-row items-center">
              <Ionicons name="receipt-outline" size={24} color={PRIMARY_COLOR} />
              <Text className="text-lg font-semibold text-texto-oscuro ml-4">
                Ver Mi Bitácora Clínica
              </Text>
            </View>
            <Ionicons name="chevron-forward-outline" size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>



        {/* INFO DE SERVICIO */}
        <View className="bg-white p-4 rounded-xl shadow-md mb-6 border border-gris-acento">
          <Text className="text-lg font-bold text-az-primario mb-3">Información de Servicio</Text>

          <InfoRow 
            icon="location-outline"
            label="Dirección Principal"
            value={profileData.direccion || "No especificada"}
            onPressEdit={() => Alert.alert("Editar", "Editar Dirección")}
          />
        </View>



        {/* INFO PERSONAL */}
        <View className="bg-white p-4 rounded-xl shadow-md mb-6 border border-gris-acento">
          <Text className="text-lg font-bold text-az-primario mb-3">Datos Personales</Text>

          <InfoRow 
            icon="mail-outline"
            label="Correo Electrónico"
            value={profileData.email}
            onPressEdit={() => {}}
          />

          <InfoRow 
            icon="call-outline"
            label="Teléfono"
            value={profileData.telefono}
            onPressEdit={() => {}}
          />
        </View>



        {/* CERRAR SESIÓN */}
        <TouchableOpacity 
          className="bg-error-rojo/10 rounded-full py-4 mt-4 mb-10 items-center border border-error-rojo"
          onPress={handleLogout}
        >
          <Text className="text-error-rojo text-lg font-semibold">Cerrar Sesión</Text>
        </TouchableOpacity>

      </ScrollView>



      {/* TAB BAR */}
      <View className="flex-row justify-around items-center bg-white border-t border-gris-acento pt-2 pb-4 shadow-xl">
        <TouchableOpacity className="items-center" onPress={() => navigation.navigate('PatientHome')}>
          <Ionicons name="home-outline" size={24} color="#9ca3af" />
          <Text className="text-gray-400 text-xs">Home</Text>
        </TouchableOpacity>
        <TouchableOpacity className="items-center" onPress={() => navigation.navigate('PatientHistory')}>
          <Ionicons name="calendar-outline" size={24} color="#9ca3af" />
          <Text className="text-gray-400 text-xs">Citas</Text>
        </TouchableOpacity>
        <TouchableOpacity className="items-center" onPress={() => navigation.navigate('ChatList')}>
          <Ionicons name="chatbubbles-outline" size={24} color="#9ca3af" />
          <Text className="text-gray-400 text-xs">Mensajes</Text>
        </TouchableOpacity>
        <TouchableOpacity className="items-center" onPress={() => navigation.navigate('PatientProfile')}>
          <Ionicons name="person" size={24} color={PRIMARY_COLOR} />
          <Text className="text-az-primario text-xs font-semibold">Perfil</Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
};

export default PatientProfileScreen;
