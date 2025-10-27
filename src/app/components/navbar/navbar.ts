import { Component, inject, computed, signal } from '@angular/core'; // Importar signal
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router'; // Importar RouterLinkActive
import { AuthService } from '../../services/auth'; // Corregir ruta
import { CartService } from '../../services/cart'; // Corregir ruta

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
  public totalCartItems = computed(() => {
    const cart = this.cartService.cart();
    if (!cart || !cart.items || cart.items.length === 0) {
      return 0;
    }
    // Sumar las 'cantidades' de cada item
    return cart.items.reduce((total, item) => total + item.cantidad, 0);
  });

  // Estado para el menú móvil
  public isMobileMenuOpen = signal(false); // Usar signal

  toggleMobileMenu(): void {
    this.isMobileMenuOpen.update(isOpen => !isOpen); // Actualizar signal
  }

  /**
   * Cierra el menú móvil (usado al hacer clic en un enlace)
   */
  closeMobileMenu(): void {
    this.isMobileMenuOpen.set(false); // Setear signal
  }

  /**
   * Maneja el cierre de sesión del usuario
   */
  logout(): void {
    if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
      this.authService.logout();
      this.cartService.clearCartOnLogout();
      this.router.navigate(['/login']);
      this.closeMobileMenu();
    }
  }
}

