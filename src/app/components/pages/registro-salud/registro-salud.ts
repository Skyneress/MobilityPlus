import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { NavbarComponent } from "../../shared/navbar.component/navbar.component";

@Component({
  selector: 'app-registro-salud',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NavbarComponent],
  templateUrl: './registro-salud.html',
  styleUrls: ['./registro-salud.css']
})
export class RegistroSalud {
  registerForm: FormGroup;
  isLoading: boolean = false;
  errorMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      telefono: ['', [Validators.required, Validators.pattern('[0-9]{9}')]],
      nombre: ['', [Validators.required]],
      apellido: ['', [Validators.required]],
      direccion: ['', [Validators.required]],
      especialidad: ['', [Validators.required]], // 👈 Campo extra para profesionales
      aceptoTerminos: [false, [Validators.requiredTrue]]
    }, { validators: this.passwordMatchValidator });
  }

  // 🔐 Validador de coincidencia de contraseñas
  private passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');
    if (!password || !confirmPassword) return null;

    if (confirmPassword.errors && confirmPassword.errors['mismatch']) {
      const errors = { ...confirmPassword.errors };
      delete errors['mismatch'];
      confirmPassword.setErrors(Object.keys(errors).length ? errors : null);
    }

    if (password.value === confirmPassword.value) {
      return null;
    }

    confirmPassword.setErrors({ ...confirmPassword.errors, mismatch: true });
    return { mismatch: true };
  }

  // 🚀 Método de envío del formulario
  async onSubmit() {
    if (this.registerForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      try {
        const { email, password, telefono, nombre, apellido, direccion, especialidad } = this.registerForm.value;

        console.log('📤 Creando profesional de la salud:', email);

        await this.authService.registerUser({
          email,
          password,
          telefono: '+56' + telefono,
          nombre,
          apellido,
          direccion,
          especialidad,
          rol: 'profesional',
          collection: 'users_profesionales' // Debería guardar en la colección de profesionales
        });

        window.alert('✅ Profesional de la salud creado exitosamente');
        this.router.navigate(['/profesional-inicio']);

      } catch (error: any) {
        console.error('❌ Error al crear profesional de la salud:', error);
        this.errorMessage = error.message || 'Error desconocido';
        window.alert('❌ Error: ' + this.errorMessage);
      } finally {
        this.isLoading = false;
      }
    } else {
      window.alert('⚠️ Por favor, completa todos los campos correctamente');
      this.markFormGroupTouched(this.registerForm);
    }
  }

  // 🔄 Marca todos los campos como "tocados"
  private markFormGroupTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }
}
