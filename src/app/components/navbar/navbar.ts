import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router'; // Importar RouterLinkActive
import { AuthService } from '../../services/auth';
import { CartService } from '../../services/cart';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive], // Añadir RouterLinkActive
  templateUrl: './navbar.html',
})
export class NavbarComponent {
  // Inyección de servicios
  public authService = inject(AuthService);
  public cartService = inject(CartService);
  private router = inject(Router);

  // Señal computada para el total de items del carrito
  // Asegurarse de que devuelva 0 si el carrito es null o no tiene items
  public totalCartItems = computed(() => {
    const cart = this.cartService.cart();
    if (!cart || !cart.items || cart.items.length === 0) {
      return 0;
    }
    // Sumar las 'cantidades' de cada item
    return cart.items.reduce((total, item) => total + item.cantidad, 0);
  });

  // Estado para el menú móvil
  public isMobileMenuOpen = false;

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  /**
   * Cierra el menú móvil (usado al hacer clic en un enlace)
   */
  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
  }

  /**
   * Maneja el cierre de sesión del usuario
   */
  logout(): void {
    if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
      this.authService.logout();
      this.cartService.clearCartOnLogout(); // Limpiar el carrito local
      this.router.navigate(['/login']); // Redirigir al login
      this.closeMobileMenu(); // Cerrar menú si estaba abierto
    }
  }
}

