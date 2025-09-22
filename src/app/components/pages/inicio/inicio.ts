import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { NavbarComponent } from "../../shared/navbar.component/navbar.component";

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NavbarComponent],
  templateUrl: './inicio.html',
  styleUrls: ['./inicio.css']
})
export class Inicio {
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
      acceptTerms: [false, [Validators.requiredTrue]]
    }, { validators: this.passwordMatchValidator });
  }

  // VALIDADOR CORREGIDO - Versión simplificada y funcional
  private passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (!password || !confirmPassword) {
      return null;
    }

    // Limpia errores previos en confirmPassword
    if (confirmPassword.errors && confirmPassword.errors['mismatch']) {
      const errors = { ...confirmPassword.errors };
      delete errors['mismatch'];
      confirmPassword.setErrors(Object.keys(errors).length ? errors : null);
    }

    // Si las contraseñas coinciden, retorna null (sin errores)
    if (password.value === confirmPassword.value) {
      return null;
    }

    // Si no coinciden, aplica el error al control de confirmPassword
    confirmPassword.setErrors({ ...confirmPassword.errors, mismatch: true });
    return { mismatch: true };
  }

  async onSubmit() {
    console.log('Formulario válido:', this.registerForm.valid);
    console.log('Errores del formulario:', this.registerForm.errors);
    console.log('Errores de confirmPassword:', this.registerForm.get('confirmPassword')?.errors);

    if (this.registerForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      try {
        const { email, password, telefono, nombre, apellido, direccion } = this.registerForm.value;
        
        console.log('📤 Intentando crear usuario:', email);
        
        const result = await this.authService.registerUser({
          email,
          password,
          telefono: '+56' + telefono,
          nombre,
          apellido,
          direccion,
          rol: 'paciente'
        });

        console.log('✅ Usuario creado exitosamente');
        window.alert('🎉 ¡Usuario creado exitosamente!');
        
        this.router.navigate(['/paciente-inicio']);
        
      } catch (error: any) {
        console.error('❌ Error al crear usuario:', error);
        this.errorMessage = error.message || 'Error desconocido';
        window.alert('❌ Error: ' + this.errorMessage);
      } finally {
        this.isLoading = false;
      }
    } else {
      console.log('Formulario inválido - Mostrando alerta');
      window.alert('⚠️ Por favor, completa todos los campos correctamente');
      this.markFormGroupTouched(this.registerForm);
    }
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }
}