import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule, CurrencyPipe, DecimalPipe } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { CartService } from '../../services/cart';
import { AuthService } from '../../services/auth';
import { take } from 'rxjs/operators';
import { DetalleCarrito } from '../../models/carrito'; // Importar DetalleCarrito
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink, CurrencyPipe],
  templateUrl: './cart.html',
  styleUrls: ['./cart.css']
})
export class CartComponent implements OnInit {

  // Inyectar servicios
  public cartService = inject(CartService);
  public authService = inject(AuthService);
  private router = inject(Router);

  public isLoading = signal(true);
  public error = signal<string | null>(null);
  // Señal para manejar el estado de carga de la actualización de cantidad
  public updatingQuantity = signal<number | null>(null); // Guarda el ID del item que se está actualizando

  ngOnInit(): void {
    if (!this.cartService.cart() && this.authService.isLoggedIn()) {
      this.loadCart();
    } else {
      this.isLoading.set(false);
      if (this.cartService.cart()?.items.length === 0) {
        console.log('El carrito está cargado pero vacío.');
      }
    }
  }

  loadCart() {
    this.isLoading.set(true);
    this.error.set(null);
    this.cartService.getMiCarrito().pipe(take(1)).subscribe({
      next: (cartData) => {
        this.isLoading.set(false);
        if (cartData?.items.length === 0) {
           console.log('Carrito cargado, pero está vacío.');
        }
      },
      error: (err: Error) => { // Capturar Error genérico
        this.error.set('Error al cargar el carrito: ' + err.message);
        this.isLoading.set(false);
        console.error('Error en getMiCarrito:', err);
      }
    });
  }

  onRemoveItem(detalleId: number, productName: string) {
    if (!confirm(`¿Estás seguro de que quieres eliminar "${productName}" de tu carrito?`)) {
      return;
    }
    this.error.set(null);
    // Indicar visualmente que se está eliminando (opcional)
    // Podrías añadir una clase CSS o cambiar el estado
    this.cartService.removeItem(detalleId).pipe(take(1)).subscribe({
      next: () => {
        console.log(`Ítem ${detalleId} eliminado.`);
      },
      error: (err: Error) => {
        this.error.set('Error al eliminar el producto: ' + err.message);
        console.error('Error en removeItem:', err);
        alert('Error al eliminar el producto: ' + err.message);
      }
    });
  }

  // --- NUEVOS MÉTODOS PARA CANTIDAD ---

  /** Aumenta la cantidad de un ítem en 1 */
  increaseQuantity(item: DetalleCarrito): void {
      this.updateQuantity(item, item.cantidad + 1);
  }

  /** Disminuye la cantidad de un ítem en 1 (mínimo 1) */
  decreaseQuantity(item: DetalleCarrito): void {
      if (item.cantidad > 1) {
          this.updateQuantity(item, item.cantidad - 1);
      } else {
          // Si la cantidad es 1, preguntar si quiere eliminarlo
          this.onRemoveItem(item.detalleCarritoId, item.productoNombre);
      }
  }

  /** Llama al servicio para actualizar la cantidad */
  private updateQuantity(item: DetalleCarrito, nuevaCantidad: number): void {
      this.error.set(null); // Limpiar error
      this.updatingQuantity.set(item.detalleCarritoId); // Marcar este item como "actualizando"

      this.cartService.updateItemQuantity(item.detalleCarritoId, nuevaCantidad)
          .pipe(take(1))
          .subscribe({
              next: () => {
                  console.log(`Cantidad actualizada para item ${item.detalleCarritoId} a ${nuevaCantidad}`);
                  this.updatingQuantity.set(null); // Quitar marca de "actualizando"
              },
              error: (err: Error) => {
                  this.error.set(`Error al actualizar cantidad: ${err.message}`);
                  console.error(`Error en updateQuantity para item ${item.detalleCarritoId}:`, err);
                  alert(`Error al actualizar cantidad: ${err.message}`);
                  this.updatingQuantity.set(null); // Quitar marca de "actualizando" incluso si hay error
                  // Opcional: recargar el carrito si la actualización falla para revertir visualmente
                  // this.loadCart();
              }
          });
  }
  // --- FIN NUEVOS MÉTODOS ---


  onCheckout() {
    if (this.cartService.cart() && this.cartService.cart()!.items.length > 0) {
      this.router.navigate(['/checkout']);
    } else {
      this.error.set('No puedes proceder al pago con un carrito vacío.');
      alert('Tu carrito está vacío.');
    }
  }

   /**
   * Función TrackBy para optimizar el *ngFor/@for
   */
   trackById(index: number, item: DetalleCarrito): number {
    return item.detalleCarritoId;
  }
}

