import { useState, useEffect, useRef } from "react";
import {
View,
Text,
TouchableOpacity,
ScrollView,
TextInput,
KeyboardAvoidingView,
Platform,
ActivityIndicator,
Image,
Alert,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import {
collection,
query,
orderBy,
onSnapshot,
addDoc,
serverTimestamp,
doc,
setDoc,
getDoc,
updateDoc,
} from "firebase/firestore";
import { db } from "../../config/firebaseConfig";
import { useAuth } from "../../context/AuthContext";
import { useSafeAreaInsets } from 'react-native-safe-area-context'; 

const PRIMARY_COLOR = "#3A86FF";
const HEADER_HEIGHT = 80; 

// 💡 FUNCIÓN HELPER: Compara dos Timestamps para ver si son del mismo día
const isSameDay = (t1, t2) => {
    if (!t1 || !t2) return false;
    const d1 = t1.toDate();
    const d2 = t2.toDate();
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
};

// 💡 FUNCIÓN HELPER: Formato de hora compacto (Ej: 21:20)
const formatTime = (timestamp) => {
    if (!timestamp) return "";
    return timestamp.toDate().toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
    });
};

// 💡 FUNCIÓN HELPER: Formato de fecha de encabezado (Ej: 25 de noviembre de 2025)
const formatDateHeader = (timestamp) => {
    if (!timestamp) return "";
    const date = timestamp.toDate();
    return date.toLocaleDateString("es-ES", {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
};


const getChatRoomId = (uid1, uid2) =>
uid1 < uid2 ? `${uid1}_${uid2}` : `${uid2}_${uid1}`;

const MessageBubble = ({ message, isSender, photo }) => (
<View className={`flex-row mb-3 ${isSender ? "justify-end" : "justify-start"}`}>
 
 {!isSender && (
 <Image
  source={{ uri: photo }}
  className="w-8 h-8 rounded-full mr-2 self-end"
 />
 )}

 <View
 className={`max-w-[75%] p-3 rounded-xl ${
  isSender ? "bg-az-primario ml-10" : "bg-gray-200 mr-10"
 }`}
 >
 <Text className={`${isSender ? "text-white" : "text-gray-900"}`}>
  {message.text}
 </Text>

 <Text
  className={`text-[10px] mt-1 ${
  isSender ? "text-white/70" : "text-gray-600"
  } self-end`}
 >
    {/* 🚀 SOLO HORA COMPACTA */}
  {formatTime(message.createdAt) || ""}
 </Text>
 </View>
</View>
);

const ChatScreen = ({ navigation, route }) => {
const { user } = useAuth();
const { chatWithUser } = route.params;
const insets = useSafeAreaInsets();

const [messages, setMessages] = useState([]);
const [inputText, setInputText] = useState("");
const [contactPhoto, setContactPhoto] = useState(null);
const [loading, setLoading] = useState(true);
const scrollRef = useRef();

const chatRoomId = getChatRoomId(user.uid, chatWithUser.id);

useEffect(() => {
 // cargar foto
 const loadPhoto = async () => {
 const ref = doc(db, "users", chatWithUser.id);
 const snap = await getDoc(ref);
 if (snap.exists()) setContactPhoto(snap.data().fotoPerfil);
 };
 loadPhoto();

 // cargar mensajes
 const msgsRef = collection(db, "chats", chatRoomId, "messages");
 const q = query(msgsRef, orderBy("createdAt", "asc"));

 const unsub = onSnapshot(q, (qs) => {
 const arr = qs.docs.map((d) => ({ id: d.id, ...d.data() }));
 setMessages(arr);
 setLoading(false);
 });

 // marcar como leído
 const roomRef = doc(db, "chats", chatRoomId);
 updateDoc(roomRef, { [`unreadCount.${user.uid}`]: 0 });

 return () => unsub();
}, []);

const sendMessage = async () => {
 if (!inputText.trim()) return;
 const text = inputText;
 setInputText("");

 const msgsRef = collection(db, "chats", chatRoomId, "messages");
 const roomRef = doc(db, "chats", chatRoomId);

 await addDoc(msgsRef, {
 text,
 senderId: user.uid,
 createdAt: serverTimestamp(),
 });

 await setDoc(
 roomRef,
 {
  participants: [user.uid, chatWithUser.id],
  lastMessage: text,
  lastUpdatedAt: serverTimestamp(),
  unreadCount: {
  [user.uid]: 0,
  [chatWithUser.id]: (messages.length || 0) + 1,
  },
 },
 { merge: true }
 );
};

return (
 <View style={{ flex: 1, backgroundColor: '#f0f0f0' }}>

  {/* 1. HEADER */}
  <View 
    className="flex-row items-center px-4 py-3 bg-az-primario rounded-b-lg"
    style={{ paddingTop: insets.top }} 
   >
    <TouchableOpacity onPress={() => navigation.goBack()}>
    <Ionicons name="arrow-back-outline" size={28} color="#FFF" />
    </TouchableOpacity>
    <Text className="text-xl text-white font-bold ml-4">
     {chatWithUser.name}
    </Text>
   </View>

  {/* 2. CONTENEDOR DE TECLADO/ENTRADA */}
  <KeyboardAvoidingView
    behavior={Platform.OS === "ios" ? "padding" : "height"} 
    keyboardVerticalOffset={Platform.OS === "ios" ? insets.top + 50 : 0} 
    style={{ flex: 1 }}
   >
    
    {/* SCROLLVIEW de Mensajes */}
    <ScrollView
     className="flex-1 p-4"
     ref={scrollRef}
     onContentSizeChange={() => scrollRef.current.scrollToEnd({ animated: true })}
    >
     {loading ? (
      <ActivityIndicator size="large" color={PRIMARY_COLOR} />
     ) : (
      messages.map((m, index) => {
                const showDateHeader = index === 0 || !isSameDay(m.createdAt, messages[index - 1].createdAt);

                return (
                    <View key={m.id}>
                        {/* 💡 ENCABEZADO DE FECHA (Separador) */}
                        {showDateHeader && (
                            <View className="items-center my-3">
                                <Text className="text-xs text-white font-semibold px-3 py-1 rounded-full" style={{ backgroundColor: PRIMARY_COLOR }}>
                                    {formatDateHeader(m.createdAt)}
                                </Text>
                            </View>
                        )}
                        {/* 💡 BURBUJA DE MENSAJE */}
                        <MessageBubble
                            message={m}
                            isSender={m.senderId === user.uid}
                            photo={contactPhoto}
                        />
                    </View>
                );
            })
     )}
    </ScrollView>

    {/* BARRA DE ENTRADA */}
    <View
     className="p-3 bg-white border-t border-gray-200"
     style={{ paddingBottom: insets.bottom || 10 }} 
    >
     <View className="flex-row items-center">
      <TextInput
       className="flex-1 bg-gray-200 rounded-full px-4 py-3"
       placeholder="Escribe un mensaje..."
       value={inputText}
       onChangeText={setInputText}
       onFocus={() => scrollRef.current.scrollToEnd({ animated: true })}
      />
      <TouchableOpacity
       className="bg-az-primario p-3 rounded-full ml-3"
       onPress={sendMessage}
      >
       <Ionicons name="send" size={20} color="#FFF" />
      </TouchableOpacity>
     </View>
    </View>
   </KeyboardAvoidingView>

  </View>
);
};

export default ChatScreen;