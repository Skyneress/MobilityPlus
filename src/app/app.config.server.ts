import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
import { provideServerRendering, withRoutes } from '@angular/ssr';
import { appConfig } from './app.config';
import { serverRoutes } from './app.routes.server';

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore"; // Si vas a usar Firestore
import { getAuth } from "firebase/auth";     // Si vas a usar Autenticación
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional


const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(withRoutes(serverRoutes))
  ]
};

export const config = mergeApplicationConfig(appConfig, serverConfig);

const firebaseConfig = {
  apiKey: "AIzaSyD3fyepMAjW9N9Fv7hp0wEB-WuKanZdweM",
  authDomain: "mobilityplus-53365.firebaseapp.com",
  projectId: "mobilityplus-53365",
  storageBucket: "mobilityplus-53365.firebasestorage.app",
  messagingSenderId: "469413148093",
  appId: "1:469413148093:web:d5142aafe8c5b9481f4ed4",
  measurementId: "G-GJ8RK2VENB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const db = getFirestore(app); // Para Cloud Firestore


export const serverAppConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes), // Asegúrate de tener tus rutas configuradas aquí
    // Aquí puedes añadir otros providers si usas las bibliotecas de AngularFire
    // por ejemplo, para inyectar los servicios de Firebase directamente
    // import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
    // import { provideFirestore, getFirestore } from '@angular/fire/firestore';
    // provideFirebaseApp(() => initializeApp(firebaseConfig)),
    // provideFirestore(() => getFirestore()),
  ]
};