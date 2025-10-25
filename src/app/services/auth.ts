import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

// Importa los modelos (DTOs)
import { AuthResponse } from '../models/auth-response';
import { LoginRequest } from '../models/login-request';
import { RegisterRequest } from '../models/register-request';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private http = inject(HttpClient);
  
  // URL de tu API de autenticación en Spring Boot
  private API_URL = 'http://localhost:8080/api/v1/auth';

  // --- Signals para el estado de autenticación ---
  
  // Signal para el token JWT. Inicia con el valor de localStorage.
  public jwtToken = signal<string | null>(localStorage.getItem('token'));
  
  // Signal para la información del usuario. Inicia con el valor de localStorage.
  public currentUser = signal<AuthResponse | null>(
    JSON.parse(localStorage.getItem('user') || 'null')
  );

  // --- Signals Computados (derivados) ---

  /**
   * Signal computado que nos dice si el usuario está logueado.
   * La app reaccionará automáticamente a sus cambios.
   */
  public isLoggedIn = computed(() => !!this.jwtToken());

  /**
   * Signal computado que nos dice si el usuario es Administrador.
   */
  public isAdmin = computed(() => 
    this.currentUser()?.roles?.includes('Administrador') ?? false
  );


  /**
   * (Cliente) Registra un nuevo usuario.
   * Llama a: POST /api/v1/auth/register
   */
  public register(request: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/register`, request).pipe(
      tap(response => this.saveAuthData(response)), // Guarda la data al registrarse
      catchError(this.handleError)
    );
  }

  /**
   * (Cliente) Inicia sesión.
   * Llama a: POST /api/v1/auth/login
   */
  public login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/login`, request).pipe(
      tap(response => this.saveAuthData(response)), // Guarda la data al iniciar sesión
      catchError(this.handleError)
    );
  }

  /**
   * (Cliente) Cierra la sesión.
   */
  public logout(): void {
    // 1. Borra de localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    // 2. Limpia los signals
    this.jwtToken.set(null);
    this.currentUser.set(null);
    
    // (Opcional) Redirigir al login (aunque el navbar ya lo hace)
  }

  /**
   * Helper privado para guardar el token y la info del usuario
   * en localStorage y en los signals.
   */
  private saveAuthData(response: AuthResponse): void {
    // 1. Guarda en localStorage
    localStorage.setItem('token', response.token);
    localStorage.setItem('user', JSON.stringify(response));

    // 2. Actualiza los signals
    this.jwtToken.set(response.token);
    this.currentUser.set(response);
  }

  // --- Manejador de Errores ---
  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error('Ocurrió un error en AuthService:', error.message);
    const errorMsg = error.error?.email || error.message || 'Error desconocido en el servicio de autenticación.';
    return throwError(() => new Error(errorMsg));
  }
}