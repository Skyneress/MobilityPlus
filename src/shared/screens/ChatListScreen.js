// ===============================
// ChatListScreen.js (COMPLETO)
// ===============================

import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  SafeAreaView,
  FlatList,
  Image,
  TouchableOpacity
} from 'react-native';
import { collection, query, where, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebaseConfig';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '@react-navigation/native';

export default function ChatListScreen() {
  const { user } = useAuth();
  const navigation = useNavigation();
  const [chatRooms, setChatRooms] = useState([]);

  useEffect(() => {
    const chatsRef = collection(db, 'chats');
    const q = query(chatsRef, where('participants', 'array-contains', user.uid));

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const rooms = [];

      for (const d of snapshot.docs) {
        const data = d.data();
        const otherId = data.participants.find((u) => u !== user.uid);

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
    });

    return unsubscribe;
  }, []);

  const renderItem = ({ item }) => {
    const otherId = item.participants.find((u) => u !== user.uid);
    const name = item.participantNames?.[otherId] || "Usuario";

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
        style={{
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
        }}
      >
        <Image
          source={{ uri: item.profilePics[otherId] }}
          style={{ width: 60, height: 60, borderRadius: 30, marginRight: 14 }}
        />

        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <Text style={{ fontSize: 17, fontWeight: "700" }}>{name}</Text>

            {lastMessageTime && (
              <Text style={{ fontSize: 12, color: "gray" }}>
                {lastMessageTime.toLocaleTimeString("es-CL", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
            )}
          </View>

          <View style={{ flexDirection: "row", alignItems: "center", marginTop: 4 }}>
            <Text
              numberOfLines={1}
              style={{ flex: 1, color: "#666", fontSize: 14 }}
            >
              {item.lastMessage || "Nuevo chat"}
            </Text>

            {unread > 0 && (
              <View
                style={{
                  backgroundColor: "#2563eb",
                  width: 24,
                  height: 24,
                  borderRadius: 12,
                  justifyContent: "center",
                  alignItems: "center",
                  marginLeft: 8,
                }}
              >
                <Text style={{ color: "white", fontSize: 12, fontWeight: "bold" }}>
                  {unread}
                </Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f1f5f9" }}>
      
      {/* Header */}
      <View style={{ padding: 20, paddingBottom: 10 }}>
        <Text style={{ fontSize: 28, fontWeight: "bold" }}>Chats</Text>
        <Text style={{ color: "#6b7280", marginTop: 4 }}>
          Conversaciones recientes
        </Text>
      </View>

      <View style={{ flex: 1, padding: 16 }}>
        <FlatList
          data={chatRooms}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
        />
      </View>
    </SafeAreaView>
  );
}
