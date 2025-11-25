import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ScreenContainer = ({ children, customStyle }) => {
    const insets = useSafeAreaInsets();

    return (
        <View 
            style={[
                styles.container,
                // Aplicamos los insets del notch/barra de estado en la parte superior
                { paddingTop: insets.top }, 
                customStyle
            ]}
        >
            {children}
            {/* NOTA: El padding inferior para el Tab Bar lo aplicaremos 
              directamente al componente de la Tab Bar en cada pantalla 
            */}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0f0f0', // Color de fondo general de tu aplicación
    },
});

export default ScreenContainer;