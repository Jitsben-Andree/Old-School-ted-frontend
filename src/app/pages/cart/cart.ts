import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule, CurrencyPipe, DecimalPipe } from '@angular/common'; // Importar Pipes
import { RouterLink, Router } from '@angular/router'; // Importar Router y RouterLink
import { CartService } from '../../services/cart';
import { AuthService } from '../../services/auth';
import { take } from 'rxjs/operators';
// Quitar import innecesario: import { DetalleCarrito } from '../../models/carrito.model';
import { HttpErrorResponse } from '@angular/common/http'; // Importar HttpErrorResponse

@Component({
  selector: 'app-cart',
  standalone: true,
  // Importamos CommonModule, RouterLink y los Pipes necesarios
  imports: [CommonModule, RouterLink, CurrencyPipe],
  templateUrl: './cart.html',
  styleUrls: ['./cart.css']
})
export class CartComponent implements OnInit {

  // Inyectar servicios
  public cartService = inject(CartService); // Público para usar en el HTML
  public authService = inject(AuthService); // Público para usar en el HTML
  private router = inject(Router);

  public isLoading = signal(true); // Usar signal
  public error = signal<string | null>(null); // Usar signal

  ngOnInit(): void {
    // Si el carrito no está cargado, lo cargamos
    // Accedemos al valor del signal con cartService.cart()
    if (!this.cartService.cart() && this.authService.isLoggedIn()) {
      this.loadCart();
    } else {
      this.isLoading.set(false);

      // Si está cargado pero está vacío, podría haber un error o estar limpio
      if (this.cartService.cart()?.items.length === 0) {
        // No marcar como error, simplemente mostrar mensaje de vacío
        // this.error.set('Tu carrito está vacío.');
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
        // El signal se actualiza en el servicio, aquí solo quitamos el loading
        if (cartData?.items.length === 0) {
           console.log('Carrito cargado, pero está vacío.');
        }
      },
      error: (err: HttpErrorResponse | Error) => { // Manejar ambos tipos de error
        const message = err instanceof HttpErrorResponse ? err.error?.message || err.message : err.message;
        this.error.set('Error al cargar el carrito: ' + message);
        this.isLoading.set(false);
        console.error('Error en getMiCarrito:', err);
        // Si hay error (403, 404, etc.), podría ser que el carrito no existe
        // o la sesión expiró. El signal cart quedará null.
      }
    });
  }

  /**
   * Lógica para eliminar un ítem del carrito
   */
  onRemoveItem(detalleId: number, productName: string) {
    if (!confirm(`¿Estás seguro de que quieres eliminar "${productName}" de tu carrito?`)) {
      return;
    }

    this.error.set(null); // Limpiar error
    this.cartService.removeItem(detalleId).pipe(take(1)).subscribe({ // Usar take(1)
      next: () => {
        // El signal 'cart' se actualiza automáticamente gracias al tap en el servicio
        console.log(`Ítem ${detalleId} eliminado.`);
         // Opcional: Mensaje de éxito
         // alert(`"${productName}" eliminado del carrito.`);
      },
      error: (err: HttpErrorResponse | Error) => { // Manejar ambos tipos de error
        const message = err instanceof HttpErrorResponse ? err.error?.message || err.message : err.message;
        this.error.set('Error al eliminar el producto: ' + message);
        console.error('Error en removeItem:', err);
        alert('Error al eliminar el producto: ' + message);
      }
    });
  }

  /**
   * Navega a la página de checkout (pago)
   */
  onCheckout() {
    // Verificar si el carrito existe y tiene items antes de navegar
    if (this.cartService.cart() && this.cartService.cart()!.items.length > 0) {
      this.router.navigate(['/checkout']);
    } else {
      this.error.set('No puedes proceder al pago con un carrito vacío.');
      alert('Tu carrito está vacío.'); // Añadir alerta para el usuario
    }
  }
}

