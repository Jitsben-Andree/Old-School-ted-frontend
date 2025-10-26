import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { ProductoResponse } from '../models/producto';
import { Categoria } from '../models/categoria';
import { ProductoRequest } from '../models/producto-request';
import { AuthService } from './auth';

// Interfaz simple para la respuesta de subida de imagen
interface ImageUploadResponse {
  message: string;
  imageUrl: string;
}


@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private API_URL_PUBLIC = 'http://localhost:8080/api/v1/productos'; // URL base pública
  private API_URL_ADMIN = 'http://localhost:8080/api/v1/admin/productos'; // <<< URL BASE ADMIN
  private API_URL_FILES = 'http://localhost:8080/api/v1/files'; // URL base para archivos
  private API_URL_CATEGORIAS = 'http://localhost:8080/api/v1/categorias'; // URL base pública categorías
  private API_URL_CATEGORIAS_ADMIN = 'http://localhost:8080/api/v1/admin/categorias'; // <<< URL BASE ADMIN CATEGORÍAS (Asumiendo que también se mueven)

  // --- Métodos Públicos ---

  getAllProductosActivos(): Observable<ProductoResponse[]> {
    return this.http.get<ProductoResponse[]>(this.API_URL_PUBLIC).pipe(
      catchError(this.handleError)
    );
  }

  getProductoById(id: number): Observable<ProductoResponse> {
    return this.http.get<ProductoResponse>(`${this.API_URL_PUBLIC}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  getProductosByCategoria(nombreCategoria: string): Observable<ProductoResponse[]> {
    const encodedCategory = encodeURIComponent(nombreCategoria);
    return this.http.get<ProductoResponse[]>(`${this.API_URL_PUBLIC}/categoria/${encodedCategory}`).pipe(
      catchError(this.handleError)
    );
  }

  getAllCategorias(): Observable<Categoria[]> {
    // Usar URL pública de categorías
    return this.http.get<Categoria[]>(this.API_URL_CATEGORIAS).pipe(
      catchError(this.handleError)
    );
  }

  // --- Métodos de Administrador ---

   getAllProductosAdmin(): Observable<ProductoResponse[]> {
    // Usar URL admin
    return this.http.get<ProductoResponse[]>(`${this.API_URL_ADMIN}/all`, { headers: this.createAuthHeaders() }).pipe(
      catchError(this.handleAdminError)
    );
  }

  createProducto(request: ProductoRequest): Observable<ProductoResponse> {
     // Usar URL admin
    return this.http.post<ProductoResponse>(this.API_URL_ADMIN, request, { headers: this.createAuthHeaders() }).pipe(
      catchError(this.handleAdminError)
    );
  }

  updateProducto(id: number, request: ProductoRequest): Observable<ProductoResponse> {
     // Usar URL admin
    return this.http.put<ProductoResponse>(`${this.API_URL_ADMIN}/${id}`, request, { headers: this.createAuthHeaders() }).pipe(
      catchError(this.handleAdminError)
    );
  }

  deleteProducto(id: number): Observable<void> {
     // Usar URL admin
    return this.http.delete<void>(`${this.API_URL_ADMIN}/${id}`, { headers: this.createAuthHeaders() }).pipe(
      catchError(this.handleAdminError)
    );
  }

  uploadProductImage(productId: number, file: File): Observable<ImageUploadResponse> {
    const formData = new FormData();
    formData.append('file', file, file.name);
    // La URL de subida de archivos se mantiene separada, ya la corregimos antes
    return this.http.post<ImageUploadResponse>(`${this.API_URL_FILES}/upload/producto/${productId}`, formData, {
      headers: this.createAuthHeaders(true)
    }).pipe(
      catchError(this.handleAdminError)
    );
  }

  // --- Métodos de Admin para Categorías ---
   createCategoria(request: { nombre: string, descripcion?: string }): Observable<Categoria> {
    // Asumiendo que CategoriaController también se movió a /admin
    return this.http.post<Categoria>(this.API_URL_CATEGORIAS_ADMIN, request, { headers: this.createAuthHeaders() }).pipe(
      catchError(this.handleAdminError)
    );
  }

  updateCategoria(id: number, request: { nombre: string, descripcion?: string }): Observable<Categoria> {
    // Asumiendo que CategoriaController también se movió a /admin
    return this.http.put<Categoria>(`${this.API_URL_CATEGORIAS_ADMIN}/${id}`, request, { headers: this.createAuthHeaders() }).pipe(
      catchError(this.handleAdminError)
    );
  }

  deleteCategoria(id: number): Observable<void> {
    // Asumiendo que CategoriaController también se movió a /admin
    return this.http.delete<void>(`${this.API_URL_CATEGORIAS_ADMIN}/${id}`, { headers: this.createAuthHeaders() }).pipe(
      catchError(this.handleAdminError)
    );
  }

  // --- Métodos para Asociar/Desasociar Promociones ---

  associatePromocionToProducto(productoId: number, promocionId: number): Observable<void> {
    // Usar la NUEVA URL bajo /admin/productos
    const url = `${this.API_URL_ADMIN}/${productoId}/promociones/${promocionId}`; // <<< CORREGIDO
    return this.http.post<void>(url, null, { headers: this.createAuthHeaders() }).pipe(
      catchError(this.handleAdminError)
    );
  }

  disassociatePromocionFromProducto(productoId: number, promocionId: number): Observable<void> {
     // Usar la NUEVA URL bajo /admin/productos
    const url = `${this.API_URL_ADMIN}/${productoId}/promociones/${promocionId}`; // <<< CORREGIDO
    return this.http.delete<void>(url, { headers: this.createAuthHeaders() }).pipe(
      catchError(this.handleAdminError)
    );
  }


  // --- Helper y Manejadores de Errores (sin cambios) ---
  private createAuthHeaders(isFormData: boolean = false): HttpHeaders { /* ... código existente ... */
     const token = this.authService.jwtToken();
     if (!token) {
         console.error("Token no encontrado para crear cabeceras");
         return new HttpHeaders();
     }
     return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }
  private handleError(error: HttpErrorResponse): Observable<never> { /* ... código existente ... */
    console.error("ProductService Error (Público):", error.message);
    let userMessage = 'Ocurrió un error al procesar la solicitud.';
    if (error.status === 404) userMessage = 'El recurso solicitado no fue encontrado.';
    else if (error.status === 0) userMessage = 'No se pudo conectar con el servidor. Verifica tu conexión.';
    return throwError(() => new Error(userMessage));
  }
  private handleAdminError(error: HttpErrorResponse): Observable<never> { /* ... código existente ... */
    console.error("ProductService Error (Admin):", error);
    const message = error.error?.message || error.message || 'Ocurrió un error en la operación de administrador.';
     if (error.status === 403) return throwError(() => new Error('No tienes permiso para realizar esta acción.'));
      if (error.status === 401) return throwError(() => new Error('Tu sesión ha expirado. Por favor, inicia sesión de nuevo.'));
    return throwError(() => new Error(message));
  }
}

