import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth'; 
import { getFirestore } from 'firebase/firestore'; 
// 💡 1. Importar el servicio de Storage
import { getStorage } from 'firebase/storage';

// 🚨 CONFIGURACIÓN REAL DE FIREBASE 🚨
const firebaseConfigREAL = {
  apiKey: "AIzaSyD3fyepMAjW9N9Fv7hp0wEB-WuKanZdweM",
  authDomain: "mobilityplus-53365.firebaseapp.com",
  projectId: "mobilityplus-53365",
  storageBucket: "mobilityplus-53365.firebasestorage.app", // 👈 Esta línea es clave para Storage
  messagingSenderId: "469413148093",
  appId: "1:1469413148093:web:d5142aafe8c5b9481f4ed4",
  measurementId: "G-GJ8RK2VENB"
};

// 1. Inicializar Firebase App
const app = initializeApp(firebaseConfigREAL);

// 2. Obtener los servicios que usaremos
const auth = getAuth(app); 
const db = getFirestore(app); 
// 💡 2. Obtener el servicio de Storage
const storage = getStorage(app); 

// 3. Exportar los servicios
export { app, auth, db, storage }; // 💡 3. Exportar storage