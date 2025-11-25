import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, Image, ActivityIndicator } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import * as ImagePicker from 'expo-image-picker';

import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { auth, db, storage } from '../../config/firebaseConfig';
import { useAuth } from '../../context/AuthContext'; 
// 💡 IMPORTAR EL NUEVO MODAL
import EditFieldModal from '../../shared/screens/EditFieldModal'; 
// 💡 IMPORTACIÓN CLAVE para las zonas seguras
import { useSafeAreaInsets } from "react-native-safe-area-context"; 

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
const { user } = useAuth(); 
  // 💡 OBTENER LOS INSETS
  const insets = useSafeAreaInsets();
  
const [profileData, setProfileData] = useState(null); 
const [loading, setLoading] = useState(true);
const [uploading, setUploading] = useState(false); 

 // 💡 ESTADOS DEL MODAL
 const [modalVisible, setModalVisible] = useState(false);
 const [editingField, setEditingField] = useState({ key: '', label: '', isContact: false, initialValue: '' });


// 💡 FUNCIÓN CENTRAL DE ACTUALIZACIÓN DE FIRESTORE
const updateFirestore = async (fieldName, newValue, updateBothCollections = false) => {
 if (!user || !newValue || newValue.trim() === '') return;

 try {
 const nurseDocRef = doc(db, "profesionales", user.uid);
 const updateData = { [fieldName]: newValue };
 
 // 1. Actualizar la colección 'profesionales'
 await updateDoc(nurseDocRef, updateData);

 // 2. Si el campo es de contacto, actualizar también la colección 'users'
 if (updateBothCollections) {
  const userDocRef = doc(db, "users", user.uid);
  await updateDoc(userDocRef, updateData);
 }

 // 3. Actualizar el estado local para reflejar el cambio inmediato en la UI
 setProfileData(prev => ({ ...prev, [fieldName]: newValue }));
 Alert.alert("Éxito", `${editingField.label} actualizado correctamente.`);

 } catch (error) {
 console.error(`Error al actualizar ${fieldName}: `, error);
 Alert.alert("Error", `No se pudo actualizar ${fieldName}.`);
 }
};


// 💡 FUNCIÓN MODIFICADA PARA ABRIR EL MODAL
const handleEdit = (field, label, isContact = false) => {
  // 💡 Edición Especial: Bloquear la edición de Especialidad
if (field === 'especialidad') {
Alert.alert("Edición Bloqueada", "Para cambiar tu especialidad, por favor contacta a soporte técnico."); 
return;
}

  const currentValue = profileData?.[field] || '';
  
  setEditingField({
    key: field,
    label: label,
    isContact: isContact,
    initialValue: currentValue
  });
  setModalVisible(true);
};

// Cargar datos del perfil (sin cambios)
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
   console.warn("No se encontró documento de perfil 'profesionales'.");
   setProfileData(null); 
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
 let result = await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, aspect: [1, 1], quality: 0.8, mediaTypes: 'Images', });
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


// Lógica de Logout (sin cambios)
const handleLogout = async () => {
 try {
 await signOut(auth);
 } catch (error) {
 console.error("Error al cerrar sesión:", error);
 }
};

// --- Manejo de carga y error ---
if (loading) {
 return (
      // 💡 Cargando: Usamos View simple
  <View className="flex-1 justify-center items-center bg-fondo-claro">
   <ActivityIndicator size="large" color={PRIMARY_COLOR} />
   <Text className="mt-2 text-texto-oscuro">Cargando perfil...</Text>
  </View>
 );
}

if (!profileData) {
 return (
      // 💡 Error: Usamos View simple con padding superior
  <View className="flex-1 justify-center items-center bg-fondo-claro p-6" style={{ paddingTop: insets.top }}>
   <Text className="text-xl font-bold text-error-rojo text-center">Error de Perfil</Text>
   <Text className="text-base text-gray-600 mt-2 text-center">
    No se encontró tu perfil de profesional en la base de datos.
   </Text>
   <TouchableOpacity className="bg-error-rojo/10 rounded-full py-4 mt-10 items-center border border-error-rojo w-full" onPress={handleLogout}>
   <Text className="text-error-rojo text-lg font-semibold">Cerrar Sesión</Text>
   </TouchableOpacity>
  </View>
 );
}
// ----------------------------------------------------


// Si todo está bien, muestra el perfil normal
return (
    // 💡 CONTENEDOR PRINCIPAL: View con insets superior aplicados
  <View style={{ flex: 1, backgroundColor: '#f0f0f0', paddingTop: insets.top }}>
   
   {/* HEADER */}
   <View className="flex-row items-center px-4 py-5 bg-az-primario rounded-b-lg shadow-md">
{/*     <TouchableOpacity onPress={() => navigation.goBack()}>
    <Ionicons name="arrow-back-outline" size={28} color="#FFFFFF" />
    </TouchableOpacity> */}
    <Text className="text-xl font-bold text-texto-claro ml-4">Mi Perfil Profesional</Text>
   </View>

   <ScrollView className="flex-1 p-4">
    
    {/* FOTO + NOMBRE (sin cambios) */}
    <View className="items-center py-6 bg-white rounded-xl shadow-md mb-6 border border-gris-acento">
     <TouchableOpacity onPress={pickImage} disabled={uploading}>
      <Image source={{ uri: profileData.fotoPerfil || `https://placehold.co/150x150/EBF8FF/3A86FF?text=${profileData.nombre.charAt(0)}` }} className="w-28 h-28 rounded-full border-4 border-az-primario shadow-lg" />
      {uploading && (<View className="absolute inset-0 justify-center items-center bg-black/50 rounded-full"><ActivityIndicator color="#FFFFFF" /></View>)}
      <View className="absolute bottom-1 right-1 bg-az-primario p-1 rounded-full border-2 border-white"><Ionicons name="camera-outline" size={16} color="#FFFFFF" /></View>
     </TouchableOpacity>
     <TouchableOpacity onPress={pickImage} className="mt-3"><Text className="text-az-primario font-semibold text-base">Cambiar Foto</Text></TouchableOpacity>
     <Text className="text-2xl font-bold text-texto-oscuro mt-3">{profileData.nombre} {profileData.apellido}</Text>
     <Text className="text-base text-gray-500">{profileData.especialidadNombre || profileData.especialidad}</Text>
     <View className="flex-row items-center mt-2">
      <FontAwesome name="star" size={18} color="#FFD700" />
      <Text className="text-lg font-semibold text-texto-oscuro ml-2">{profileData.calificacion || 0}</Text>
      <Text className="text-sm text-gray-500 ml-1">({profileData.reviews || 0} Reviews)</Text>
     </View>
    </View>

    {/* INFO PROFESIONAL (CON EDICIÓN) */}
    <View className="bg-white p-4 rounded-xl shadow-md mb-6 border border-gris-acento">
     <Text className="text-lg font-bold text-az-primario mb-3">Información Profesional</Text>
     <InfoRow 
      icon="card-outline"
      label="Número de Licencia"
      value={profileData.numeroRegistroMinsal}
      onPressEdit={() => handleEdit('numeroRegistroMinsal', 'Número de Licencia')}
     />
     <InfoRow 
      icon="briefcase-outline"
      label="Especialidad"
      value={profileData.especialidadNombre || profileData.especialidad}
      onPressEdit={() => handleEdit('especialidad', 'Especialidad')}
     />
     <InfoRow 
      icon="cash-outline"
      label="Tarifa por Visita"
      value={`$${profileData.precioConsulta} CLP`}
      onPressEdit={() => handleEdit('precioConsulta', 'Tarifa por Visita')}
     />
    </View>

    {/* CONTACTO (CON EDICIÓN SINCRONIZADA) */}
    <View className="bg-white p-4 rounded-xl shadow-md mb-6 border border-gris-acento">
     <Text className="text-lg font-bold text-az-primario mb-3">Datos de Contacto</Text>
     <InfoRow 
      icon="mail-outline"
      label="Correo Electrónico"
      value={profileData.email}
      onPressEdit={() => handleEdit('email', 'Correo Electrónico', true)}
     />
     <InfoRow 
      icon="call-outline"
      label="Teléfono"
      value={profileData.telefono}
      onPressEdit={() => handleEdit('telefono', 'Teléfono', true)}
     />
    </View>

    {/* LOGOUT (sin cambios) */}
    <TouchableOpacity 
     className="bg-error-rojo/10 rounded-full py-4 mt-4 mb-10 items-center border border-error-rojo"
     onPress={handleLogout}
    >
     <Text className="text-error-rojo text-lg font-semibold">Cerrar Sesión</Text>
    </TouchableOpacity>
    
   </ScrollView>

   {/* TAB BAR (Aplicamos insets) */}
   <View className="flex-row justify-around items-center bg-white border-t border-gris-acento pt-2 pb-4 shadow-xl" style={{ paddingBottom: insets.bottom }}>
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
  
  {/* 💡 MODAL DE EDICIÓN */}
  <EditFieldModal
    isVisible={modalVisible}
    onClose={() => setModalVisible(false)}
    initialValue={editingField.initialValue}
    fieldLabel={editingField.label}
    onSave={(newValue) => {
      updateFirestore(editingField.key, newValue, editingField.isContact);
    }}
  />

 </View>
);
};

export default NurseProfileScreen;