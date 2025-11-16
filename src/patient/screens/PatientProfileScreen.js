import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView, Alert, Image, ActivityIndicator } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons'; 
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { signOut } from 'firebase/auth';
// 💡 1. Importar el hook de autenticación y los servicios de Firebase
import { auth, db, storage } from '../../config/firebaseConfig';
import { useAuth } from '../../context/AuthContext';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import * as ImagePicker from 'expo-image-picker'; // 💡 2. Importar el Image Picker

const PRIMARY_COLOR = "#3A86FF"; 
const TEXT_DARK = "#1F2937";
const GRAY_ACCENT = "#E5E7EB";

// Componente para una fila de información editable
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


const PatientProfileScreen = ({ navigation }) => {
  const { user, role } = useAuth(); // Obtenemos el usuario y su rol
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false); // Estado para el spinner de subida

  // 💡 3. Cargar datos del perfil (incluyendo la foto) al iniciar
  useEffect(() => {
    if (user) {
      const fetchProfileData = async () => {
        setLoading(true);
        try {
          // Usamos la colección 'users' (la base de todos)
          const docRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setProfileData(docSnap.data());
          } else {
             console.warn("No se encontró documento de perfil para el usuario.");
          }
        } catch (error) {
          console.error("Error al cargar perfil:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchProfileData();
    }
  }, [user]); // Se ejecuta cuando el 'user' cambia

  // 💡 4. Lógica para seleccionar y subir la imagen
  const pickImage = async () => {
    if (uploading) return; // Evitar doble subida

    // Pedir permisos
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert("Permiso Requerido", "Se necesita acceso a la galería para cambiar la foto de perfil.");
      return;
    }

    // Abrir la galería
    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1], // Forzar foto cuadrada
      quality: 0.7,
    });

    if (pickerResult.canceled) {
      return;
    }

    // Si el usuario selecciona una imagen, 'assets' tendrá un item
    if (pickerResult.assets && pickerResult.assets.length > 0) {
      const { uri } = pickerResult.assets[0];
      await uploadImage(uri);
    }
  };

  // 💡 5. Lógica para subir la imagen a Firebase Storage
  const uploadImage = async (uri) => {
    if (!user) return;
    setUploading(true);

    try {
      // Convertir la imagen local (uri) a un archivo 'blob'
      const response = await fetch(uri);
      const blob = await response.blob();

      // Crear la referencia en Storage (ej: profile_pictures/UID_DEL_USUARIO.jpg)
      const storageRef = ref(storage, `profile_pictures/${user.uid}.jpg`);
      
      // Subir el archivo
      const uploadTask = uploadBytesResumable(storageRef, blob);

      // Esperar a que la subida termine
      await uploadTask;

      // Obtener la URL de descarga
      const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

      // 6. Actualizar la URL en Firestore (en 'users' y 'profesionales' si es enfermero)
      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, { fotoPerfil: downloadURL });

      if (role === 'nurse') {
        const nurseDocRef = doc(db, "profesionales", user.uid);
        await updateDoc(nurseDocRef, { fotoPerfil: downloadURL });
      }

      // Actualizar la imagen localmente
      setProfileData(prev => ({ ...prev, fotoPerfil: downloadURL }));
      Alert.alert("¡Éxito!", "Tu foto de perfil ha sido actualizada.");

    } catch (error) {
      console.error("Error al subir la imagen: ", error);
      Alert.alert("Error", "No se pudo subir la imagen.");
    } finally {
      setUploading(false);
    }
  };


  // 💡 6. Lógica para editar (stub) y cerrar sesión (implementada)
  const handleEdit = (field) => { Alert.alert("Editar", `Abriendo modal para editar: ${field}`); };
  
  const handleLogout = async () => {
    try {
      await signOut(auth);
      // El AuthContext detectará el cambio automáticamente y
      // el RootNavigator nos enviará al AuthStack (Login).
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      Alert.alert("Error", "No se pudo cerrar la sesión.");
    }
  };


  // Pantalla de carga mientras se busca el perfil
  if (loading || !profileData) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-fondo-claro">
        <ActivityIndicator size="large" color={PRIMARY_COLOR} />
      </SafeAreaView>
    );
  }

  // 💡 7. RENDERIZADO
  return (
    <SafeAreaView className="flex-1 bg-fondo-claro">
      
      {/* Encabezado */}
      <View className="flex-row items-center px-4 py-5 bg-az-primario rounded-b-lg shadow-md">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back-outline" size={28} color="#FFFFFF" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-texto-claro ml-4">Mi Perfil</Text>
      </View>

      <ScrollView className="flex-1 p-4">
        
        {/* Sección de Foto y Nombre (Actualizada para subir foto) */}
        <View className="items-center py-6 bg-white rounded-xl shadow-md mb-6 border border-gris-acento">
          <TouchableOpacity onPress={pickImage} disabled={uploading}>
            <Image
              // Usamos la foto del perfil o un placeholder
              source={{ uri: profileData.fotoPerfil || `https://placehold.co/150x150/EBF8FF/3A86FF?text=${profileData.nombre.charAt(0)}` }}
              className="w-24 h-24 rounded-full border-4 border-az-primario shadow-lg"
            />
            {/* Indicador de carga sobre la imagen */}
            {uploading && (
              <View className="absolute inset-0 justify-center items-center bg-black/50 rounded-full">
                <ActivityIndicator color="#FFFFFF" />
              </View>
            )}
            {/* Ícono de "editar foto" */}
            <View className="absolute bottom-0 right-0 bg-az-primario p-1 rounded-full border-2 border-white">
               <Ionicons name="camera-outline" size={16} color="#FFFFFF" />
            </View>
          </TouchableOpacity>

          <Text className="text-2xl font-bold text-texto-oscuro mt-3">{profileData.nombre} {profileData.apellido}</Text>
          <Text className="text-base text-gray-500">{role === 'nurse' ? 'Profesional' : 'Paciente'}</Text>
        </View>

        {/* 🩺 --- ¡NUEVA SECCIÓN DE BITÁCORA! --- 🩺 */}
        <View className="bg-white p-4 rounded-xl shadow-md mb-6 border border-gris-acento">
          <TouchableOpacity 
            className="flex-row items-center justify-between py-2"
            onPress={() => navigation.navigate('PatientLog')} // <-- NAVEGACIÓN
          >
            <View className="flex-row items-center">
              <Ionicons name="receipt-outline" size={24} color={PRIMARY_COLOR} />
              <Text className="text-lg font-semibold text-texto-oscuro ml-4">Ver Mi Bitácora Clínica</Text>
            </View>
            <Ionicons name="chevron-forward-outline" size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>
        {/* 🩺 --- FIN DE LA NUEVA SECCIÓN --- 🩺 */}


        {/* Sección de Dirección y Contacto */}
        <View className="bg-white p-4 rounded-xl shadow-md mb-6 border border-gris-acento">
          <Text className="text-lg font-bold text-az-primario mb-3">Información de Servicio</Text>
          <InfoRow 
            icon="location-outline" 
            label="Dirección Principal" 
            value={profileData.direccion || "No especificada"}
            onPressEdit={() => handleEdit('Dirección')}
          />
           <InfoRow 
            icon="bandage-outline" 
            label="Condición Médica Relevante" 
            value={"Movilidad Reducida / Diabetes"} // (Este dato debería venir de profileData)
            onPressEdit={() => handleEdit('Condición')}
          />
        </View>

        {/* Sección de Contacto Personal */}
        <View className="bg-white p-4 rounded-xl shadow-md mb-6 border border-gris-acento">
          <Text className="text-lg font-bold text-az-primario mb-3">Datos Personales</Text>
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

        {/* Botón de Cerrar Sesión */}
        <TouchableOpacity 
          className="bg-error-rojo/10 rounded-full py-4 mt-4 mb-10 items-center border border-error-rojo"
          onPress={handleLogout} // Conectado a la función de logout
        >
          <Text className="text-error-rojo text-lg font-semibold">Cerrar Sesión</Text>
        </TouchableOpacity>
        
      </ScrollView>

      {/* Barra de Navegación Inferior (Tab Bar) */}
      <View className="flex-row justify-around items-center bg-white border-t border-gris-acento pt-2 pb-4 shadow-xl">
        <TouchableOpacity className="items-center" onPress={() => navigation.navigate('PatientHome')}>
          <Ionicons name="home-outline" size={24} color="#9ca3af" />
          <Text className="text-gray-400 text-xs">Home</Text>
        </TouchableOpacity>
        <TouchableOpacity className="items-center" onPress={() => navigation.navigate('PatientHistory')}>
          <Ionicons name="calendar-outline" size={24} color="#9ca3af" />
          <Text className="text-gray-400 text-xs">Citas</Text>
        </TouchableOpacity>
        <TouchableOpacity className="items-center" onPress={() => navigation.navigate('Chat', { contactName: 'Soporte', contactRole: 'Soporte' })}>
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