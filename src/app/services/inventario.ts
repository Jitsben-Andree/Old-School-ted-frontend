import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Inventario } from '../models/inventario';
import { InventarioUpdateRequest } from '../models/inventario-update-request';
// El AuthService no es necesario aquí, el interceptor se encarga del token
// import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class InventarioService {
  private http = inject(HttpClient);
  // El AuthService no es necesario inyectarlo aquí
  // private authService = inject(AuthService); 
  private apiUrl = 'http://localhost:8080/api/v1/inventario';

  // No es necesario crear cabeceras manualmente, 
  // nuestro JwtInterceptor se encarga de eso.

  /**
   * [Admin] Obtiene el estado del inventario de todos los productos.
   */
  getTodoElInventario(): Observable<Inventario[]> {
    // El interceptor añadirá el token automáticamente
    return this.http.get<Inventario[]>(`${this.apiUrl}/all`);
  }

  /**
   * [Admin] Obtiene el inventario de un producto específico.
   * (No lo usamos en la tabla, pero es bueno tenerlo)
   */
  getInventarioPorProductoId(productoId: number): Observable<Inventario> {
    return this.http.get<Inventario>(`${this.apiUrl}/producto/${productoId}`);
  }

  /**
   * [Admin] Actualiza el stock de un producto específico.
   */
  actualizarStock(request: InventarioUpdateRequest): Observable<Inventario> {
    // El interceptor también protege las peticiones PUT
    return this.http.put<Inventario>(`${this.apiUrl}/stock`, request);
  }
}

