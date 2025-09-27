import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { UserData } from 'src/app/services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.css']
})
export class SidebarComponent implements OnInit {
  isLoading: boolean = true;
  userData: UserData | null = null;

  constructor(private authService: AuthService) {}

  async ngOnInit(): Promise<void> {
    await this.loadUserData();
  }

  async loadUserData(): Promise<void> {
    try {
      this.isLoading = true;
      // Asumiendo que tu AuthService tiene un método para obtener datos del usuario
      this.userData = await this.authService.getCurrentUserData();
    } catch (error) {
      console.error('Error al cargar datos del usuario:', error);
    } finally {
      this.isLoading = false;
    }
  }

  async logout(): Promise<void> {
    try {
      await this.authService.logout();
      // Redirigir al login o página principal después del logout
      window.location.href = '/login'; // O usar Router para navegación programática
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  }
}