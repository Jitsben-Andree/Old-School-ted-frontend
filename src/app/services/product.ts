import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, catchError } from 'rxjs';
import { Producto } from '../models/producto';
// (Opcional) Puedes crear un modelo para CategoriaResponse si lo deseas
// import { Categoria } from '../models/categoria.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  // URL base de la API (sin /auth)
  private readonly API_URL = 'http://localhost:8080/api/v1';

  private http = inject(HttpClient);

  constructor() { }

  /**
   * Obtiene todos los productos activos
   * Llama a: GET /productos
   */
  getAllProductos(): Observable<Producto[]> {
    return this.http.get<Producto[]>(`${this.API_URL}/productos`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Obtiene un producto por su ID
   * Llama a: GET /productos/{id}
   */
  getProductoById(id: number): Observable<Producto> {
    return this.http.get<Producto>(`${this.API_URL}/productos/${id}`).pipe(
      catchError(this.handleError)
    );
  }
  
  /**
   * Obtiene productos por nombre de categoría
   * Llama a: GET /productos/categoria/{nombreCategoria}
   */
  getProductosByCategoria(nombreCategoria: string): Observable<Producto[]> {
    return this.http.get<Producto[]>(`${this.API_URL}/productos/categoria/${nombreCategoria}`).pipe(
      catchError(this.handleError)
    );
  }
  
  // (Opcional) Podrías añadir métodos para categorías si los necesitas
  // getAllCategorias(): Observable<Categoria[]> {
  //   return this.http.get<Categoria[]>(`${this.API_URL}/categorias`).pipe(
  //     catchError(this.handleError)
  //   );
  // }
  
  private handleError(error: HttpErrorResponse) {
    console.error("ProductService Error:", error.message);
    return throwError(() => new Error('Error al cargar los productos.'));
  }
}