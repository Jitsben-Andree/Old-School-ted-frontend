import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Carrito } from '../models/carrito';
import { AddItemRequest } from '../models/add-item-request';
import { AuthService } from './auth';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private API_URL = 'http://localhost:8080/api/v1/carrito';

  // Carrito local (Signal) para actualizaciones en tiempo real
  public cart = signal<Carrito | null>(null);

  private createAuthHeaders(): HttpHeaders {
    // Obtenemos el token desde el signal del AuthService
    const token = this.authService.jwtToken(); 
    
    if (!token) {
      console.error("No se encontró token para la petición del carrito");
      // Devolver cabeceras vacías o manejar el error
      return new HttpHeaders();
    }

    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  /**
   * Obtiene el carrito del usuario desde la API
   */
  getMiCarrito(): Observable<Carrito> {
    return this.http.get<Carrito>(`${this.API_URL}/mi-carrito`, { 
      headers: this.createAuthHeaders() 
    }).pipe(
      tap(carrito => this.cart.set(carrito)), // Actualiza el signal
      catchError(err => this.handleError(err))
    );
  }

  /**
   * Añade un item al carrito
   */
  addItem(productoId: number, cantidad: number): Observable<Carrito> {
    const request: AddItemRequest = { productoId, cantidad };
    return this.http.post<Carrito>(`${this.API_URL}/agregar`, request, { 
      headers: this.createAuthHeaders() 
    }).pipe(
      tap(carrito => this.cart.set(carrito)), // Actualiza el signal
      catchError(err => this.handleError(err))
    );
  }
  
  /**
   * Elimina un item del carrito
   */
  removeItem(detalleCarritoId: number): Observable<Carrito> {
    return this.http.delete<Carrito>(`${this.API_URL}/eliminar/${detalleCarritoId}`, { 
      headers: this.createAuthHeaders() 
    }).pipe(
      tap(carrito => this.cart.set(carrito)), // Actualiza el signal
      catchError(err => this.handleError(err))
    );
  }

  /**
   * Limpia el carrito local (el signal) después de que un pedido se completa.
   * Esto soluciona el error TS2339 en checkout.ts
   */
  public clearCartOnLogout(): void {
    this.cart.set(null);
  }

  /**
   * Manejador de errores centralizado para este servicio
   */
  private handleError(error: HttpErrorResponse) {
    console.error("CartService Error:", error.message, error.status, error.error);
    if (error.status === 401 || error.status === 403) {
      // Si no estamos autorizados, podríamos desloguear al usuario
      // this.authService.logout(); 
      return throwError(() => new Error('No autorizado. Por favor, inicie sesión de nuevo.'));
    }
    // Devuelve un error observable para que el componente lo maneje
    return throwError(() => new Error('Error al procesar el carrito. Intente más tarde.'));
  }
}

