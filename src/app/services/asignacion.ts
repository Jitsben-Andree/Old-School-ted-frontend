import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Asignacion } from '../models/asignacion';
import { AsignacionRequest } from '../models/asignacion-request';
import { UpdatePrecioRequest } from '../models/update-precio-request';

@Injectable({
  providedIn: 'root'
})
export class AsignacionService {

  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/v1/asignaciones';
  
  // Todos estos endpoints requieren token de Admin (que el interceptor ya añade)

  /**
   * Obtiene todas las asignaciones para un producto específico.
   * (Endpoint de Admin: GET /asignaciones/producto/{productoId})
   */
  getAsignacionesPorProducto(productoId: number): Observable<Asignacion[]> {
    return this.http.get<Asignacion[]>(`${this.apiUrl}/producto/${productoId}`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Crea una nueva asignación de producto a proveedor.
   * (Endpoint de Admin: POST /asignaciones)
   */
  createAsignacion(request: AsignacionRequest): Observable<Asignacion> {
    return this.http.post<Asignacion>(this.apiUrl, request).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Actualiza el precio de costo de una asignación existente.
   * (Endpoint de Admin: PUT /asignaciones/{asignacionId}/precio)
   */
  updatePrecioCosto(asignacionId: number, request: UpdatePrecioRequest): Observable<Asignacion> {
    return this.http.put<Asignacion>(`${this.apiUrl}/${asignacionId}/precio`, request).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Elimina una asignación.
   * (Endpoint de Admin: DELETE /asignaciones/{asignacionId})
   */
  deleteAsignacion(asignacionId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${asignacionId}`).pipe(
      catchError(this.handleError)
    );
  }

  // --- Manejador de Errores ---
  private handleError(error: any): Observable<never> {
    console.error('Ocurrió un error en AsignacionService:', error);
    const errorMsg = error.error?.message || error.message || 'Error en el servicio de asignaciones.';
    return throwError(() => new Error(errorMsg));
  }
}
