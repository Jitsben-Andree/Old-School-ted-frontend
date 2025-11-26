import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ProductoResponse } from '../models/producto';
import { Categoria } from '../models/categoria';
import { ProductoRequest } from '../models/producto-request';
import { AuthService } from './auth';

// Interfaz simple para la respuesta de subida de imagen (opcional, ya que ahora devolvemos ProductoResponse)
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

  // URLs configuradas según tu Backend
  private API_URL_PUBLIC = 'http://localhost:8080/api/v1/productos';
  private API_URL_ADMIN = 'http://localhost:8080/api/v1/admin/productos';
  // private API_URL_FILES = 'http://localhost:8080/api/v1/files'; // Ya no se usa directamente para subir
  private API_URL_CATEGORIAS = 'http://localhost:8080/api/v1/categorias';
  private API_URL_CATEGORIAS_ADMIN = 'http://localhost:8080/api/v1/admin/categorias';

  // --- MÉTODOS PÚBLICOS ---

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
    return this.http.get<Categoria[]>(this.API_URL_CATEGORIAS).pipe(
      catchError(this.handleError)
    );
  }

  // --- MÉTODOS DE ADMINISTRADOR (PRODUCTOS) ---

  getAllProductosAdmin(): Observable<ProductoResponse[]> {
    return this.http.get<ProductoResponse[]>(`${this.API_URL_ADMIN}/all`, { headers: this.createAuthHeaders() }).pipe(
      catchError(this.handleAdminError)
    );
  }

  createProducto(request: ProductoRequest): Observable<ProductoResponse> {
    return this.http.post<ProductoResponse>(this.API_URL_ADMIN, request, { headers: this.createAuthHeaders() }).pipe(
      catchError(this.handleAdminError)
    );
  }

  updateProducto(id: number, request: ProductoRequest): Observable<ProductoResponse> {
    return this.http.put<ProductoResponse>(`${this.API_URL_ADMIN}/${id}`, request, { headers: this.createAuthHeaders() }).pipe(
      catchError(this.handleAdminError)
    );
  }

  deleteProducto(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL_ADMIN}/${id}`, { headers: this.createAuthHeaders() }).pipe(
      catchError(this.handleAdminError)
    );
  }

  // --- GESTIÓN DE IMÁGENES ---

  /**
   * 1. Subir Portada
   * Endpoint: POST /admin/productos/{id}/imagen
   */
  uploadProductImage(productId: number, file: File): Observable<ProductoResponse> {
    const formData = new FormData();
    formData.append('file', file, file.name);
    
    return this.http.post<ProductoResponse>(`${this.API_URL_ADMIN}/${productId}/imagen`, formData, {
      headers: this.createAuthHeaders(true) 
    }).pipe(
      catchError(this.handleAdminError)
    );
  }

  /**
   * 2. Subir Imagen a Galería
   * Endpoint: POST /admin/productos/{id}/galeria
   */
  uploadGalleryImage(productId: number, file: File): Observable<ProductoResponse> {
    const formData = new FormData();
    formData.append('file', file, file.name);
    
    return this.http.post<ProductoResponse>(`${this.API_URL_ADMIN}/${productId}/galeria`, formData, {
      headers: this.createAuthHeaders(true)
    }).pipe(
      catchError(this.handleAdminError)
    );
  }

  /**
   * 3. Borrar Imagen de Galería
   * Endpoint: DELETE /admin/productos/{id}/galeria/{imageId}
   */
  deleteGalleryImage(productId: number, imageId: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL_ADMIN}/${productId}/galeria/${imageId}`, {
      headers: this.createAuthHeaders()
    }).pipe(
      catchError(this.handleAdminError)
    );
  }

  // --- GESTIÓN DE CATEGORÍAS ---

  createCategoria(request: { nombre: string, descripcion?: string }): Observable<Categoria> {
    return this.http.post<Categoria>(this.API_URL_CATEGORIAS_ADMIN, request, { headers: this.createAuthHeaders() }).pipe(
      catchError(this.handleAdminError)
    );
  }

  updateCategoria(id: number, request: { nombre: string, descripcion?: string }): Observable<Categoria> {
    return this.http.put<Categoria>(`${this.API_URL_CATEGORIAS_ADMIN}/${id}`, request, { headers: this.createAuthHeaders() }).pipe(
      catchError(this.handleAdminError)
    );
  }

  deleteCategoria(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL_CATEGORIAS_ADMIN}/${id}`, { headers: this.createAuthHeaders() }).pipe(
      catchError(this.handleAdminError)
    );
  }

  // --- PROMOCIONES ---

  associatePromocionToProducto(productoId: number, promocionId: number): Observable<void> {
    const url = `${this.API_URL_ADMIN}/${productoId}/promociones/${promocionId}`; 
    return this.http.post<void>(url, null, { headers: this.createAuthHeaders() }).pipe(
      catchError(this.handleAdminError)
    );
  }

  disassociatePromocionFromProducto(productoId: number, promocionId: number): Observable<void> {
    const url = `${this.API_URL_ADMIN}/${productoId}/promociones/${promocionId}`; 
    return this.http.delete<void>(url, { headers: this.createAuthHeaders() }).pipe(
      catchError(this.handleAdminError)
    );
  }

  // --- EXPORTAR EXCEL ---
  
  exportProductosToExcel(): Observable<Blob> {
    const url = `${this.API_URL_ADMIN}/exportar-excel`;
    return this.http.get(url, {
      headers: this.createAuthHeaders(),
      responseType: 'blob' 
    }).pipe(
      catchError(this.handleAdminError)
    );
  }

  // --- HELPER Y MANEJADORES DE ERRORES ---

  private createAuthHeaders(isFormData: boolean = false): HttpHeaders {
    const token = this.authService.jwtToken();
    if (!token) {
        console.error("Token no encontrado para crear cabeceras");
        return new HttpHeaders();
    }
    // Angular maneja automáticamente el Content-Type para FormData (boundary),
    // así que no debemos establecerlo manualmente si isFormData es true.
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error("ProductService Error (Público):", error.message);
    let userMessage = 'Ocurrió un error al procesar la solicitud.';
    if (error.status === 404) userMessage = 'El recurso solicitado no fue encontrado.';
    else if (error.status === 0) userMessage = 'No se pudo conectar con el servidor. Verifica tu conexión.';
    return throwError(() => new Error(userMessage));
  }

  private handleAdminError(error: HttpErrorResponse): Observable<never> {
    console.error("ProductService Error (Admin):", error);
    const errorBody = error.error;
    let message = 'Ocurrió un error en la operación de administrador.';

    if (errorBody instanceof Blob && errorBody.type === "application/json") {
       // Si recibimos un blob de error, es difícil parsearlo síncronamente aquí, 
       // devolvemos un mensaje genérico con el status.
       message = `Error ${error.status}: ${error.statusText}`;
    } else if (typeof errorBody === 'string') {
       message = errorBody;
    } else if (errorBody && errorBody.message) {
       message = errorBody.message;
    } else if (error.message) {
         message = error.message;
    }

     if (error.status === 403) message = 'No tienes permiso para realizar esta acción.';
     else if (error.status === 401) message = 'Tu sesión ha expirado. Por favor, inicia sesión de nuevo.';
    
    return throwError(() => new Error(message));
  }
}