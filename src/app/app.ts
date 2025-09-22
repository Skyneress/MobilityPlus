import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './components/shared/navbar.component/navbar.component';
import { initializeApp } from 'firebase/app';
import {RouterModule} from '@angular/router';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent, RouterModule],
  templateUrl: './app.html',
  styleUrls: ['./app.css'], 
})
export class App {
  // Si necesitas mantener alguna lógica aquí, pero lo ideal es que esté en los componentes individuales
}

const firebaseConfig = {
  apiKey: "AIzaSyD3fyepMAjW9N9Fv7hp0wEB-WuKanZdweM",
  authDomain: "mobilityplus-53365.firebaseapp.com",
  projectId: "mobilityplus-53365",
  storageBucket: "mobilityplus-53365.firebasestorage.app",
  messagingSenderId: "469413148093",
  appId: "1:469413148093:web:d5142aafe8c5b9481f4ed4",
  measurementId: "G-GJ8RK2VENB"
};

// Inicializa la aplicación Firebase
const app = initializeApp(firebaseConfig);