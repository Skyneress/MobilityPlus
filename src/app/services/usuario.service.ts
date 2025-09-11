import { Injectable, Inject } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { getFirestore } from "firebase/firestore"; // Si vas a usar Firestore
import { getAuth } from "firebase/auth";     // Si vas a usar Autenticación


@Injectable({
  providedIn: 'root'
})
export class UsuarioServiceTs {

  constructor(@Inject(AngularFirestore) private firestore: AngularFirestore) {}

  // Este método guarda un nuevo usuario en la colección 'usuarios'
  crearUsuario(usuario: Usuario) {
    return this.firestore.collection('usuarios').add(usuario);
  }
  
}
