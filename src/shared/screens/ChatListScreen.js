import React, { useEffect, useState } from 'react';
import { 
 View, 
 Text, 
 FlatList,
 Image,
 TouchableOpacity,
 ActivityIndicator,
 Alert,
 StyleSheet // Importamos StyleSheet si vamos a usar estilos fijos
} from 'react-native';
import { collection, query, where, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebaseConfig';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
// 💡 IMPORTACIÓN CLAVE: Usamos 'useSafeAreaInsets'
import { useSafeAreaInsets } from 'react-native-safe-area-context'; 

// Colores de la aplicación (asumidos)
const PRIMARY_COLOR = "#3A86FF";
const TEXT_DARK = "#1F2937";
const GRAY_ACCENT = "#E5E7EB";


// ----------------------------------------------------
// 📲 COMPONENTE PRINCIPAL
// ----------------------------------------------------

export default function ChatListScreen() {
 const { user } = useAuth();
 const navigation = useNavigation();
 const [chatRooms, setChatRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // 💡 OBTENER LOS INSETS
  const insets = useSafeAreaInsets();


 useEffect(() => {
  if (!user || !user.uid) return;

  const chatsRef = collection(db, 'chats');
  // Utilizamos 'array-contains' para buscar chats donde el usuario sea participante
  const q = query(chatsRef, where('participants', 'array-contains', user.uid));

  const unsubscribe = onSnapshot(q, async (snapshot) => {
   const rooms = [];

   for (const d of snapshot.docs) {
    const data = d.data();
    const otherId = data.participants.find((u) => u !== user.uid);

        // Intento de obtener datos del otro usuario (asíncrono)
    let otherUserDoc = await getDoc(doc(db, 'users', otherId));

    rooms.push({
     id: d.id,
     ...data,
     profilePics: {
      [otherId]: otherUserDoc.exists()
       ? otherUserDoc.data().fotoPerfil
       : 'https://i.pravatar.cc/300',
     }
    });
   }

   setChatRooms(rooms);
   setLoading(false);
  }, (error) => {
        console.error("Error al escuchar chats:", error);
        setLoading(false);
    });

  return unsubscribe;
 }, [user]);


 // Componente para renderizar cada fila del chat (separado por legibilidad)
 const renderItem = ({ item }) => {
  const otherId = item.participants.find((u) => u !== user.uid);
  const name = item.participantNames?.[otherId] || "Usuario Desconocido";

  const unread = item.unreadCount?.[user.uid] ?? 0;
  const lastMessageTime = item.lastUpdatedAt?.toDate?.() || null;

  return (
   <TouchableOpacity
    onPress={() =>
     navigation.navigate("Chat", {
      chatWithUser: { id: otherId, name },
      roomId: item.id,
     })
    }
    style={styles.chatRow}
   >
    <Image
     source={{ uri: item.profilePics[otherId] }}
     style={styles.profileImage}
    />

    <View style={{ flex: 1 }}>
     <View style={styles.rowHeader}>
      <Text style={styles.nameText}>{name}</Text>

      {lastMessageTime && (
       <Text style={styles.timeText}>
        {lastMessageTime.toLocaleTimeString("es-CL", {
         hour: "2-digit",
         minute: "2-digit",
        })}
       </Text>
      )}
     </View>

     <View style={styles.lastMessageContainer}>
      <Text
       numberOfLines={1}
       style={styles.lastMessageText}
      >
       {item.lastMessage || "Nuevo chat"}
      </Text>

      {unread > 0 && (
       <View style={styles.unreadBadge}>
        <Text style={styles.unreadText}>
         {unread}
        </Text>
       </View>
      )}
     </View>
    </View>
   </TouchableOpacity>
  );
 };


 if (loading) {
  return (
   <View style={styles.loadingContainer}>
    <ActivityIndicator color={PRIMARY_COLOR} size="large" />
   </View>
  );
 }

 return (
    <View style={{ flex: 1, backgroundColor: '#f1f5f9', paddingTop: insets.top }}>
   
   {/* Header */}
   <View style={styles.header}>
    <Text style={styles.headerTitle}>Chats</Text>
    <Text style={styles.headerSubtitle}>Conversaciones recientes</Text>
   </View>

   {/* FlatList de Conversaciones */}
   <View style={styles.listContainer}>
    <FlatList
     data={chatRooms}
     keyExtractor={(item) => item.id}
     renderItem={renderItem}
          // 💡 Aplicamos padding inferior para la zona de gestos/botón de inicio
          style={{ paddingBottom: insets.bottom }} 
    />
   </View>
    </View>
 );
}

// ----------------------------------------------------
// 🎨 ESTILOS (Convertidos a objetos de estilo por simplicidad)
// ----------------------------------------------------
const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f1f5f9',
    },
    header: {
        padding: 20,
        paddingBottom: 10,
        // Asumiendo que el 'header' es el que lleva el título
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
    },
    headerSubtitle: {
        color: '#6b7280', 
        marginTop: 4 
    },
    listContainer: {
        flex: 1, 
        padding: 16,
    },
    // Estilos de la fila del chat (extraídos del código original)
    chatRow: {
        flexDirection: "row",
        backgroundColor: "white",
        padding: 15,
        borderRadius: 14,
        marginBottom: 12,
        alignItems: "center",
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3,
    },
    profileImage: {
        width: 60,
        height: 60,
        borderRadius: 30,
        marginRight: 14,
    },
    rowHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    nameText: {
        fontSize: 17, 
        fontWeight: "700"
    },
    timeText: {
        fontSize: 12, 
        color: "gray"
    },
    lastMessageContainer: {
        flexDirection: "row", 
        alignItems: "center", 
        marginTop: 4
    },
    lastMessageText: {
        flex: 1, 
        color: "#666", 
        fontSize: 14
    },
    unreadBadge: {
        backgroundColor: "#2563eb",
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
        marginLeft: 8,
    },
    unreadText: {
        color: "white", 
        fontSize: 12, 
        fontWeight: "bold"
    }
});