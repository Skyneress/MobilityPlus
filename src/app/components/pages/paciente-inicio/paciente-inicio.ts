import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { User } from '@angular/fire/auth'; // Importa el tipo User de Firebase

@Component({
  selector: 'app-paciente-inicio',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './paciente-inicio.html',
  styleUrls: ['./paciente-inicio.css']
})
export class PacienteInicio implements OnInit {
  userData: any = null;
  isLoading: boolean = true;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  async ngOnInit() {
    await this.loadUserData();
    
  }

  private async loadUserData() {
    try {
      // Cambio aquí: usar tipo any o el tipo específico que retorna tu AuthService
      const currentUser: any = this.authService.getCurrentUser();
      
      // Verificación más estricta
      if (currentUser && currentUser.uid) {
        // Obtener datos adicionales de Firestore
        this.userData = await this.authService.getUserData(currentUser.uid);
        console.log('Datos del usuario:', this.userData);
      } else {
        console.warn('No hay usuario autenticado');
        this.router.navigate(['/']);
      }
    } catch (error) {
      console.error('Error cargando datos:', error);
      this.router.navigate(['/']);
    } finally {
      this.isLoading = false;
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  // Métodos para las acciones
  buscarEspecialistas() {
    this.router.navigate(['/especialistas']);
  }

  agendarCita() {
    this.router.navigate(['/agendar-cita']);
  }

  verHistorial() {
    this.router.navigate(['/historial']);
  }
  
}