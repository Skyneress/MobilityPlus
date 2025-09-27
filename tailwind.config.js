module.exports = {
  // Actualiza rutas a todos los archivos que usen clases de NativeWind
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./screens/**/*.{js,jsx,ts,tsx}", //tuve que añadir esto para que funcionara
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        "az-primario": "#3A86FF", // Azul vibrante para elementos principales
        "gris-acento": "#E5E7EB", // Gris claro para campos de entrada y bordes
        "fondo-claro": "#F9FAFB", // Blanco roto para fondos de pantalla
        "texto-oscuro": "#1F2937", // Gris oscuro para texto principal
        "texto-claro": "#FFFFFF", // Blanco para texto sobre fondos oscuros
        "exito-verde": "#4CAF50", // Verde para mensajes de éxito
        "advertencia-naranja": "#FF9800", // Naranja para advertencias
        "error-rojo": "#EF4444", // Rojo para errores
      },
    },
  },
  plugins: [],
};
