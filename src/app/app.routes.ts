import { Routes } from '@angular/router';

import { Inicio } from './components/pages/inicio/inicio';
import { PacienteInicio } from './components/pages/paciente-inicio/paciente-inicio';
import { RegistroSalud } from './components/pages/registro-salud/registro-salud';
import { InicioSesion } from './components/pages/inicio-sesion/inicio-sesion';
import { RegistroPaciente } from './components/pages/registro-paciente/registro-paciente';
import { PacientePerfil } from './components/pages/paciente-perfil/paciente-perfil';

// Layouts
import { GeneralLayoutComponent } from './layouts/general/general';
import { Paciente } from './layouts/paciente/paciente';

export const routes: Routes = [
  // Rutas públicas
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

  // Rutas privadas del paciente 
  {
    path: 'paciente',
    component: Paciente, 
    children: [
      { path: 'inicio', component: PacienteInicio },
      { path: 'perfil', component: PacientePerfil },
      { path: '', redirectTo: 'inicio', pathMatch: 'full' }
    ]
  },

  // Wildcard → redirigir al inicio
  { path: '**', redirectTo: '', pathMatch: 'full' }
];
