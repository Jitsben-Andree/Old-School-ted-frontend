import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { AuthResponse } from '../models/auth-response';
import { LoginRequest } from '../models/login-request';
import { RegisterRequest } from '../models/register-request';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // URL de tu API de Spring Boot
  private readonly API_URL = 'http://localhost:8080/api/v1/auth';

  // Inyecta el HttpClient
  private http = inject(HttpClient);

  // --- Signals para manejar el estado de autenticación ---
  
  // 1. Signal privado para el token
  #jwtToken = signal<string | null>(localStorage.getItem('token'));
  
  // 2. Signal privado para los datos del usuario
  #currentUser = signal<AuthResponse | null>(JSON.parse(localStorage.getItem('user') || 'null'));

  // --- Signals públicos (computados) ---

  // 3. Signal público para saber si está logueado
  public isLoggedIn = computed(() => !!this.#jwtToken());

  // 4. Signal público para obtener el token (usado por el Interceptor)
  public currentToken = computed(() => this.#jwtToken());
  
  // 5. Signal público para obtener los datos del usuario
  public currentUser = computed(() => this.#currentUser());

  // 6. Signal público para saber si es Admin
  public isAdmin = computed(() => 
    this.#currentUser()?.roles?.includes('Administrador') ?? false
  );


  constructor() { }

  /**
   * Llama al endpoint /login del backend
   */
  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/login`, request).pipe(
      tap(response => {
        // Al tener éxito, guardamos los datos
        this.saveAuthentication(response);
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Llama al endpoint /register del backend
   */
  register(request: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/register`, request).pipe(
      tap(response => {
        // Al tener éxito, guardamos los datos (auto-login)
        this.saveAuthentication(response);
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Cierra la sesión del usuario
   */
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.#jwtToken.set(null);
    this.#currentUser.set(null);
    // (Opcional) Redirigir al home
    // this.router.navigate(['/']);
  }

  /**
   * Guarda el token y los datos del usuario en localStorage y en los Signals
   */
  private saveAuthentication(response: AuthResponse) {
    localStorage.setItem('token', response.token);
    localStorage.setItem('user', JSON.stringify(response));
    this.#jwtToken.set(response.token);
    this.#currentUser.set(response);
  }

  /**
   * Manejador de errores simple
   */
  private handleError(error: HttpErrorResponse) {
    console.error("AuthService Error:", error.message);
    let userMessage = 'Ocurrió un error. Por favor, intenta de nuevo.';
    if (error.status === 401 || error.status === 403) {
      userMessage = 'Credenciales incorrectas.';
    } else if (error.error && error.error.email) {
      // Captura el error de email duplicado del backend
      userMessage = error.error.email;
    }
    return throwError(() => new Error(userMessage));
  }
}
