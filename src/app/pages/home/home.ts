import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common'; // Importar CurrencyPipe
import { ProductService } from '../../services/product';
import { CartService } from '../../services/cart';
import { AuthService } from '../../services/auth'; // Importar AuthService
import { ProductoResponse } from '../../models/producto';
import { HttpErrorResponse } from '@angular/common/http';
import { take } from 'rxjs';
import { Router, RouterModule } from '@angular/router'; // Importar Router

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, CurrencyPipe,RouterModule ], // Añadir CurrencyPipe
  templateUrl: './home.html', // Usar archivo externo
  styleUrls: ['./home.css']   // Usar archivo externo
})
export class HomeComponent implements OnInit {
  // Inyectar servicios (hacer authService público)
  private productService = inject(ProductService);
  private cartService = inject(CartService);
  public authService = inject(AuthService); // Hacer público para usar en HTML
  private router = inject(Router); // Inyectar Router

  // Usar signals para estado
  public products = signal<ProductoResponse[]>([]);
  public isLoading = signal(true);
  public error = signal<string | null>(null);

  ngOnInit(): void {
    this.loadProducts();
  }

  /**
   * Carga los productos activos desde el servicio.
   */
  loadProducts(): void {
    this.isLoading.set(true);
    this.error.set(null);
    this.productService.getAllProductosActivos().pipe(take(1)).subscribe({
      next: (data) => {
        this.products.set(data);
        this.isLoading.set(false);
      },
      error: (err: HttpErrorResponse | Error) => { // Manejar ambos tipos de error
        const message = err instanceof HttpErrorResponse ? err.error?.message || err.message : err.message;
        this.error.set('Error al cargar productos: ' + message);
        this.isLoading.set(false);
        console.error('Error en getAllProductosActivos:', err);
      }
    });
  }

  /**
   * Lógica para añadir un producto al carrito.
   * Verifica si el usuario está logueado antes de añadir.
   */
  onAddToCart(productId: number, productName: string): void {
    // Verificar si el usuario está logueado
    if (!this.authService.isLoggedIn()) {
      alert('Debes iniciar sesión para añadir productos al carrito.');
      this.router.navigate(['/login']); // Redirigir al login
      return;
    }

    const cantidad = 1; // Añadir siempre 1 unidad desde el catálogo
    console.log(`Intentando añadir Producto ID: ${productId}, Cantidad: ${cantidad}`);

    // Limpiar errores anteriores
    this.error.set(null);

    this.cartService.addItem(productId, cantidad).pipe(take(1)).subscribe({
      next: (cartResponse) => {
        console.log('Producto añadido al carrito:', cartResponse);
        alert(`¡"${productName}" añadido al carrito!`);
        // Opcional: Mostrar un mensaje de éxito más elegante (snackbar/toast)
      },
      error: (err: HttpErrorResponse | Error) => {
        console.error('Error al añadir al carrito:', err);
        // Intentar obtener el mensaje de error específico del backend si está disponible
        const backendErrorMessage = err instanceof HttpErrorResponse ? err.error?.message || err.message : err.message;
        const displayMessage = backendErrorMessage || 'Ocurrió un error inesperado.';
        // Actualizar señal de error para mostrar en el componente si es necesario
        // this.error.set(`Error al añadir "${productName}": ${displayMessage}`);
        // Mostrar alerta al usuario
        alert(`Error al añadir "${productName}": ${displayMessage}`);
      }
    });
  }

  /**
   * Función TrackBy para optimizar el bucle *ngFor/@for en el HTML.
   * Ayuda a Angular a identificar qué elementos han cambiado.
   */
  trackById(index: number, item: ProductoResponse): number {
    return item.id; // Asume que cada producto tiene un 'id' único
  }
}

