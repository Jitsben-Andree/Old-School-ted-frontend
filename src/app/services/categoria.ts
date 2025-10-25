import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Categoria } from '../models/categoria';
import { CategoriaRequest } from '../models/categoria-request';

@Injectable({
  providedIn: 'root'
})
export class CategoriaService {

  private http = inject(HttpClient);
  // URL base de tu API (ajustada a los endpoints de Categoria)
  private apiUrl = 'http://localhost:8080/api/v1/categorias'; 

  // --- MÉTODOS PÚBLICOS (GET) ---

  /**
   * Obtiene todas las categorías.
   * (Endpoint público: GET /categorias)
   */
  getAllCategorias(): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(this.apiUrl).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Obtiene una categoría por su ID.
   * (Endpoint público: GET /categorias/{id})
   */
  getCategoriaById(id: number): Observable<Categoria> {
    return this.http.get<Categoria>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  // --- MÉTODOS DE ADMIN (Protegidos por Interceptor) ---

  /**
   * Crea una nueva categoría.
   * (Endpoint de Admin: POST /categorias)
   */
  createCategoria(request: CategoriaRequest): Observable<Categoria> {
    // El interceptor de JWT añade el token de admin automáticamente
    return this.http.post<Categoria>(this.apiUrl, request).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Actualiza una categoría existente.
   * (Endpoint de Admin: PUT /categorias/{id})
   */
  updateCategoria(id: number, request: CategoriaRequest): Observable<Categoria> {
    return this.http.put<Categoria>(`${this.apiUrl}/${id}`, request).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Elimina una categoría.
   * (Endpoint de Admin: DELETE /categorias/{id})
   */
  deleteCategoria(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  // --- Manejador de Errores ---
  private handleError(error: any): Observable<never> {
    console.error('Ocurrió un error en CategoriaService:', error);
    return throwError(() => new Error('Error en el servicio de categorías. ' + (error.message || '')));
  }
}

