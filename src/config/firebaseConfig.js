import { initializeApp } from 'firebase/app';
// Importamos los servicios necesarios para la aplicación: Auth y Firestore.
import { getAuth } from 'firebase/auth'; 
import { getFirestore } from 'firebase/firestore'; 

// 🚨 CONFIGURACIÓN REAL DE FIREBASE 🚨
// Credenciales de tu proyecto mobilityplus-53365
const firebaseConfigREAL = {
  apiKey: "AIzaSyD3fyepMAjW9N9Fv7hp0wEB-WuKanZdweM",
  authDomain: "mobilityplus-53365.firebaseapp.com",
  projectId: "mobilityplus-53365",
  storageBucket: "mobilityplus-53365.firebasestorage.app",
  messagingSenderId: "469413148093",
  appId: "1:469413148093:web:d5142aafe8c5b9481f4ed4",
  measurementId: "G-GJ8RK2VENB"
};

// 1. Inicializar Firebase App con la configuración real
const app = initializeApp(firebaseConfigREAL);

// 2. Obtener los servicios que usaremos
const auth = getAuth(app); // Provee el Login, Registro y estado de usuario
const db = getFirestore(app); // Provee la Base de Datos NoSQL Firestore

// 3. Exportar los servicios para que puedan ser usados en toda la aplicación
export { app, auth, db };