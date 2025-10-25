import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { PedidoRequest } from '../models/pedido-request';
import { Pedido } from '../models/pedido';
import { AuthService } from './auth';

@Injectable({
  providedIn: 'root'
})
export class PedidoService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private API_URL = 'http://localhost:8080/api/v1/pedidos';

  // Nota: Todas estas rutas están protegidas y requieren el token,
  // pero el 'jwtInterceptor' lo añade automáticamente.

  /**
   * (Cliente) Crea un nuevo pedido a partir del carrito.
   */
  crearPedido(request: PedidoRequest): Observable<Pedido> {
    return this.http.post<Pedido>(`${this.API_URL}/crear`, request).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * (Cliente) Obtiene el historial de pedidos del usuario logueado.
   */
  getMisPedidos(): Observable<Pedido[]> {
    return this.http.get<Pedido[]>(`${this.API_URL}/mis-pedidos`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * (Cliente) Obtiene un pedido específico por ID.
   */
  getPedidoById(pedidoId: number): Observable<Pedido> {
    return this.http.get<Pedido>(`${this.API_URL}/${pedidoId}`).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    console.error("PedidoService Error:", error.message, error.status);
    if (error.status === 400) {
      // Errores de negocio (ej. "Stock insuficiente", "Carrito vacío")
      return throwError(() => new Error(error.error?.message || 'Error en la solicitud. Revisa el stock o tu carrito.'));
    }
    if (error.status === 401 || error.status === 403) {
      return throwError(() => new Error('No autorizado. Por favor, inicie sesión.'));
    }
    return throwError(() => new Error('Error al procesar el pedido.'));
  }
}