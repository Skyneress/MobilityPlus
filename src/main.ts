import 'zone.js';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { routes } from './app/app.routes'; // <- tus rutas definidas

bootstrapApplication(App, {
  ...appConfig,
  providers: [
    provideRouter(routes), // <- aquí registras el router
    ...(appConfig.providers || []), // <- conserva tus providers anteriores
  ],
}).catch((err) => console.error(err));