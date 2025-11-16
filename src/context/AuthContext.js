import React, { createContext, useState, useEffect, useContext } from 'react';
import { onAuthStateChanged } from 'firebase/auth'; // Importación clave
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebaseConfig'; 

// 1. Crear el Contexto
const AuthContext = createContext();

// 2. Proveedor del Contexto
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [role, setRole] = useState(null);
    const [loading, setLoading] = useState(true);

    // Esta función busca el ROL en la colección "users"
    const fetchUserRole = async (uid) => {
        try {
            // Usamos la colección "users" que definimos en el Registro
            const userDocRef = doc(db, "users", uid); 
            const userDoc = await getDoc(userDocRef);
            
            if (userDoc.exists()) {
                const userData = userDoc.data();
                setRole(userData.role); // Asigna el rol ('patient' o 'nurse')
            } else {
                console.warn('Usuario autenticado (Auth) pero sin datos en Firestore (users).');
                setRole(null); 
            }
        } catch (error) {
            console.error("Error al obtener el rol del usuario:", error);
            setRole(null);
        }
    };

    useEffect(() => {
        // onAuthStateChanged es el "oyente" de Firebase que escucha
        // los inicios de sesión (signInWithEmailAndPassword) y cierres de sesión.
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                // Usuario logueado
                setUser(firebaseUser);
                await fetchUserRole(firebaseUser.uid); // Buscamos su rol
                setLoading(false);
            } else {
                // Usuario deslogueado
                setUser(null);
                setRole(null);
                setLoading(false);
            }
        });

        return () => unsubscribe(); // Limpiar la suscripción
    }, []);

    // Objeto de valor del contexto que se pasa a los hijos
    const value = {
        user,
        role,
        loading,
        userId: user?.uid,
        isAuthenticated: !!user, // Booleano simple (true/false)
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

// Hook personalizado para usar el contexto fácilmente en otros archivos
export const useAuth = () => useContext(AuthContext);