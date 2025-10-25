import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Importar
import { RouterLink } from '@angular/router'; // Importar
import { CartService } from '../../services/cart';
import { AuthService } from '../../services/auth';
import { take } from 'rxjs';

@Component({
  selector: 'app-cart',
  standalone: true,
  // 1. Añadir CommonModule y RouterLink
  imports: [CommonModule, RouterLink], 
  templateUrl: './cart.html',
  styleUrls: ['./cart.css']
})
export class CartComponent implements OnInit {
  // 2. Inyectar servicios (públicos para usarlos en el HTML)
  public cartService = inject(CartService);
  public authService = inject(AuthService);

  public isLoading = true;
  public error: string | null = null;

  ngOnInit(): void {
    // 3. Asegurarnos de cargar el carrito si no está cargado
    if (!this.cartService.cart() && this.authService.isLoggedIn()) {
      this.cartService.getMiCarrito().pipe(take(1)).subscribe({
        next: () => this.isLoading = false,
        error: (err) => {
          this.error = err.message;
          this.isLoading = false;
        }
      });
    } else {
      this.isLoading = false;
    }
  }

  // 4. Lógica para eliminar item
  onRemoveItem(detalleId: number) {
    if (!confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      return;
    }

    this.cartService.removeItem(detalleId).subscribe({
      next: () => {
        alert('Producto eliminado');
      },
      error: (err) => {
        this.error = err.message;
        alert('Error al eliminar el producto');
      }
    });
  }

  // 5. (Opcional) Lógica para proceder al pago
  onCheckout() {
    // Esta lógica la implementaremos después
    alert('Función de "Proceder al Pago" pendiente de implementar.');
  }
}
