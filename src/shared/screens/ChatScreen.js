import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  SafeAreaView, 
  ScrollView, 
  TextInput, 
  KeyboardAvoidingView, 
  Platform, 
  Alert,
  ActivityIndicator
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons'; 
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebaseConfig';
import { useAuth } from '../../context/AuthContext';

const PRIMARY_COLOR = "#3A86FF"; 
const TEXT_DARK = "#1F2937";
const GRAY_ACCENT = "#E5E7EB";

// Componente para una burbuja de mensaje
const MessageBubble = ({ message, isSender }) => (
  <View className={`flex-row mb-3 ${isSender ? 'justify-end' : 'justify-start'}`}>
    <View className={`max-w-[80%] p-3 rounded-xl ${isSender ? 'bg-az-primario' : 'bg-gray-200'}`}>
      <Text className={`text-base ${isSender ? 'text-white' : 'text-gray-800'}`}>
        {message.text}
      </Text>
      <Text className={`text-[10px] mt-1 ${isSender ? 'text-white/70' : 'text-gray-500'} self-end`}>
        {message.createdAt?.toDate().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) || 'Enviando...'}
      </Text>
    </View>
  </View>
);

// Función para crear un ID de chat consistente
const getChatRoomId = (uid1, uid2) => {
  return uid1 < uid2 ? `${uid1}_${uid2}` : `${uid2}_${uid1}`;
};

const ChatScreen = ({ navigation, route }) => {
  const { user } = useAuth(); // Usuario actual (Paciente o Enfermero)
  // 'chatWithUser' es el objeto del otro usuario (el que NO soy yo)
  const { chatWithUser } = route.params || {}; 

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const scrollViewRef = useRef();

  if (!chatWithUser || !user) {
    // Manejo de error si no se pasan los parámetros correctos
    return (
      <SafeAreaView className="flex-1 justify-center items-center">
        <Text>Error: No se pudo cargar el chat.</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text className="text-az-primario mt-4">Volver</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // Creamos un ID único para la sala de chat
  const chatRoomId = getChatRoomId(user.uid, chatWithUser.id);

  // 1. useEffect para Cargar los Mensajes
  useEffect(() => {
    setLoading(true);
    // Ruta a la sub-colección de mensajes
    const messagesRef = collection(db, "chats", chatRoomId, "messages");
    const q = query(messagesRef, orderBy("createdAt", "asc"));

    // onSnapshot escucha en tiempo real
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const msgs = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMessages(msgs);
      setLoading(false);
    }, (error) => {
      console.error("Error al cargar mensajes: ", error);
      Alert.alert("Error", "No se pudieron cargar los mensajes.");
      setLoading(false);
    });

    return () => unsubscribe();
  }, [chatRoomId]); // Se ejecuta si el ID del chat cambia

  // 2. Lógica para Enviar Mensajes
  const handleSend = async () => {
    if (inputText.trim() === '' || !user) return;

    const messagesRef = collection(db, "chats", chatRoomId, "messages");
    const textToSend = inputText.trim();
    setInputText(''); // Limpiamos el input inmediatamente

    try {
      // Añadimos el nuevo mensaje a la sub-colección
      await addDoc(messagesRef, {
        text: textToSend,
        createdAt: serverTimestamp(),
        senderId: user.uid,
      });

      // (Opcional) Actualizar el documento principal del chat con el último mensaje
      const chatRoomRef = doc(db, "chats", chatRoomId);
      await setDoc(chatRoomRef, {
        lastMessage: textToSend,
        lastUpdatedAt: serverTimestamp(),
        // Guardamos los participantes para futuras consultas de "bandeja de entrada"
        participants: [user.uid, chatWithUser.id],
        participantNames: {
          [user.uid]: user.displayName || "Usuario",
          [chatWithUser.id]: chatWithUser.name
        }
      }, { merge: true }); // 'merge: true' evita sobrescribir si ya existe

    } catch (error) {
      console.error("Error al enviar mensaje: ", error);
      Alert.alert("Error", "No se pudo enviar el mensaje.");
      setInputText(textToSend); // Restauramos el texto si falla
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-fondo-claro">
      <View className="flex-1">
        
        {/* Encabezado */}
        <View className="flex-row items-center px-4 py-5 bg-az-primario rounded-b-lg shadow-md">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back-outline" size={28} color="#FFFFFF" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-texto-claro ml-4">{chatWithUser.name}</Text>
          <Text className="text-sm text-texto-claro/80 ml-2">({chatWithUser.role})</Text>
        </View>

        {/* Área de Mensajes */}
        <ScrollView 
          className="flex-1 p-4" 
          ref={scrollViewRef}
          onContentSizeChange={() => scrollViewRef.current.scrollToEnd({ animated: true })}
        >
          {loading ? (
            <ActivityIndicator size="large" color={PRIMARY_COLOR} />
          ) : (
            messages.map(msg => (
              <MessageBubble 
                key={msg.id} 
                message={msg} 
                isSender={msg.senderId === user.uid} // Comprobamos si yo soy el emisor
              />
            ))
          )}
        </ScrollView>
        
        {/* Campo de Entrada (Input) */}
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0}
          className="border-t border-gris-acento bg-white p-3"
        >
          <View className="flex-row items-center">
            <TextInput
              className="flex-1 bg-gris-acento/50 rounded-full px-4 py-3 text-base"
              placeholder="Escribe un mensaje..."
              placeholderTextColor="#9ca3af"
              value={inputText}
              onChangeText={setInputText}
              onSubmitEditing={handleSend}
            />
            <TouchableOpacity
              className="bg-az-primario rounded-full p-3 ml-2"
              onPress={handleSend}
            >
              <Ionicons name="send" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
};

export default ChatScreen;