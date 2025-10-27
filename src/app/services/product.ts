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
  private API_URL_ADMIN = 'http://localhost:8080/api/v1/admin/productos'; // URL BASE ADMIN
  private API_URL_FILES = 'http://localhost:8080/api/v1/files'; // URL base para archivos
  private API_URL_CATEGORIAS = 'http://localhost:8080/api/v1/categorias'; // URL base pública categorías
  private API_URL_CATEGORIAS_ADMIN = 'http://localhost:8080/api/v1/admin/categorias'; // URL BASE ADMIN CATEGORÍAS

  // --- Métodos Públicos ---
  getAllProductosActivos(): Observable<ProductoResponse[]> { /* ... código existente ... */ 
    return this.http.get<ProductoResponse[]>(this.API_URL_PUBLIC).pipe(
      catchError(this.handleError)
    );
  }
  getProductoById(id: number): Observable<ProductoResponse> { /* ... código existente ... */ 
    return this.http.get<ProductoResponse>(`${this.API_URL_PUBLIC}/${id}`).pipe(
      catchError(this.handleError)
    );
  }
  getProductosByCategoria(nombreCategoria: string): Observable<ProductoResponse[]> { /* ... código existente ... */ 
    const encodedCategory = encodeURIComponent(nombreCategoria);
    return this.http.get<ProductoResponse[]>(`${this.API_URL_PUBLIC}/categoria/${encodedCategory}`).pipe(
      catchError(this.handleError)
    );
  }
  getAllCategorias(): Observable<Categoria[]> { /* ... código existente ... */ 
    return this.http.get<Categoria[]>(this.API_URL_CATEGORIAS).pipe(
      catchError(this.handleError)
    );
  }

  // --- Métodos de Administrador ---
  getAllProductosAdmin(): Observable<ProductoResponse[]> { /* ... código existente ... */ 
    return this.http.get<ProductoResponse[]>(`${this.API_URL_ADMIN}/all`, { headers: this.createAuthHeaders() }).pipe(
      catchError(this.handleAdminError) // Usar manejo de error específico si es necesario
    );
  }
  createProducto(request: ProductoRequest): Observable<ProductoResponse> { /* ... código existente ... */ 
    return this.http.post<ProductoResponse>(this.API_URL_ADMIN, request, { headers: this.createAuthHeaders() }).pipe(
      catchError(this.handleAdminError)
    );
  }
  updateProducto(id: number, request: ProductoRequest): Observable<ProductoResponse> { /* ... código existente ... */ 
    return this.http.put<ProductoResponse>(`${this.API_URL_ADMIN}/${id}`, request, { headers: this.createAuthHeaders() }).pipe(
      catchError(this.handleAdminError)
    );
  }
  deleteProducto(id: number): Observable<void> { /* ... código existente ... */ 
    return this.http.delete<void>(`${this.API_URL_ADMIN}/${id}`, { headers: this.createAuthHeaders() }).pipe(
      catchError(this.handleAdminError)
    );
  }
  uploadProductImage(productId: number, file: File): Observable<ImageUploadResponse> { /* ... código existente ... */ 
    const formData = new FormData();
    formData.append('file', file, file.name);
    return this.http.post<ImageUploadResponse>(`${this.API_URL_FILES}/upload/producto/${productId}`, formData, {
      headers: this.createAuthHeaders(true) 
    }).pipe(
      catchError(this.handleAdminError)
    );
  }
  createCategoria(request: { nombre: string, descripcion?: string }): Observable<Categoria> { /* ... código existente ... */ 
    return this.http.post<Categoria>(this.API_URL_CATEGORIAS_ADMIN, request, { headers: this.createAuthHeaders() }).pipe(
      catchError(this.handleAdminError)
    );
  }
  updateCategoria(id: number, request: { nombre: string, descripcion?: string }): Observable<Categoria> { /* ... código existente ... */ 
    return this.http.put<Categoria>(`${this.API_URL_CATEGORIAS_ADMIN}/${id}`, request, { headers: this.createAuthHeaders() }).pipe(
      catchError(this.handleAdminError)
    );
  }
  deleteCategoria(id: number): Observable<void> { /* ... código existente ... */ 
    return this.http.delete<void>(`${this.API_URL_CATEGORIAS_ADMIN}/${id}`, { headers: this.createAuthHeaders() }).pipe(
      catchError(this.handleAdminError)
    );
  }
  associatePromocionToProducto(productoId: number, promocionId: number): Observable<void> { /* ... código existente ... */ 
    const url = `${this.API_URL_ADMIN}/${productoId}/promociones/${promocionId}`; 
    return this.http.post<void>(url, null, { headers: this.createAuthHeaders() }).pipe(
      catchError(this.handleAdminError)
    );
  }
  disassociatePromocionFromProducto(productoId: number, promocionId: number): Observable<void> { /* ... código existente ... */ 
    const url = `${this.API_URL_ADMIN}/${productoId}/promociones/${promocionId}`; 
    return this.http.delete<void>(url, { headers: this.createAuthHeaders() }).pipe(
      catchError(this.handleAdminError)
    );
  }

  // --- NUEVO MÉTODO PARA EXPORTAR ---
  /**
   * [Admin] Llama al backend para generar y obtener el archivo Excel de productos como Blob.
   */
  exportProductosToExcel(): Observable<Blob> { // <<< Devuelve Observable<Blob>
    const url = `${this.API_URL_ADMIN}/exportar-excel`;
    return this.http.get(url, {
      headers: this.createAuthHeaders(),
      responseType: 'blob' // <<< ESPECIFICAR responseType COMO 'blob' ES CRUCIAL
    }).pipe(
      catchError(this.handleAdminError) // Reutilizar manejo de error de admin
    );
  }
  // --- FIN NUEVO MÉTODO ---


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
    // Extraer mensaje de error del cuerpo si es posible
    const errorBody = error.error;
    let message = 'Ocurrió un error en la operación de administrador.'; // Default

    // Intentar obtener un mensaje más específico
    if (errorBody instanceof Blob && errorBody.type === "application/json") {
       // Si el error es un Blob JSON (puede pasar con responseType:'blob')
       // Necesitaríamos leer el blob para obtener el mensaje, lo cual es asíncrono y complejo aquí.
       // Mejor devolver un mensaje genérico o basado en el status.
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
     // Añadir otros códigos si es necesario
    return throwError(() => new Error(message));
  }

}

