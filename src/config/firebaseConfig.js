import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore'; 
import { getStorage } from 'firebase/storage';
// 💡 1. Importaciones NATIVAS para Auth
import { initializeAuth, getReactNativePersistence } from 'firebase/auth'; 
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage'; // 💡 2. La librería que instalamos

// 🚨 CONFIGURACIÓN REAL DE FIREBASE 🚨
const firebaseConfigREAL = {
  apiKey: "AIzaSyD3fyepMAjW9N9Fv7hp0wEB-WuKanZdweM",
  authDomain: "mobilityplus-53365.firebaseapp.com",
  projectId: "mobilityplus-53365",
  storageBucket: "mobilityplus-53365.firebasestorage.app",
  messagingSenderId: "469413148093",
  appId: "1:469413148093:web:d5142aafe8c5b9481f4ed4",
  measurementId: "G-GJ8RK2VENB"
};

// 1. Inicializar Firebase App
const app = initializeApp(firebaseConfigREAL);

// 💡 2. Inicializar Auth con PERSISTENCIA NATIVA (La corrección estructural)
// Reemplaza la simple llamada a getAuth()
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

// 3. Obtener los otros servicios
const db = getFirestore(app); 
const storage = getStorage(app); 

// 4. Exportar los servicios
export { app, auth, db, storage };
