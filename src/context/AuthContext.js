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
    const [userProfile, setUserProfile] = useState(null); // 💡 ESTADO PARA DATOS
    const [loading, setLoading] = useState(true);

    // Esta función busca el ROL y el Perfil en la colección "users"
    const fetchUserData = async (uid) => {
        try {
            const userDocRef = doc(db, "users", uid); 
            const userDoc = await getDoc(userDocRef);
            
            if (userDoc.exists()) {
                const userData = userDoc.data();
                setRole(userData.role); // Asigna el rol
                setUserProfile(userData); // 💡 GUARDA EL PERFIL COMPLETO
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
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                setUser(firebaseUser);
                await fetchUserData(firebaseUser.uid); // Buscamos rol y perfil
                setLoading(false);
            } else {
                setUser(null);
                setRole(null);
                setUserProfile(null); // Limpiamos perfil
                setLoading(false);
            }
        });
        return () => unsubscribe(); 
    }, []);

    // Objeto de valor del contexto que se pasa a los hijos
    const value = {
        user,
        role,
        userProfile, // 💡 ¡AÑADIDO! Ahora está disponible en useAuth()
        loading,
        userId: user?.uid,
        isAuthenticated: !!user, 
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

// Hook personalizado para usar el contexto
export const useAuth = () => useContext(AuthContext);
