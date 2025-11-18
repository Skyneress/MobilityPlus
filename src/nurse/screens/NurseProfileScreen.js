import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView, Alert, Image, ActivityIndicator } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import * as ImagePicker from 'expo-image-picker';

import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { auth, db, storage } from '../../config/firebaseConfig';
import { useAuth } from '../../context/AuthContext'; 

const PRIMARY_COLOR = "#3A86FF"; 
const TEXT_DARK = "#1F2937";
const GRAY_ACCENT = "#E5E7EB";

// Componente de filas de edición (sin cambios)
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

const NurseProfileScreen = ({ navigation }) => {
  const { user, role } = useAuth(); 
  const [profileData, setProfileData] = useState(null); 
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false); 

  // Cargar datos del perfil
  useEffect(() => {
    if (user) {
      const fetchProfileData = async () => {
        setLoading(true);
        try {
          const docRef = doc(db, "profesionales", user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setProfileData(docSnap.data());
          } else {
             // Este es el error que estás viendo
             console.warn("No se encontró documento de perfil 'profesionales'.");
             setProfileData(null); // Aseguramos que profileData sea null si no existe
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

  // Lógica de subida de imagen (sin cambios)
  const pickImage = async () => {
    if (uploading || !user) return; 
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true, aspect: [1, 1], quality: 0.8, mediaTypes: 'Images', 
      });
      if (result.canceled) return;
      const uri = result.assets[0].uri;
      setUploading(true); 
      const response = await fetch(uri);
      const blob = await response.blob();
      const fileName = user.uid + ".jpg";
      const storageRef = ref(storage, `profile_pictures/${fileName}`);
      await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(storageRef);
      const nurseDocRef = doc(db, "profesionales", user.uid);
      await updateDoc(nurseDocRef, { fotoPerfil: downloadURL });
      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, { fotoPerfil: downloadURL });
      setProfileData(prev => ({ ...prev, fotoPerfil: downloadURL }));
      Alert.alert("Éxito", "Foto de perfil actualizada.");
    } catch (error) {
      console.log("Error subiendo imagen:", error);
      Alert.alert("Error", "Hubo un problema al subir la foto.");
    } finally {
      setUploading(false); 
    }
  };

  const handleEdit = (field) => {
    Alert.alert("Editar", `Abriendo modal para editar: ${field}`);
  };

  // Lógica de Logout (sin cambios)
  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  // 💡 --- ¡CORRECCIÓN IMPORTANTE AQUÍ! --- 💡
  // Manejamos el estado de carga y el estado de "perfil no encontrado"
  if (loading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-fondo-claro">
        <ActivityIndicator size="large" color={PRIMARY_COLOR} />
        <Text className="mt-2 text-texto-oscuro">Cargando perfil...</Text>
      </SafeAreaView>
    );
  }

  // Si terminó de cargar (loading=false) PERO no hay datos de perfil
  if (!profileData) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-fondo-claro p-6">
        <Text className="text-xl font-bold text-error-rojo text-center">Error de Perfil</Text>
        <Text className="text-base text-gray-600 mt-2 text-center">
          No se encontró tu perfil de profesional en la base de datos.
          Esto puede ocurrir si el registro se interrumpió.
        </Text>
        {/* Añadimos un botón de Logout aquí para poder salir de la cuenta "rota" */}
        <TouchableOpacity 
          className="bg-error-rojo/10 rounded-full py-4 mt-10 items-center border border-error-rojo w-full"
          onPress={handleLogout}
        >
          <Text className="text-error-rojo text-lg font-semibold">Cerrar Sesión</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }
  // 💡 --- FIN DE LA CORRECCIÓN --- 💡


  // Si todo está bien, muestra el perfil normal
  return (
    <SafeAreaView className="flex-1 bg-fondo-claro">
      
      {/* HEADER */}
      <View className="flex-row items-center px-4 py-5 bg-az-primario rounded-b-lg shadow-md">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back-outline" size={28} color="#FFFFFF" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-texto-claro ml-4">Mi Perfil Profesional</Text>
      </View>

      <ScrollView className="flex-1 p-4">
        
        {/* FOTO + NOMBRE (Ahora usa datos de Firestore) */}
        <View className="items-center py-6 bg-white rounded-xl shadow-md mb-6 border border-gris-acento">
          
          <TouchableOpacity onPress={pickImage} disabled={uploading}>
            <Image
              source={{
                uri: profileData.fotoPerfil 
                  || `https://placehold.co/150x150/EBF8FF/3A86FF?text=${profileData.nombre.charAt(0)}`
              }}
              className="w-28 h-28 rounded-full border-4 border-az-primario shadow-lg"
            />
             {uploading && (
              <View className="absolute inset-0 justify-center items-center bg-black/50 rounded-full">
                <ActivityIndicator color="#FFFFFF" />
              </View>
            )}
             <View className="absolute bottom-1 right-1 bg-az-primario p-1 rounded-full border-2 border-white">
               <Ionicons name="camera-outline" size={16} color="#FFFFFF" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={pickImage} className="mt-3">
            <Text className="text-az-primario font-semibold text-base">
              Cambiar Foto
            </Text>
          </TouchableOpacity>

          <Text className="text-2xl font-bold text-texto-oscuro mt-3">
            {profileData.nombre} {profileData.apellido}
          </Text>

          <Text className="text-base text-gray-500">
            {profileData.especialidadNombre || profileData.especialidad}
          </Text>

          {/* Calificación */}
          <View className="flex-row items-center mt-2">
            <FontAwesome name="star" size={18} color="#FFD700" />
            <Text className="text-lg font-semibold text-texto-oscuro ml-2">{profileData.calificacion || 0}</Text>
            <Text className="text-sm text-gray-500 ml-1">({profileData.reviews || 0} Reviews)</Text>
          </View>

        </View>

        {/* INFO PROFESIONAL (Ahora usa datos de Firestore) */}
        <View className="bg-white p-4 rounded-xl shadow-md mb-6 border border-gris-acento">
          <Text className="text-lg font-bold text-az-primario mb-3">Información Profesional</Text>
          <InfoRow 
            icon="card-outline"
            label="Número de Licencia"
            value={profileData.numeroRegistroMinsal}
            onPressEdit={() => handleEdit('Licencia')}
          />
          <InfoRow 
            icon="briefcase-outline"
            label="Especialidad"
            value={profileData.especialidadNombre || profileData.especialidad}
            onPressEdit={() => handleEdit('Especialidad')}
          />
          <InfoRow 
            icon="cash-outline"
            label="Tarifa por Visita"
            value={`$${profileData.precioConsulta} CLP`}
            onPressEdit={() => handleEdit('Tarifa')}
          />
        </View>

        {/* CONTACTO (Ahora usa datos de Firestore) */}
        <View className="bg-white p-4 rounded-xl shadow-md mb-6 border border-gris-acento">
          <Text className="text-lg font-bold text-az-primario mb-3">Datos de Contacto</Text>
          <InfoRow 
            icon="mail-outline"
            label="Correo Electrónico"
            value={profileData.email}
            onPressEdit={() => handleEdit('Correo')}
          />
          <InfoRow 
            icon="call-outline"
            label="Teléfono"
            value={profileData.telefono}
            onPressEdit={() => handleEdit('Teléfono')}
          />
        </View>

        {/* LOGOUT */}
        <TouchableOpacity 
          className="bg-error-rojo/10 rounded-full py-4 mt-4 mb-10 items-center border border-error-rojo"
          onPress={handleLogout} // Conectado a la función de logout
        >
          <Text className="text-error-rojo text-lg font-semibold">Cerrar Sesión</Text>
        </TouchableOpacity>
        
      </ScrollView>

      {/* TAB BAR (Sin cambios) */}
      <View className="flex-row justify-around items-center bg-white border-t border-gris-acento pt-2 pb-4 shadow-xl">
        <TouchableOpacity className="items-center" onPress={() => navigation.navigate('NurseHome')}>
          <Ionicons name="home-outline" size={24} color="#9ca3af" />
          <Text className="text-gray-400 text-xs">Panel</Text>
        </TouchableOpacity>
        <TouchableOpacity className="items-center" onPress={() => navigation.navigate('NurseSchedule')}>
          <Ionicons name="calendar-outline" size={24} color="#9ca3af" />
          <Text className="text-gray-400 text-xs">Agenda</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="items-center"
          onPress={() => navigation.navigate('ChatList')}
        >
          <Ionicons name="chatbubbles-outline" size={24} color="#9ca3af" />
          <Text className="text-gray-400 text-xs">Mensajes</Text>
        </TouchableOpacity>
        <TouchableOpacity className="items-center">
          <Ionicons name="person" size={24} color={PRIMARY_COLOR} />
          <Text className="text-az-primario text-xs font-semibold">Perfil</Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
};

export default NurseProfileScreen;