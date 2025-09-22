import { Injectable } from '@angular/core';
import { 
  Firestore, 
  collection, 
  addDoc,
  CollectionReference,
  DocumentData 
} from '@angular/fire/firestore';
import { Usuario } from '../models/usuario.model';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private usuariosCollection: CollectionReference<DocumentData>;

  constructor(private firestore: Firestore) {
    this.usuariosCollection = collection(this.firestore, 'usuarios');
  }

  async crearUsuario(usuario: Usuario): Promise<string> {
    try {
      const docRef = await addDoc(this.usuariosCollection, usuario);
      console.log("Usuario creado exitosamente con ID:", docRef.id);
      return docRef.id;
    } catch (error) {
      console.error("Error al crear usuario:", error);
      throw error; // Propaga el error para manejarlo en el componente
    }
  }
}