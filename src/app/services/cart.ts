import { inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Carrito, DetalleCarrito } from '../models/carrito'; // Asegúrate de importar DetalleCarrito
import { AddItemRequest } from '../models/add-item-request';
import { UpdateCantidadRequest } from '../models/update-cantidad-request'; // << Importar nuevo modelo
import { AuthService } from './auth';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private API_URL = 'http://localhost:8080/api/v1/carrito';

  // Carrito local (Signal)
  public cart = signal<Carrito | null>(null);

  private createAuthHeaders(): HttpHeaders {
    const token = this.authService.jwtToken();
    if (!token) {
      console.error("Token no encontrado para CartService");
      // Lanzar un error o devolver cabecera vacía podría ser mejor
      // dependiendo de si quieres manejar esto globalmente (interceptores)
      return new HttpHeaders();
      // throw new Error('Token de autenticación no encontrado.');
    }
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  getMiCarrito(): Observable<Carrito> {
    console.log("CartService: Llamando a getMiCarrito..."); // Log
    return this.http.get<Carrito>(`${this.API_URL}/mi-carrito`, {
      headers: this.createAuthHeaders()
    }).pipe(
      tap(carrito => {
        console.log("CartService: Carrito recibido:", carrito); // Log
        this.cart.set(carrito);
      }),
      catchError(this.handleError)
    );
  }

  addItem(productoId: number, cantidad: number): Observable<Carrito> {
    console.log(`CartService: Llamando a addItem (ProdID: ${productoId}, Cant: ${cantidad})...`); // Log
    const request: AddItemRequest = { productoId, cantidad };
    return this.http.post<Carrito>(`${this.API_URL}/agregar`, request, {
      headers: this.createAuthHeaders()
    }).pipe(
      tap(carrito => {
        console.log("CartService: Carrito actualizado después de addItem:", carrito); // Log
        this.cart.set(carrito);
      }),
      catchError(this.handleError)
    );
  }

  removeItem(detalleCarritoId: number): Observable<Carrito> {
    console.log(`CartService: Llamando a removeItem (DetalleID: ${detalleCarritoId})...`); // Log
    return this.http.delete<Carrito>(`${this.API_URL}/eliminar/${detalleCarritoId}`, {
      headers: this.createAuthHeaders()
    }).pipe(
      tap(carrito => {
        console.log("CartService: Carrito actualizado después de removeItem:", carrito); // Log
        this.cart.set(carrito);
      }),
      catchError(this.handleError)
    );
  }

  // --- NUEVO MÉTODO ---
  /**
   * Actualiza la cantidad de un ítem específico en el carrito.
   * @param detalleCarritoId El ID del DetalleCarrito a actualizar.
   * @param nuevaCantidad La nueva cantidad deseada (debe ser >= 1).
   */
  updateItemQuantity(detalleCarritoId: number, nuevaCantidad: number): Observable<Carrito> {
    console.log(`CartService: Llamando a updateItemQuantity (DetalleID: ${detalleCarritoId}, NuevaCant: ${nuevaCantidad})...`); // Log
    // Validar cantidad mínima aquí también por seguridad
    if (nuevaCantidad < 1) {
        console.error("CartService: Intento de actualizar a cantidad inválida:", nuevaCantidad);
        return throwError(() => new Error("La cantidad no puede ser menor que 1."));
    }
    const request: UpdateCantidadRequest = { nuevaCantidad };
    // Usar PUT y la URL correcta
    return this.http.put<Carrito>(`${this.API_URL}/actualizar-cantidad/${detalleCarritoId}`, request, {
      headers: this.createAuthHeaders()
    }).pipe(
      tap(carrito => {
        console.log("CartService: Carrito actualizado después de updateItemQuantity:", carrito); // Log
        this.cart.set(carrito); // Actualizar el signal local
      }),
      catchError(this.handleError)
    );
  }
  // --- FIN NUEVO MÉTODO ---


  /** Limpia el signal del carrito localmente (ej. después de logout o pedido exitoso) */
  clearCartOnLogout(): void {
    console.log("CartService: Limpiando carrito localmente."); // Log
    this.cart.set(null);
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error("CartService Error:", error.message, error.status, error.error); // Loguear más detalles
    let userMessage = 'Ocurrió un error al procesar el carrito.';
    if (error.status === 401 || error.status === 403) {
      userMessage = 'No autorizado. Por favor, inicie sesión de nuevo.';
      // Opcional: Podrías llamar a authService.logout() aquí si es 401
    } else if (error.status === 404) {
      userMessage = 'El ítem o recurso no fue encontrado.';
    } else if (error.status === 400) {
       // Intentar obtener el mensaje específico del backend
       userMessage = error.error?.message || error.message || 'Error en la solicitud (ej. stock insuficiente, cantidad inválida).';
    } else if (error.status === 0) {
        userMessage = 'No se pudo conectar con el servidor.';
    }
    // Devolver un error que Angular pueda entender
    return throwError(() => new Error(userMessage));
  }
}

