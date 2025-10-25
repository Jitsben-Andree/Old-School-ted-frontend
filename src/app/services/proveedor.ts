import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Proveedor } from '../models/proveedor';
import { ProveedorRequest } from '../models/proveedor-request';

@Injectable({
  providedIn: 'root'
})
export class ProveedorService {

  private http = inject(HttpClient);
  // URL base de tu API (ajustada a los endpoints de Proveedor)
  private apiUrl = 'http://localhost:8080/api/v1/proveedores';

  // Todos estos endpoints requieren token de Admin (que el interceptor ya añade)

  /**
   * Obtiene todos los proveedores.
   * (Endpoint de Admin: GET /proveedores)
   */
  getAllProveedores(): Observable<Proveedor[]> {
    return this.http.get<Proveedor[]>(this.apiUrl).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Crea un nuevo proveedor.
   * (Endpoint de Admin: POST /proveedores)
   */
  createProveedor(request: ProveedorRequest): Observable<Proveedor> {
    return this.http.post<Proveedor>(this.apiUrl, request).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Actualiza un proveedor existente.
   * (Endpoint de Admin: PUT /proveedores/{id})
   */
  updateProveedor(id: number, request: ProveedorRequest): Observable<Proveedor> {
    return this.http.put<Proveedor>(`${this.apiUrl}/${id}`, request).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Elimina un proveedor.
   * (Endpoint de Admin: DELETE /proveedores/{id})
   */
  deleteProveedor(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  // --- Manejador de Errores ---
  private handleError(error: any): Observable<never> {
    console.error('Ocurrió un error en ProveedorService:', error);
    // Devuelve un error más descriptivo
    const errorMsg = error.error?.message || error.message || 'Error en el servicio de proveedores.';
    return throwError(() => new Error(errorMsg));
  }
}
