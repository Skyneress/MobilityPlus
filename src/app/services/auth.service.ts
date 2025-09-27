import { Injectable } from '@angular/core';
import { 
  Auth, 
  createUserWithEmailAndPassword,
  signOut,
  User,
  UserCredential,
  authState,
  signInWithEmailAndPassword
} from '@angular/fire/auth';
import { 
  Firestore, 
  doc, 
  setDoc, 
  getDoc, 
  serverTimestamp 
} from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, firstValueFrom } from 'rxjs';

// Agrega esta interfaz si no la tienes
export interface UserData {
  uid: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  direccion?: string;
  role?: string;
  createdAt?: any;
  updatedAt?: any;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  // ✅ Observable con el usuario actual
  usuario$: Observable<User | null>;
  // ✅ Estado del usuario con BehaviorSubject (útil para Navbar y guards)
  private usuarioSubject = new BehaviorSubject<User | null>(null);

  constructor(
    private auth: Auth,
    private firestore: Firestore,
    private router: Router
  ) {
    this.usuario$ = authState(this.auth); 
    this.usuario$.subscribe((user) => this.usuarioSubject.next(user));
  }

  // ✅ MÉTODO NUEVO PARA EL SIDEBAR - Obtener datos completos del usuario actual
  async getCurrentUserData(): Promise<UserData | null> {
    try {
      const user = this.auth.currentUser;
      if (!user) {
        return null;
      }

      const userDocRef = doc(this.firestore, `users/${user.uid}`);
      const userSnap = await getDoc(userDocRef);
      
      if (userSnap.exists()) {
        const userData = userSnap.data() as UserData;
        return {
          ...userData,
          uid: user.uid
        };
      } else {
        console.warn('⚠️ Usuario no encontrado en Firestore');
        // Retornar datos básicos del auth si no existen en Firestore
        return {
          uid: user.uid,
          nombre: user.displayName || 'Usuario',
          apellido: '',
          email: user.email || '',
          telefono: '',
          direccion: '',
          role: 'paciente'
        };
      }
    } catch (error) {
      console.error('❌ Error al obtener datos del usuario:', error);
      throw new Error('Error al cargar información del usuario');
    }
  }

  // ✅ MÉTODO ALTERNATivo como Observable (opcional)
  getUserDataObservable(uid: string): Observable<UserData | null> {
    return new Observable(subscriber => {
      this.getCurrentUserData()
        .then(data => {
          subscriber.next(data);
          subscriber.complete();
        })
        .catch(error => {
          subscriber.error(error);
        });
    });
  }

  // ... el resto de tus métodos existentes se mantienen igual ...

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
      this.usuarioSubject.next(null);
      // 🔄 Aquí sí mantenemos redirección
      this.router.navigate(['/inicio']);
      console.log('✅ Sesión cerrada exitosamente');
    } catch (error: any) {
      console.error('❌ Error al cerrar sesión:', error);
      throw new Error('Error al cerrar sesión');
    }
  }

  // ✅ Obtener datos del usuario desde Firestore (método existente)
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

  // ✅ Obtener usuario actual una sola vez (Promise)
  getCurrentUser(): Promise<User | null> {
    return firstValueFrom(this.usuario$);
  }

  // ✅ Registrar usuario y guardar datos
  async registerUser(userData: any): Promise<any> {
    try {
      console.log('📤 Iniciando registro de usuario:', userData.email);
      
      const userCredential: UserCredential = await this.register(
        userData.email,
        userData.password
      );

      const uid = userCredential.user.uid;
      console.log('✅ Usuario creado en Authentication, UID:', uid);

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
        role: userData.rol || userData.role || 'paciente'
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
      'auth/email-already-in-use': 'Este correo ya está registrado',
      'auth/weak-password': 'La contraseña es demasiado débil (mínimo 6 caracteres)',
      'auth/invalid-email': 'Correo electrónico inválido',
      'auth/operation-not-allowed': 'Operación no permitida',
      'auth/user-disabled': 'Esta cuenta ha sido deshabilitada',
      'auth/user-not-found': 'Usuario no encontrado',
      'firestore/write-failed': 'Error al guardar datos del usuario en la base de datos',
      'firestore/not-found': 'Usuario no encontrado en la base de datos',
      'firestore/permission-denied': 'No tienes permisos para realizar esta acción',
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

  // ✅ Método para login (ya no redirige, solo autentica)
  async login(email: string, password: string): Promise<User | null> {
    try {
      const credential = await signInWithEmailAndPassword(this.auth, email, password);
      this.usuarioSubject.next(credential.user);
      return credential.user; // 👈 devolvemos solo el user
    } catch (error: any) {
      console.error('❌ Error en login:', error);
      throw new Error(this.getErrorMessage(error.code));
    }
  }

  // ✅ Verificar si hay un usuario logueado
  async isLoggedIn(): Promise<boolean> {
    const user = await firstValueFrom(this.usuario$);
    return !!user;
  }

  // ✅ Obtener UID del usuario actual
  async getCurrentUserId(): Promise<string | null> {
    const user = await this.getCurrentUser();
    return user ? user.uid : null;
  }
}