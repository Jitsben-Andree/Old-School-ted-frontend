import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { AuthService } from './auth'; // ajusta la ruta si es distinta

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        // HttpClient real (sin salir a red) + respeta interceptores registrados en DI
        provideHttpClient(withInterceptorsFromDi()),
        // Módulo de testing para mockear las peticiones HTTP
        provideHttpClientTesting(),
        // Si el servicio navega al hacer logout/login
        provideRouter([]),
        // El propio servicio a probar
        AuthService,
      ],
    }).compileComponents();

    service = TestBed.inject(AuthService);
  });

  it('debe crearse el servicio AuthService', () => {
    expect(service).toBeTruthy();
  });

  it('debe tener el método login definido', () => {
    expect(typeof (service as any).login).toBe('function');
  });

  it('debe tener el método logout definido', () => {
    expect(typeof (service as any).logout).toBe('function');
  });
});
