import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router'; // Importa Router y RouterLink
import { AuthService } from '../../services/auth';
import { CartService } from '../../services/cart';

@Component({
  selector: 'app-navbar',
  standalone: true,
  // Asegúrate de importar RouterLink aquí para que [routerLink] funcione en el HTML
  imports: [CommonModule, RouterLink,RouterLinkActive], 
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css']
})
export class NavbarComponent {

  // Inyecta los servicios
  public authService = inject(AuthService);
  public cartService = inject(CartService);
  private router = inject(Router);

  // Señal para controlar el menú móvil
  public isMobileMenuOpen = false;

  constructor() {
    // Cuando el usuario inicie sesión, carga su carrito
    // (Esto es opcional, pero bueno para tener el número del carrito actualizado)
    if (this.authService.isLoggedIn()) {
      this.cartService.getMiCarrito().subscribe();
    }
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  logout() {
    this.authService.logout();
    this.cartService.cart.set(null); // Limpia el carrito al salir
    this.isMobileMenuOpen = false; // Cierra el menú móvil
    this.router.navigate(['/login']); // Redirige al login
  }
}
