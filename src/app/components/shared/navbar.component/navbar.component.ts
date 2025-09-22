import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({  // ← Asegúrate de tener este decorador
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',  // ← Asegúrate que coincida
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {  // ← Cambia a NavbarComponent
  currentView: string = 'inicio';

  setView(viewName: string): void {
    this.currentView = viewName;
    // Opcional: navegar con router si prefieres
    // this.router.navigate([viewName]);
  }
}