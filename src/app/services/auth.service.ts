import { Injectable } from '@angular/core';
import { 
  Auth, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  UserCredential
} from '@angular/fire/auth';
import { 
  Firestore, 
  doc, 
  setDoc, 
  getDoc, 
  serverTimestamp 
} from '@angular/fire/firestore';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    private auth: Auth,
    private firestore: Firestore,
    private router: Router
  ) {}

  // ✅ Registrar usuario en Firebase Auth
  register(email: string, password: string): Promise<UserCredential> {
    return createUserWithEmailAndPassword(this.auth, email, password);
  }

  // ✅ Guardar datos adicionales en Firestore
  async saveUserData(uid: string, data: any): Promise<void> {
    try {
      const userDocRef = doc(this.firestore, `users/${uid}`);
      await setDoc(userDocRef, {
        ...data,
        uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      console.log('✅ Datos del usuario guardados en Firestore');
    } catch (error: any) {
      console.error('❌ Error al guardar datos en Firestore:', error);
      throw new Error(this.getErrorMessage('firestore/write-failed'));
    }
  }

  // ✅ Verificar si un usuario ya existe en Firestore
  async checkUserExists(uid: string): Promise<boolean> {
    try {
      const userDocRef = doc(this.firestore, `users/${uid}`);
      const userSnap = await getDoc(userDocRef);
      return userSnap.exists();
    } catch (error) {
      console.error('Error verificando existencia del usuario:', error);
      return false;
    }
  }

  // ✅ Cerrar sesión
  async logout(): Promise<void> {
    try {
      await signOut(this.auth);
      this.router.navigate(['/inicio']);
      console.log('✅ Sesión cerrada exitosamente');
    } catch (error: any) {
      console.error('❌ Error al cerrar sesión:', error);
      throw new Error('Error al cerrar sesión');
    }
  }

  // ✅ Obtener datos del usuario desde Firestore
  async getUserData(uid: string): Promise<any> {
    try {
      const userDocRef = doc(this.firestore, `users/${uid}`);
      const userSnap = await getDoc(userDocRef);
      if (userSnap.exists()) {
        return userSnap.data();
      } else {
        throw new Error('Usuario no encontrado en la base de datos');
      }
    } catch (error: any) {
      console.error('❌ Error al obtener datos del usuario:', error);
      throw new Error(this.getErrorMessage('firestore/not-found'));
    }
  }

  // ✅ Obtener el usuario actualmente autenticado
  getCurrentUser(): Promise<User | null> {
    return new Promise((resolve) => {
      onAuthStateChanged(this.auth, (user) => {
        resolve(user);
      });
    });
  }

  // ✅ Registrar usuario y guardar datos (versión completa)
  async registerUser(userData: any): Promise<any> {
    try {
      console.log('📤 Iniciando registro de usuario:', userData.email);
      
      const userCredential: UserCredential = await this.register(
        userData.email,
        userData.password
      );

      const uid = userCredential.user.uid;
      console.log('✅ Usuario creado en Authentication, UID:', uid);

      // Verificar si el usuario ya existe (por si acaso)
      const userExists = await this.checkUserExists(uid);
      if (userExists) {
        console.warn('⚠️ El usuario ya existe en Firestore, actualizando datos...');
      }

      await this.saveUserData(uid, {
        email: userData.email,
        nombre: userData.nombre,
        apellido: userData.apellido,
        telefono: userData.telefono,
        direccion: userData.direccion,
        role: userData.rol || userData.role || 'paciente' // Compatibilidad con ambos nombres
      });

      console.log("✅ Usuario creado y datos guardados en Firestore");

      return { 
        success: true, 
        user: userCredential.user,
        uid: uid,
        message: 'Usuario registrado exitosamente' 
      };
      
    } catch (error: any) {
      console.error("❌ Error al crear usuario o guardar en Firestore: ", error);
      throw new Error(this.getErrorMessage(error.code));
    }
  }

  // ✅ Manejo de errores mejorado
  private getErrorMessage(errorCode: string): string {
    const errorMessages: { [key: string]: string } = {
      // Auth errors
      'auth/email-already-in-use': 'Este correo ya está registrado',
      'auth/weak-password': 'La contraseña es demasiado débil (mínimo 6 caracteres)',
      'auth/invalid-email': 'Correo electrónico inválido',
      'auth/operation-not-allowed': 'Operación no permitida',
      'auth/user-disabled': 'Esta cuenta ha sido deshabilitada',
      'auth/user-not-found': 'Usuario no encontrado',
      
      // Firestore errors
      'firestore/write-failed': 'Error al guardar datos del usuario en la base de datos',
      'firestore/not-found': 'Usuario no encontrado en la base de datos',
      'firestore/permission-denied': 'No tienes permisos para realizar esta acción',
      
      // Network errors
      'auth/network-request-failed': 'Error de conexión. Verifica tu internet',
    };
    
    return errorMessages[errorCode] || `Error inesperado: ${errorCode}`;
  }

  // ✅ Alias por compatibilidad
  registroUsuario(userData: { 
    email: any; 
    password: any; 
    telefono: string; 
    nombre: any; 
    apellido: any; 
    direccion: any; 
    rol?: string;
    role?: string;
  }): Promise<any> {
    return this.registerUser(userData);
  }

  // ✅ Método para login (si lo necesitas después)
  async login(email: string, password: string): Promise<UserCredential> {
    try {
      const { signInWithEmailAndPassword } = await import('@angular/fire/auth');
      return await signInWithEmailAndPassword(this.auth, email, password);
    } catch (error: any) {
      console.error('❌ Error en login:', error);
      throw new Error(this.getErrorMessage(error.code));
    }
  }

  // ✅ Verificar si hay un usuario logueado
  isLoggedIn(): Promise<boolean> {
    return new Promise((resolve) => {
      onAuthStateChanged(this.auth, (user) => {
        resolve(!!user);
      });
    });
  }

  // ✅ Obtener UID del usuario actual
  async getCurrentUserId(): Promise<string | null> {
    const user = await this.getCurrentUser();
    return user ? user.uid : null;
  }
}