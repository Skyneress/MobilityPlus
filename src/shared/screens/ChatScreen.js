import { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
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

const PRIMARY_COLOR = "#3A86FF";

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
        {message.createdAt?.toDate().toLocaleTimeString("es-ES", {
          hour: "2-digit",
          minute: "2-digit",
        }) || ""}
      </Text>
    </View>
  </View>
);

const ChatScreen = ({ navigation, route }) => {
  const { user } = useAuth();
  const { chatWithUser } = route.params;

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
    <SafeAreaView className="flex-1 bg-gray-100">

      <View className="flex-row items-center px-4 py-5 bg-az-primario rounded-b-lg">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back-outline" size={28} color="#FFF" />
        </TouchableOpacity>
        <Text className="text-xl text-white font-bold ml-4">
          {chatWithUser.name}
        </Text>
      </View>

      <ScrollView
        className="flex-1 p-4"
        ref={scrollRef}
        onContentSizeChange={() => scrollRef.current.scrollToEnd({ animated: true })}
      >
        {loading ? (
          <ActivityIndicator size="large" color={PRIMARY_COLOR} />
        ) : (
          messages.map((m) => (
            <MessageBubble
              key={m.id}
              message={m}
              isSender={m.senderId === user.uid}
              photo={contactPhoto}
            />
          ))
        )}
      </ScrollView>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="p-3 bg-white border-t border-gray-200"
      >
        <View className="flex-row items-center">
          <TextInput
            className="flex-1 bg-gray-200 rounded-full px-4 py-3"
            placeholder="Escribe un mensaje..."
            value={inputText}
            onChangeText={setInputText}
          />
          <TouchableOpacity
            className="bg-az-primario p-3 rounded-full ml-3"
            onPress={sendMessage}
          >
            <Ionicons name="send" size={20} color="#FFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

    </SafeAreaView>
  );
};

export default ChatScreen;
