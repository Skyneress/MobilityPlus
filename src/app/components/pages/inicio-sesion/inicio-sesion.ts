import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-inicio-sesion',
  standalone: true,
  templateUrl: './inicio-sesion.html',
  styleUrls: ['./inicio-sesion.css'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule
  ]
})
export class InicioSesion {
  loginForm: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });

    // 👇 Redirigir si ya está logueado
    this.checkLoggedInUser();
  }

  private async checkLoggedInUser() {
    const currentUser = await this.authService.getCurrentUser();
    if (currentUser && currentUser.uid) {
      // Si el usuario ya está logueado, ir directo al dashboard del paciente
      this.router.navigate(['/paciente/inicio']);
    }
  }

  async onLogin() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const { email, password } = this.loginForm.value;

    try {
      // Intentar iniciar sesión
      await this.authService.login(email, password);

      // 👇 Redirigir al layout del paciente
      this.router.navigate(['/paciente/inicio']);
    } catch (error: any) {
      console.error('Error al iniciar sesión:', error);
      alert(error.message || 'Correo o contraseña incorrectos.');
    } finally {
      this.isLoading = false;
    }
  }

  // Getters para validaciones en el template
  get emailControl() {
    return this.loginForm.get('email')!;
  }

  get passwordControl() {
    return this.loginForm.get('password')!;
  }
}
