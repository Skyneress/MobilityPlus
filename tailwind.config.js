/** @type {import('tailwindcss').Config} */
module.exports = {
// Actualiza rutas a todos los archivos que usen clases de NativeWind
content: [
"./App.{js,jsx,ts,tsx}",
"./components/**/*.{js,jsx,ts,tsx}",
"./screens/**/*.{js,jsx,ts,tsx}"            //tuve que añadir esto para que funcionara
],
presets: [require("nativewind/preset")],
theme: { extend: {} },
plugins: [],
};