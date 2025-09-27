import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

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
      const currentUser: any = await this.authService.getCurrentUser(); // 

      if (currentUser && currentUser.uid) {
        // Obtener datos adicionales de Firestore
        this.userData = await this.authService.getUserData(currentUser.uid);
        console.log('Datos del usuario:', this.userData);
      } else {
        console.warn('No hay usuario autenticado');
        this.router.navigate(['/inicio-sesion']); // 
      }
    } catch (error) {
      console.error('Error cargando datos:', error);
      this.router.navigate(['/inicio-sesion']);
    } finally {
      this.isLoading = false;
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/inicio-sesion']); // 
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