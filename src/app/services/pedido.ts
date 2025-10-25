import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { PedidoRequest } from '../models/pedido-request';
import { PedidoResponse, DetallePedido } from '../models/pedido'; // Asegúrate que pedido.model.ts exporte ambos
import { AdminUpdateEnvioRequest } from '../models/admin-update-envio-request';
import { AdminUpdatePagoRequest } from '../models/admin-update-pago-request';
import { AdminUpdatePedidoStatusRequest } from '../models/admin-update-pedido-request';

@Injectable({
  providedIn: 'root'
})
export class PedidoService {

  private http = inject(HttpClient);
  // URL para endpoints de Cliente
  private apiUrl = 'http://localhost:8080/api/v1/pedidos';
  // URL para endpoints de Admin (basado en el AdminPedidoController.java)
  private adminApiUrl = 'http://localhost:8080/api/v1/admin/pedidos';

  // --- MÉTODOS DE CLIENTE (Usan 'apiUrl' y el token de cliente) ---

  /**
   * (Cliente) Crea un nuevo pedido a partir del carrito.
   * Llama a: POST /api/v1/pedidos/crear
   */
  crearPedidoDesdeCarrito(request: PedidoRequest): Observable<PedidoResponse> {
    return this.http.post<PedidoResponse>(`${this.apiUrl}/crear`, request).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * (Cliente) Obtiene el historial de pedidos del usuario logueado.
   * Llama a: GET /api/v1/pedidos/mis-pedidos
   */
  getMisPedidos(): Observable<PedidoResponse[]> {
    return this.http.get<PedidoResponse[]>(`${this.apiUrl}/mis-pedidos`).pipe(
      catchError(this.handleError)
    );
  }

  // --- MÉTODOS DE ADMINISTRADOR (Usan 'adminApiUrl' y el token de admin) ---

  /**
   * (Admin) Obtiene TODOS los pedidos del sistema.
   * Llama a: GET /api/v1/admin/pedidos
   */
  getAllPedidosAdmin(): Observable<PedidoResponse[]> {
    return this.http.get<PedidoResponse[]>(this.adminApiUrl).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * (Admin) Actualiza el estado general de un pedido (Ej: 'ENVIADO', 'CANCELADO').
   * Llama a: PATCH /api/v1/admin/pedidos/{pedidoId}/estado
   */
  updatePedidoStatusAdmin(pedidoId: number, request: AdminUpdatePedidoStatusRequest): Observable<PedidoResponse> {
    return this.http.patch<PedidoResponse>(`${this.adminApiUrl}/${pedidoId}/estado`, request).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * (Admin) Actualiza el estado del PAGO de un pedido (Ej: 'COMPLETADO', 'FALLIDO').
   * Llama a: PATCH /api/v1/admin/pedidos/{pedidoId}/pago
   */
  updatePagoStatusAdmin(pedidoId: number, request: AdminUpdatePagoRequest): Observable<PedidoResponse> {
    return this.http.patch<PedidoResponse>(`${this.adminApiUrl}/${pedidoId}/pago`, request).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * (Admin) Actualiza el estado del ENVÍO de un pedido (Ej: 'EN_CAMINO', 'ENTREGADO').
   * Llama a: PATCH /api/v1/admin/pedidos/{pedidoId}/envio
   */
  updateEnvioStatusAdmin(pedidoId: number, request: AdminUpdateEnvioRequest): Observable<PedidoResponse> {
    return this.http.patch<PedidoResponse>(`${this.adminApiUrl}/${pedidoId}/envio`, request).pipe(
      catchError(this.handleError)
    );
  }


  // --- Manejador de Errores ---
  private handleError(error: any): Observable<never> {
    console.error('Ocurrió un error en PedidoService:', error);
    const errorMsg = error.error?.message || error.message || 'Error desconocido en el servicio de pedidos.';
    return throwError(() => new Error(errorMsg));
  }
}

