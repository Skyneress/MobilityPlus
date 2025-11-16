import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  SafeAreaView, 
  ScrollView, 
  Alert, 
  ActivityIndicator,
  Image
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons'; 
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../../config/firebaseConfig';
import { useAuth } from '../../context/AuthContext';

const PRIMARY_COLOR = "#3A86FF"; 

// Componente para una fila de la lista de chat
const ChatRow = ({ chat, currentUserId, navigation }) => {
  // Determinar el ID y Nombre de la OTRA persona
  const otherParticipantId = chat.participants.find(uid => uid !== currentUserId);
  const otherParticipantName = chat.participantNames[otherParticipantId] || "Usuario Desconocido";

  return (
    <TouchableOpacity 
      className="flex-row items-center bg-white p-3 rounded-xl shadow-sm mb-3 border border-gris-acento/50"
      onPress={() => navigation.navigate('Chat', {
        chatWithUser: {
          id: otherParticipantId,
          name: otherParticipantName,
          role: 'Chat' // El rol específico no es tan importante aquí
        }
      })}
    >
      <Image
        source={{ uri: `https://placehold.co/100x100/EBF8FF/3A86FF?text=${otherParticipantName.charAt(0)}` }}
        className="w-12 h-12 rounded-full mr-4"
      />
      <View className="flex-1">
        <Text className="text-base font-semibold text-texto-oscuro">{otherParticipantName}</Text>
        <Text className="text-sm text-gray-500" numberOfLines={1}>{chat.lastMessage}</Text>
      </View>
      <Ionicons name="chevron-forward-outline" size={24} color="#6B7280" />
    </TouchableOpacity>
  );
};

const ChatListScreen = ({ navigation }) => {
  const { user } = useAuth(); 
  const [loading, setLoading] = useState(true);
  const [chatRooms, setChatRooms] = useState([]);

  useEffect(() => {
    if (!user) return; 

    setLoading(true);
    
    // Consulta para "chats" donde el usuario actual es un participante
    const q = query(
      collection(db, "chats"),
      where("participants", "array-contains", user.uid), 
      orderBy("lastUpdatedAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const rooms = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setChatRooms(rooms);
      setLoading(false);
    }, (error) => {
      console.error("Error al cargar la lista de chats: ", error);
      Alert.alert("Error", "No se pudo cargar tu bandeja de entrada.");
      setLoading(false);
    });

    return () => unsubscribe();

  }, [user]);

  return (
    <SafeAreaView className="flex-1 bg-fondo-claro">
      
      {/* Encabezado */}
      <View className="flex-row items-center px-4 py-5 bg-az-primario rounded-b-lg shadow-md">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back-outline" size={28} color="#FFFFFF" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-texto-claro ml-4">Mis Mensajes</Text>
      </View>

      <ScrollView className="flex-1 p-4">
        {loading ? (
          <ActivityIndicator size="large" color={PRIMARY_COLOR} className="mt-10" />
        ) : chatRooms.length === 0 ? (
          <View className="p-4 bg-white rounded-lg items-center mt-4 shadow-sm">
            <Text className="text-gray-500 text-center">
              No tienes conversaciones activas. Inicia un chat desde una cita.
            </Text>
          </View>
        ) : (
          chatRooms.map(room => (
            <ChatRow 
              key={room.id} 
              chat={room} 
              currentUserId={user.uid} 
              navigation={navigation}
            />
          ))
        )}
      </ScrollView>

      {/* Aquí podrías mantener la barra de navegación inferior (Tab Bar) 
        dependiendo de cómo estructures tu navegación (Stack vs Tab).
        Por ahora, la quitamos de esta pantalla de detalle.
      */}
    </SafeAreaView>
  );
};

export default ChatListScreen;