import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Switch, Alert } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons'; 

const PRIMARY_COLOR = "#3A86FF"; 
const TEXT_DARK = "#1F2937";
const GRAY_ACCENT = "#E5E7EB";
const SUCCESS_COLOR = "#4CAF50";

/**
 * Componente de entrada para seleccionar un servicio y establecer su precio.
 *
 * @param {string} label - Nombre legible del servicio (ej: "Curación de Heridas").
 * @param {string} idServicio - ID único para la base de datos (ej: "curacion_heridas").
 * @param {function} updateServices - Función callback para actualizar el estado principal del array de servicios.
 */
const ServicePriceInput = ({ label, idServicio, updateServices }) => {
    // 💡 Estado interno para controlar si el servicio está activo y su precio.
    const [isEnabled, setIsEnabled] = useState(false);
    const [price, setPrice] = useState('');
    const [error, setError] = useState(false);

    // 💡 Lógica para notificar al componente padre (RegisterScreen) cuando cambian los estados
    useEffect(() => {
        // Solo notificamos si el servicio está habilitado
        if (isEnabled) {
            const parsedPrice = parseInt(price, 10);
            
            // Validación de precio: debe ser un número positivo
            if (isNaN(parsedPrice) || parsedPrice <= 0) {
                setError(true);
                // Si hay un error, lo pasamos al padre con precio nulo para forzar la validación en el registro
                updateServices({
                    idServicio,
                    nombre: label,
                    precioClp: null, // Esto indica un valor inválido
                    active: true
                });
                return;
            }
            
            setError(false);
            // Pasar el objeto de servicio válido
            updateServices({
                idServicio,
                nombre: label,
                precioClp: parsedPrice,
                active: true
            });

        } else {
            // Si el servicio se desactiva, notificamos para eliminarlo del array.
            setError(false);
            updateServices({ idServicio, active: false });
        }
    }, [isEnabled, price, idServicio, label]); // Se ejecuta al cambiar enabled o price

    // Maneja el cambio del switch
    const handleToggle = () => {
        // Limpiamos el precio si se desactiva para evitar guardar basura
        if (isEnabled) {
            setPrice('');
        }
        setIsEnabled(prev => !prev);
    };

    return (
        <View className="bg-white p-4 rounded-lg border" style={{ borderColor: isEnabled ? SUCCESS_COLOR : GRAY_ACCENT }}>
            
            {/* TOGGLE Y NOMBRE DEL SERVICIO */}
            <View className="flex-row justify-between items-center mb-3">
                <Text className="text-base font-semibold text-texto-oscuro flex-1">{label}</Text>
                <Switch
                    onValueChange={handleToggle}
                    value={isEnabled}
                    trackColor={{ false: GRAY_ACCENT, true: "#DCFCE7" }}
                    thumbColor={isEnabled ? SUCCESS_COLOR : "#F3F4F6"}
                />
            </View>

            {/* INPUT DE PRECIO (solo visible si está habilitado) */}
            {isEnabled && (
                <View>
                    <TextInput
                        className={`w-full border rounded-lg px-4 py-3 bg-fondo-claro text-texto-oscuro ${error ? 'border-red-500' : 'border-gris-acento'}`}
                        placeholder="Precio en CLP (Ej: 15000)"
                        keyboardType="numeric"
                        onChangeText={setPrice}
                        value={price}
                    />
                    {error && (
                        <Text className="text-red-500 text-xs mt-1 flex-row items-center">
                            <Ionicons name="alert-circle-outline" size={14} color="#EF4444" /> Precio inválido o vacío.
                        </Text>
                    )}
                </View>
            )}
        </View>
    );
};

export default ServicePriceInput;