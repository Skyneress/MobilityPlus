import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { routes } from './app.routes';



// Configuración local (elimina environment.firebaseConfig si no lo usas)
const firebaseConfig = {
  apiKey: "AIzaSyD3fyepMAjW9N9Fv7hp0wEB-WuKanZdweM",
  authDomain: "mobilityplus-53365.firebaseapp.com",
  projectId: "mobilityplus-53365",
  storageBucket: "mobilityplus-53365.firebasestorage.app",
  messagingSenderId: "469413148093",
  appId: "1:469413148093:web:d5142aafe8c5b9481f4ed4",
  measurementId: "G-GJ8RK2VENB"
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    provideFirebaseApp(() => initializeApp(firebaseConfig)), // ← Usa la variable local
    provideFirestore(() => getFirestore()),
    provideAuth(() => getAuth())
  ]
};