import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormGroup, Validators, ReactiveFormsModule, FormBuilder } from '@angular/forms'; // Importar FormBuilder
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-registro-paciente',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './registro-paciente.html',
  styleUrls: ['./registro-paciente.css'] // Usar styleUrls en plural
})
export class RegistroPaciente {

  /* registerForm!: FormGroup; // Inicializar directamente o usar !
  isLoading = false; // Corregido nombre de propiedad
  errorMessage = '';

  constructor(
    private fb: FormBuilder, // FormBuilder debe ser inyectado
    private authService: AuthService
  ) {
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      telefono: ['', [Validators.required]],
      nombre: ['', [Validators.required]],
      apellido: ['', [Validators.required]],
      direccion: ['', [Validators.required]],
      acceptTerms: [false, [Validators.requiredTrue]]
    }, { validators: this.passwordMatchValidator }); // Usar 'validators' en plural para validadores personalizados
  }

  private passwordMatchValidator(formGroup: FormGroup) { // Corregido nombre de parámetro y tipo
    // Corregido acceso a los controles y nombres de campos
    return formGroup.get('password')?.value === formGroup.get('confirmPassword')?.value
      ? null : { mismatch: true };
  }

  async onSubmit() { // Corregido nombre de método a onSubmit
    if (this.registerForm.valid && !this.isLoading) {
      this.isLoading = true;
      this.errorMessage = '';

      try { // Corregido 'trei' a 'try'
        const userData = {
          email: this.registerForm.value.email, // Corregido acceso a email
          password: this.registerForm.value.password,
          telefono: this.formatPhoneNumber(this.registerForm.value.telefono), // Corregido nombre de método
          nombre: this.registerForm.value.nombre,
          apellido: this.registerForm.value.apellido,
          direccion: this.registerForm.value.direccion,
          rol: 'paciente'
        };

        const result = await this.authService.registroUsuario(userData);
        console.log('Usuario Creado:', result);
        // Aquí podrías añadir lógica para redirigir al usuario o mostrar un mensaje de éxito

      } catch (error: any) {
        this.errorMessage = error.message; // Corregido nombre de propiedad
      } finally {
        this.isLoading = false;
      }
    }
  }

  private formatPhoneNumber(telefono: string): string { // Corregido nombre de método y parámetro
    // Formatea el teléfono a +569xxxxxxx
    const numeroLimpio = telefono.replace(/\D/g, ''); // Elimina caracteres no numéricos
    // Asumiendo que el teléfono en Chile para móviles empieza con 9
    if (numeroLimpio.startsWith('9')) {
        return `+569${numeroLimpio.substring(1)}`; // Si ya empieza con 9, asegúrate de que solo haya un 9
    } else {
        return `+56${numeroLimpio}`; // Si no empieza con 9, añade el prefijo
    }
  } */
}
