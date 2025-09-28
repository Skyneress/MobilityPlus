import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service'
import { UserData } from 'src/app/services/auth.service';

@Component({
  selector: 'app-paciente-perfil',
  imports: [CommonModule],
  templateUrl: './paciente-perfil.html',
  styleUrl: './paciente-perfil.css'
})
export class PacientePerfil implements OnInit {
  userData: UserData | null = null;
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
      // Usar el nuevo método que creamos en el AuthService
      this.userData = await this.authService.getCurrentUserData();
      console.log('Datos del perfil:', this.userData);
    } catch (error) {
      console.error('Error cargando datos del perfil:', error);
      // Si hay error, redirigir al inicio de sesión
      this.router.navigate(['/inicio-sesion']);
    } finally {
      this.isLoading = false;
    }
  }

  async logout() {
    try {
      await this.authService.logout();
      // El servicio ya maneja la redirección a '/inicio'
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  }
}