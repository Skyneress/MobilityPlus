import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

const PRIMARY_COLOR = "#3A86FF"; 
const GRAY_ACCENT = "#E5E7EB";

const EditFieldModal = ({ isVisible, onClose, initialValue, fieldLabel, onSave }) => {
    const [newValue, setNewValue] = useState(initialValue);

    // Sincronizar el estado interno con el valor inicial al abrir el modal
    useEffect(() => {
        setNewValue(initialValue);
    }, [initialValue]);

    const handleSave = () => {
        if (newValue && newValue.trim() !== initialValue) {
            onSave(newValue.trim());
        }
        onClose();
    };

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={isVisible}
            onRequestClose={onClose}
        >
            <View style={styles.centeredView}>
                <View style={styles.modalView} className="bg-white p-6 rounded-2xl shadow-xl">
                    
                    <Text className="text-xl font-bold text-az-primario mb-3">
                        Editar {fieldLabel}
                    </Text>
                    
                    <TextInput
                        className="w-full border border-gris-acento rounded-lg px-4 py-3 bg-fondo-claro mb-6"
                        placeholder={`Ingresa nuevo ${fieldLabel.toLowerCase()}`}
                        value={newValue}
                        onChangeText={setNewValue}
                        autoFocus={true}
                    />

                    <View className="flex-row justify-end space-x-3 w-full">
                        <TouchableOpacity
                            className="bg-gris-acento/50 py-3 px-5 rounded-full"
                            onPress={onClose}
                        >
                            <Text className="text-texto-oscuro font-semibold">Cancelar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            className="bg-az-primario py-3 px-5 rounded-full"
                            onPress={handleSave}
                        >
                            <Text className="text-white font-semibold">Guardar</Text>
                        </TouchableOpacity>
                    </View>

                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.4)', // Fondo oscuro semitransparente
    },
    modalView: {
        margin: 20,
        width: '90%',
        maxWidth: 400, 
    },
});

export default EditFieldModal;