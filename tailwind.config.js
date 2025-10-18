
module.exports = {
  // Asegúrate de que el modo oscuro esté configurado
  darkMode: "class",
  
  // Incluye el preset de NativeWind aquí
  presets: [require("nativewind/preset")],
  
  // Rutas a todos tus archivos
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}", 
  ],
  
  theme: {
    extend: {
      colors: {
        "az-primario": "#3A86FF",
        "gris-acento": "#E5E7EB",
        "fondo-claro": "#F9FAFB",
        "texto-oscuro": "#1F2937",
        "texto-claro": "#FFFFFF",
        "exito-verde": "#4CAF50",
        "advertencia-naranja": "#FF9800",
        "error-rojo": "#EF4444",
      },
    },
  },
  plugins: [],
};