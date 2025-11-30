import React, { useState, useEffect } from "react";
import { 
    View, 
    Text, 
    FlatList, 
    TouchableOpacity, 
    ActivityIndicator, 
    Alert, 
    SafeAreaView 
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { collection, query, where, onSnapshot, doc, updateDoc, serverTimestamp, orderBy } from "firebase/firestore";
import { db } from "../../config/firebaseConfig";
import { useSafeAreaInsets } from 'react-native-safe-area-context'; 
import { signOut } from 'firebase/auth'; 
import { auth } from '../../config/firebaseConfig'; 
// 🚨 CORRECCIÓN CLAVE: IMPORTAR PICKER
import { Picker } from '@react-native-picker/picker'; 

const PRIMARY_COLOR = "#3A86FF"; 
const STATUS_COLORS = {
    "pendiente": "#FF9800",
    "verificado": "#10B981",
    "rechazado": "#EF4444",
};

const AdminVerificationScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    
    const [pendingProfessionals, setPendingProfessionals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('pendiente'); 

    useEffect(() => {
        // 1. Definir la consulta base
        const professionalsRef = collection(db, "profesionales");
        let q = query(professionalsRef);

        // 2. Aplicar filtro de estado dinámico
        if (statusFilter !== 'all') {
            q = query(q, where("estadoVerificacion", "==", statusFilter));
        }
        
        // 3. Ordenar por fecha de registro
        q = query(q, orderBy("fechaRegistro", "desc"));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const list = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                name: `${doc.data().nombre || ''} ${doc.data().apellido || ''}`.trim() 
            }));
            setPendingProfessionals(list);
            setLoading(false);
        }, (error) => {
            console.error("Error al cargar profesionales pendientes: ", error);
            Alert.alert("Error", "No se pudieron cargar los profesionales pendientes.");
            setLoading(false);
        });

        return () => unsubscribe(); 
    }, [statusFilter]);

    const approveProfessional = async (userId, name) => {
        Alert.alert(
            "Aprobar Profesional",
            `¿Estás seguro de que quieres aprobar a ${name}?`,
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Aprobar",
                    onPress: async () => {
                        try {
                            const profDocRef = doc(db, "profesionales", userId);
                            await updateDoc(profDocRef, { estadoVerificacion: "verificado", approvedAt: serverTimestamp() });
                            
                            const userDocRef = doc(db, "users", userId);
                            await updateDoc(userDocRef, { estadoVerificacion: "verificado" });

                            Alert.alert("Éxito", `${name} ha sido aprobado. Ya puede iniciar sesión.`);
                        } catch (error) {
                            console.error("Error al aprobar profesional: ", error);
                            Alert.alert("Error", `No se pudo aprobar a ${name}.`);
                        }
                    }
                }
            ]
        );
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity
            onPress={() => navigation.navigate('AdminProDetail', { professionalId: item.id })}
            className="flex-row justify-between items-center p-4 bg-white border-b border-gray-200"
        >
            <View className="flex-1 pr-3">
                <Text className="text-lg font-bold text-texto-oscuro">{item.name}</Text>
                <Text className="text-sm text-gray-600">{item.email}</Text>
                <Text className="text-sm font-semibold mt-1" style={{ color: PRIMARY_COLOR }}>
                    {item.especialidadNombre || item.especialidad}
                </Text>
            </View>
            <View>
                <Text className="text-xs font-bold" style={{ color: STATUS_COLORS[item.estadoVerificacion] }}>
                    {item.estadoVerificacion.toUpperCase()}
                </Text>
            </View>
        </TouchableOpacity>
    );

    const handleLogout = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            Alert.alert("Error", "No se pudo cerrar sesión.");
            console.error("Logout Error:", error);
        }
    };


    if (loading) {
        return (
            <View className="flex-1 justify-center items-center">
                <ActivityIndicator size="large" color={PRIMARY_COLOR} />
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: '#f0f0f0' }}>
            
            {/* Header */}
            <View className="flex-row items-center justify-between px-4 py-3 bg-blue-600" style={{ paddingTop: insets.top }}> 
                
                <View className="flex-row items-center">
                    <Ionicons name="shield-checkmark" size={28} color="#FFFFFF" />
                    <Text className="text-xl text-white font-bold ml-4">
                        Admin Panel
                    </Text>
                </View>

                {/* 💡 BOTÓN DE CERRAR SESIÓN */}
                <TouchableOpacity onPress={handleLogout} className="p-2">
                    <Ionicons name="log-out-outline" size={28} color="#FFFFFF" />
                </TouchableOpacity>
            </View>
            
            {/* 💡 SELECTOR DE ESTADO */}
            <View className="p-4 bg-white border-b border-gray-200">
                <Text className="text-sm text-gray-600 mb-2">Filtrar por Estado:</Text>
                <View className="border border-gray-300 rounded-lg overflow-hidden">
                    {/* 🚨 ESTO ES LO QUE NECESITABA LA IMPORTACIÓN */}
                    <Picker
                        selectedValue={statusFilter}
                        onValueChange={(itemValue) => setStatusFilter(itemValue)}
                    >
                        <Picker.Item label="Pendientes de Aprobación" value="pendiente" />
                        <Picker.Item label="Aprobados/Verificados" value="verificado" />
                        <Picker.Item label="Rechazados" value="rechazado" />
                        <Picker.Item label="Todos los estados" value="all" />
                    </Picker>
                </View>
                <Text className="text-sm text-gray-700 mt-3 font-semibold">
                    Mostrando {pendingProfessionals.length} resultados.
                </Text>
            </View>

            {pendingProfessionals.length === 0 && !loading ? (
                <View className="flex-1 justify-center items-center p-5">
                    <Text className="text-xl text-gray-600 text-center">
                        🎉 No hay resultados para el filtro "{statusFilter.toUpperCase()}".
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={pendingProfessionals}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={{ paddingBottom: insets.bottom + 20, paddingTop: 10 }}
                />
            )}
        </View>
    );
};

export default AdminVerificationScreen;