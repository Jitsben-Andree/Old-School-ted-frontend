import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, catchError, tap } from 'rxjs';
import { Carrito, AddItemRequest } from '../models/carrito';
import { AuthService } from './auth'; // Necesario para saber si está logueado

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private readonly API_URL = 'http://localhost:8080/api/v1/carrito';
  
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  // --- Signal para el estado del Carrito ---
  // Mantenemos una copia local del carrito para actualizar la UI al instante.
  public cart = signal<Carrito | null>(null);

  constructor() {
    // Si el usuario ya está logueado al cargar la app,
    // podríamos cargar su carrito inicial.
    // (Esto lo haremos más adelante en app.component.ts)
  }

  /**
   * Obtiene el carrito del usuario desde el backend.
   * Llama a: GET /carrito/mi-carrito
   * (Protegido por Interceptor)
   */
  getMiCarrito(): Observable<Carrito> {
    return this.http.get<Carrito>(`${this.API_URL}/mi-carrito`).pipe(
      tap(carrito => this.cart.set(carrito)), // Actualiza el signal
      catchError(this.handleError)
    );
  }

  /**
   * Añade un item al carrito.
   * Llama a: POST /carrito/agregar
   * (Protegido por Interceptor)
   */
  addItem(productoId: number, cantidad: number): Observable<Carrito> {
    const request: AddItemRequest = { productoId, cantidad };
    return this.http.post<Carrito>(`${this.API_URL}/agregar`, request).pipe(
      tap(carrito => this.cart.set(carrito)), // Actualiza el signal
      catchError(this.handleError)
    );
  }

  /**
   * Elimina un item del carrito.
   * Llama a: DELETE /carrito/eliminar/{detalleCarritoId}
   * (Protegido por Interceptor)
   */
  removeItem(detalleCarritoId: number): Observable<Carrito> {
    return this.http.delete<Carrito>(`${this.API_URL}/eliminar/${detalleCarritoId}`).pipe(
      tap(carrito => this.cart.set(carrito)), // Actualiza el signal
      catchError(this.handleError)
    );
  }

  /**
   * Limpia el carrito local (al hacer logout)
   */
  clearCartOnLogout() {
    this.cart.set(null);
  }

  private handleError(error: HttpErrorResponse) {
    console.error("CartService Error:", error.message, error.status);
    if (error.status === 401 || error.status === 403) {
      // Si el token expira o no es válido, cerramos sesión
      this.authService.logout();
      return throwError(() => new Error('Sesión expirada. Por favor, inicie sesión.'));
    }
    return throwError(() => new Error('Error al procesar el carrito.'));
  }
}