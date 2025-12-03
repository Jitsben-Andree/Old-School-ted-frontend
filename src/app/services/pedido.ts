import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { PedidoRequest } from '../models/pedido-request';
import { PedidoResponse, DetallePedido } from '../models/pedido';
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
  // AdminPedidoController.java
  private adminApiUrl = 'http://localhost:8080/api/v1/admin/pedidos';

  //  MÉTODOS DE CLIENTE (Usan 'apiUrl' y el token de cliente) 

  crearPedidoDesdeCarrito(request: PedidoRequest): Observable<PedidoResponse> {
    return this.http.post<PedidoResponse>(`${this.apiUrl}/crear`, request).pipe(
      catchError(this.handleError)
    );
  }

 
  getMisPedidos(): Observable<PedidoResponse[]> {
    return this.http.get<PedidoResponse[]>(`${this.apiUrl}/mis-pedidos`).pipe(
      catchError(this.handleError)
    );
  }

  //  MÉTODOS DE ADMINISTRADOR (Usan 'adminApiUrl' y el token de admin) 

 
  getAllPedidosAdmin(): Observable<PedidoResponse[]> {
    return this.http.get<PedidoResponse[]>(this.adminApiUrl).pipe(
      catchError(this.handleError)
    );
  }

 
  updatePedidoStatusAdmin(pedidoId: number, request: AdminUpdatePedidoStatusRequest): Observable<PedidoResponse> {
    return this.http.patch<PedidoResponse>(`${this.adminApiUrl}/${pedidoId}/estado`, request).pipe(
      catchError(this.handleError)
    );
  }

 
  updatePagoStatusAdmin(pedidoId: number, request: AdminUpdatePagoRequest): Observable<PedidoResponse> {
    return this.http.patch<PedidoResponse>(`${this.adminApiUrl}/${pedidoId}/pago`, request).pipe(
      catchError(this.handleError)
    );
  }

  
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

