import React, { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView, TextInput, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons'; 

const PRIMARY_COLOR = "#3A86FF"; 
const GRAY_ACCENT = "#E5E7EB";

// Datos de ejemplo para el chat
const mockMessages = [
  { id: 1, text: "Hola, soy Viviana. ¿Llegas pronto?", sender: 'patient' },
  { id: 2, text: "Hola Viviana. Ya estoy a 5 minutos, confirmo mi llegada en breve. Estoy con uniforme azul.", sender: 'nurse' },
  { id: 3, text: "Perfecto, gracias.", sender: 'patient' },
];

// Componente para una burbuja de mensaje
const MessageBubble = ({ message, sender }) => {
    const isNurse = sender === 'nurse';
    return (
        <View className={`flex-row mb-3 ${isNurse ? 'justify-end' : 'justify-start'}`}>
            <View className={`max-w-[80%] p-3 rounded-xl ${isNurse ? 'bg-az-primario' : 'bg-gray-200'}`}>
                <Text className={`text-base ${isNurse ? 'text-white' : 'text-gray-800'}`}>
                    {message}
                </Text>
                <Text className={`text-[10px] mt-1 ${isNurse ? 'text-white/70' : 'text-gray-500'} self-end`}>
                    14:35 PM
                </Text>
            </View>
        </View>
    );
};

const ChatScreen = ({ navigation, route }) => {
    const { contactName, contactRole } = route.params || { contactName: "Dr. Smith", contactRole: "Enfermero" };
    const [messages, setMessages] = useState(mockMessages);
    const [inputText, setInputText] = useState('');

    const handleSend = () => {
        if (inputText.trim() === '') return;

        const newMessage = {
            id: messages.length + 1,
            text: inputText.trim(),
            sender: 'nurse', // Simula que siempre enviamos como el rol actual (Enfermero o Paciente)
        };

        setMessages([...messages, newMessage]);
        setInputText('');
    };

    return (
        <SafeAreaView className="flex-1 bg-fondo-claro">
            <View className="flex-1">
                
                {/* 🧭 Encabezado Superior (Header) */}
                <View className="flex-row items-center px-4 py-5 bg-az-primario rounded-b-lg shadow-md">
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Ionicons name="arrow-back-outline" size={28} color="#FFFFFF" />
                    </TouchableOpacity>
                    <Text className="text-xl font-bold text-texto-claro ml-4">{contactName}</Text>
                    <Text className="text-sm text-texto-claro/80 ml-2">({contactRole})</Text>
                </View>

                {/* Área de Mensajes */}
                <ScrollView 
                    className="flex-1 p-4" 
                    contentContainerStyle={{ paddingBottom: 20 }}
                    ref={scrollViewRef => scrollViewRef && scrollViewRef.scrollToEnd({ animated: true })}
                >
                    {messages.map(msg => (
                        <MessageBubble key={msg.id} message={msg.text} sender={msg.sender} />
                    ))}
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