import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Promocion } from '../models/promocion';
import { PromocionRequest } from '../models/promocion-request';

@Injectable({
  providedIn: 'root'
})
export class PromocionService {

  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/v1/promociones';

  // --- MÉTODOS PÚBLICOS (GET) ---

  /**
   * Obtiene todas las promociones.
   * (Endpoint público: GET /promociones)
   */
  getAllPromociones(): Observable<Promocion[]> {
    return this.http.get<Promocion[]>(this.apiUrl).pipe(
      catchError(this.handleError)
    );
  }

  // --- MÉTODOS DE ADMIN (Protegidos por Interceptor) ---

  /**
   * Crea una nueva promoción.
   * (Endpoint de Admin: POST /promociones)
   */
  createPromocion(request: PromocionRequest): Observable<Promocion> {
    return this.http.post<Promocion>(this.apiUrl, request).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Actualiza una promoción existente.
   * (Endpoint de Admin: PUT /promociones/{id})
   */
  updatePromocion(id: number, request: PromocionRequest): Observable<Promocion> {
    return this.http.put<Promocion>(`${this.apiUrl}/${id}`, request).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Desactiva (borrado lógico) una promoción.
   * (Endpoint de Admin: DELETE /promociones/{id})
   */
  desactivarPromocion(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  // --- Manejador de Errores ---
  private handleError(error: any): Observable<never> {
    console.error('Ocurrió un error en PromocionService:', error);
    const errorMsg = error.error?.message || error.message || 'Error en el servicio de promociones.';
    return throwError(() => new Error(errorMsg));
  }
}
