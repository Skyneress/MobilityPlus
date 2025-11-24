import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons'; 

const PRIMARY_COLOR = "#3A86FF"; 
const GRAY_ACCENT = "#E5E7EB";

/**
 * Componente para ingresar un servicio y su precio.
 * @param {string} id - ID único del bloque.
 * @param {function} onChange - Callback (id, {nombre, precioClp})
 * @param {function} onRemove - Callback (id)
 */
const ServicePriceItem = ({ id, onChange, onRemove }) => {
    const [nombre, setNombre] = useState('');
    const [precio, setPrecio] = useState('');
    
    // Notifica al padre cuando el nombre o precio cambian
    useEffect(() => {
        const parsedPrice = parseInt(precio, 10);
        
        onChange(id, {
            nombre: nombre,
            // Solo pasamos el precio si es un número válido y positivo
            precioClp: (nombre && !isNaN(parsedPrice) && parsedPrice > 0) ? parsedPrice : null 
        });

    }, [nombre, precio, id]);

    return (
        <View className="bg-white p-3 rounded-lg border border-gris-acento mb-2 flex-row items-start">
            
            {/* Input Nombre del Servicio */}
            <View className="flex-1 mr-2">
                <TextInput
                    className="w-full border-b border-gris-acento/50 px-1 py-1 text-texto-oscuro"
                    placeholder="Nombre del Servicio"
                    onChangeText={setNombre}
                    value={nombre}
                />
            </View>

            {/* Input Precio */}
            <View className="w-1/3 mr-2">
                <TextInput
                    className="w-full border-b border-gris-acento/50 px-1 py-1 text-texto-oscuro text-right"
                    placeholder="CLP"
                    keyboardType="numeric"
                    onChangeText={setPrecio}
                    value={precio}
                />
            </View>

            {/* Botón Eliminar */}
            <TouchableOpacity 
                onPress={() => onRemove(id)}
                className="p-1 rounded-full bg-red-100 items-center justify-center"
            >
                <Ionicons name="trash-outline" size={20} color="#EF4444" />
            </TouchableOpacity>
        </View>
    );
};

export default ServicePriceItem;