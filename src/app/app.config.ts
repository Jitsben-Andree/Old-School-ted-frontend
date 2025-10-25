import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

// 1. Importa los providers de HttpClient y el interceptor
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { jwtInterceptor } from './interceptors/jwt-interceptor';

// (app.routes será creado en el siguiente paso)
// import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),

    // (Descomenta esto cuando creemos app.routes.ts)
    // provideRouter(routes),
    provideRouter(routes),

    // 2. Añade el provider para HttpClient
    provideHttpClient(
      // 3. Registra tu interceptor aquí
      withInterceptors([jwtInterceptor])
    ),
  ],
};
