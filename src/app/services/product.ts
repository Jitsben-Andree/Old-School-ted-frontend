import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Producto } from '../models/producto';

import { ProductoRequest } from '../models/producto-request';
import { Categoria } from '../models/categoria';
import { AuthService } from './auth'; //

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private http = inject(HttpClient);
  private authService = inject(AuthService); 

  // Ajustamos las URLs base
  private productApiUrl = 'http://localhost:8080/api/v1/productos';
  private categoryApiUrl = 'http://localhost:8080/api/v1/categorias';

  // --- Métodos de Cliente (Públicos) ---
  getAllProductos(): Observable<Producto[]> {
    return this.http.get<Producto[]>(this.productApiUrl).pipe(
      catchError(this.handleError)
    );
  }

  getProductoById(id: number): Observable<Producto> {
    return this.http.get<Producto>(`${this.productApiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  getProductosPorCategoria(nombreCategoria: string): Observable<Producto[]> {
    return this.http.get<Producto[]>(`${this.productApiUrl}/categoria/${nombreCategoria}`).pipe(
      catchError(this.handleError)
    );
  }

  getAllCategorias(): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(this.categoryApiUrl).pipe(
      catchError(this.handleError)
    );
  }

  // --- Métodos de Administrador (Protegidos) ---
  // 4. Helper para crear cabeceras con token
  private getAuthHeaders(): HttpHeaders {
    // ¡No necesitamos obtener el token manualmente!
    // El JwtInterceptor lo hará por nosotros.
    // Solo devolvemos cabeceras vacías o de tipo JSON.
    return new HttpHeaders({
      'Content-Type': 'application/json'
    });
  }

  // 5. Método para obtener TODOS los productos (activos e inactivos)
  // (Nota: Tu API de Spring Boot en GET /productos solo devuelve activos)
  // (Para un admin, idealmente necesitarías un endpoint GET /productos/all)
  // (Por ahora, usaremos el mismo endpoint, pero lo ideal sería modificar tu backend)
  getAllProductosAdmin(): Observable<Producto[]> {
    // Asumiremos por ahora que el admin ve lo mismo que el público
    // TODO: Crear un endpoint en Spring Boot GET /productos/all
    return this.http.get<Producto[]>(this.productApiUrl, { headers: this.getAuthHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  // 6. Método para crear un producto
  createProducto(request: ProductoRequest): Observable<Producto> {
    return this.http.post<Producto>(this.productApiUrl, request, { headers: this.getAuthHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  // 7. Método para actualizar un producto
  updateProducto(id: number, request: ProductoRequest): Observable<Producto> {
    return this.http.put<Producto>(`${this.productApiUrl}/${id}`, request, { headers: this.getAuthHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  // 8. Método para eliminar (desactivar) un producto
  deleteProducto(id: number): Observable<void> {
    return this.http.delete<void>(`${this.productApiUrl}/${id}`, { headers: this.getAuthHeaders() }).pipe(
      catchError(this.handleError)
    );
  }


  // --- Manejo de Errores ---
  private handleError(error: any): Observable<never> {
    console.error('Error en el servicio de productos:', error);
    let errorMessage = 'Error desconocido. Intente de nuevo más tarde.';
    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else if (error.status) {
      // Error del lado del backend
      errorMessage = `Error ${error.status}: ${error.statusText} - ${error.error?.message || 'Error del servidor'}`;
    }
    return throwError(() => new Error(errorMessage));
  }
}
