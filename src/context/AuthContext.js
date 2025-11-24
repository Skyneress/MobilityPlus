import React, { createContext, useState, useEffect, useContext } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../config/firebaseConfig";

// 1. Crear el Contexto
const AuthContext = createContext();

// 2. Proveedor del Contexto
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true); // Esta función busca el ROL y el Perfil en la colección "users"

  const fetchUserData = async (uid) => {
    const userDocRef = doc(db, "users", uid); // 💡 Función de Re-lectura con límite (para el caso de race condition)
    const attemptFetch = async (retries = 3) => {
      try {
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();

          if (userData && userData.role) {
            setRole(userData.role);
            setUserProfile(userData);
            setLoading(false); // ÉXITO: Detener la carga
            return true; // Retorna true si tuvo éxito
          }
        }

        // 💡 Si no encuentra el documento o el rol, y quedan reintentos
        if (retries > 0) {
          console.warn(
            `[AuthContext] Intento fallido. Reintentando en 1s... (quedan ${retries})`
          );
          await new Promise((resolve) => setTimeout(resolve, 1000));
          return attemptFetch(retries - 1); // Llamada recursiva
        }

        console.error(
          "[AuthContext] Máximo de reintentos alcanzado. Rol no asignado."
        );
        setRole("unassigned"); // Asigna un rol de respaldo para salir del loop
        setLoading(false); // FALLO: Detener la carga después de fallar
      } catch (error) {
        console.error("Error al obtener el rol del usuario:", error);
        setRole(null);
        setLoading(false); // FALLO: Detener la carga por error
      }
      return false;
    };

    await attemptFetch();
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        setLoading(true); // Siempre que haya un usuario, asumimos que debemos buscar el rol
        await fetchUserData(firebaseUser.uid); // Buscamos rol y perfil
      } else {
        setUser(null);
        setRole(null);
        setUserProfile(null);
        setLoading(false); // NO hay usuario, entonces la carga termina
      }
    });
    return () => unsubscribe();
  }, []); // Objeto de valor del contexto que se pasa a los hijos

  const value = {
    user,
    role,
    userProfile,
    loading,
    userId: user?.uid,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook personalizado para usar el contexto
export const useAuth = () => useContext(AuthContext);
