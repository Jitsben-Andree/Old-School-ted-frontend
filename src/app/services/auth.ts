import { HttpClient, HttpErrorResponse } from '@angular/common/http';

import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

// Importa los modelos (DTOs)
import { AuthResponse } from '../models/auth-response';
import { LoginRequest } from '../models/login-request';
import { RegisterRequest } from '../models/register-request';
import { UnlockRequest } from '../models/UnlockRequest';
import { computed, inject, Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private http = inject(HttpClient);
  
  // URL de tu API (confirmada por tu application.properties)
  private API_URL = 'http://localhost:8080/api/v1/auth';

  // --- Signals para el estado de autenticación ---
  public jwtToken = signal<string | null>(localStorage.getItem('token'));
  public currentUser = signal<AuthResponse | null>(
    JSON.parse(localStorage.getItem('user') || 'null')
  );

  // --- Signals Computados (derivados) ---
  public isLoggedIn = computed(() => !!this.jwtToken());
  public isAdmin = computed(() => 
    this.currentUser()?.roles?.includes('Administrador') ?? false
  );

  /**
   * (Cliente) Registra un nuevo usuario.
   * Llama a: POST /api/v1/auth/register
   */
  public register(request: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/register`, request).pipe(
      tap(response => this.saveAuthData(response)),
      catchError(this.handleError)
    );
  }

  /**
   * (Cliente) Inicia sesión.
   * Llama a: POST /api/v1/auth/login
   */
  public login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/login`, request).pipe(
      tap(response => this.saveAuthData(response)),
      catchError(this.handleError) // El handleError se encarga de lanzar el error
    );
  }

  /**
   * (Cliente) Cierra la sesión.
   */
  public logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.jwtToken.set(null);
    this.currentUser.set(null);
  }

  /**
   * (NUEVO) PASO 1: Solicita un código de reseteo o reenvía uno.
   * Llama a: POST /api/v1/auth/request-reset
   */
  public requestResetCode(email: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.API_URL}/request-reset`, { email }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * (NUEVO) PASO 2: Desbloquea la cuenta o resetea la contraseña.
   * Llama a: POST /api/v1/auth/unlock
   */
  public unlockAccount(request: UnlockRequest): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.API_URL}/unlock`, request).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Helper privado para guardar el token y la info del usuario.
   */
  private saveAuthData(response: AuthResponse): void {
    localStorage.setItem('token', response.token);
    localStorage.setItem('user', JSON.stringify(response));
    this.jwtToken.set(response.token);
    this.currentUser.set(response);
  }

  // --- Manejador de Errores ---
  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error('Ocurrió un error en AuthService:', error.message);
    
    // El backend ahora envía un objeto, ej: { error: "Mensaje" }
    const errorMsg = error.error?.error || // Nuestro error {error: "..."}
                     error.error?.message || // Error estándar de Spring
                     error.message || // Mensaje de HttpErrorResponse
                     'Error desconocido en el servicio de autenticación.';
    
    // Lanzamos el mensaje de error específico
    return throwError(() => new Error(errorMsg));
  }
}