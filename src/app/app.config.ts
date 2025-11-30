import { ApplicationConfig, provideZoneChangeDetection, ErrorHandler } from '@angular/core'; // 1. Importar ErrorHandler
import { provideRouter, withInMemoryScrolling } from '@angular/router'; 
import { routes } from './app.routes';

import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { jwtInterceptor } from './interceptors/jwt-interceptor';

// 2. Importar tu manejador global
import { GlobalErrorHandler } from './core/handlers/global-error-handler';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),

    provideRouter(
      routes,
      withInMemoryScrolling({
        scrollPositionRestoration: 'top', 
      })
    ),

    provideHttpClient(
      withInterceptors([jwtInterceptor])
    ),

    { provide: ErrorHandler, useClass: GlobalErrorHandler }
  ],
};