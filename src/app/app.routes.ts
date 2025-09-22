import { Routes } from '@angular/router';

import { RegistroPaciente } from './components/pages/registro-paciente/registro-paciente';
import { Inicio } from './components/pages/inicio/inicio';
import { PacienteInicio } from './components/pages/paciente-inicio/paciente-inicio';

export const routes: Routes = [
  { 
    path: '', 
    component: Inicio
  },
  { 
    path: 'paciente-inicio', 
    component: PacienteInicio 
  },
  { 
    path: 'registro-paciente', 
    component: RegistroPaciente
  },
  { path: '', component: PacienteInicio }, // Esta es la página de inicio con el formulario
  // Otras rutas de tu aplicación
  { path: 'paciente-inicio', component: PacienteInicio } // un ejemplo
];