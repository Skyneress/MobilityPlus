import { Routes } from '@angular/router';

import { Inicio } from './components/pages/inicio/inicio';
import { PacienteInicio } from './components/pages/paciente-inicio/paciente-inicio';
import { RegistroSalud } from './components/pages/registro-salud/registro-salud';
import { InicioSesion } from './components/pages/inicio-sesion/inicio-sesion';
import { RegistroPaciente } from './components/pages/registro-paciente/registro-paciente';

// 👇 Usa el nombre correcto del layout y la ruta correcta
import { GeneralLayoutComponent } from './layouts/general/general';

export const routes: Routes = [
  {
    path: '',
    component: GeneralLayoutComponent,
    children: [
      { path: '', component: Inicio },
      { path: 'registro-paciente', component: RegistroPaciente },
      { path: 'registro-salud', component: RegistroSalud },
      { path: 'inicio-sesion', component: InicioSesion },
    ],
  },

  // Inicio del paciente (dashboard)
  { path: 'paciente-inicio', component: PacienteInicio },

  // Wildcard: cualquier ruta inexistente → redirigir al inicio
  { path: '**', redirectTo: '', pathMatch: 'full' }
];
