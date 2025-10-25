import { Component, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common'; // Para *ngIf
import { Router, RouterLink,RouterLinkActive } from '@angular/router'; // Para [routerLink]
import { AuthService } from '../../services/auth';
import { CartService } from '../../services/cart';
import { take } from 'rxjs';

@Component({
  selector: 'app-navbar',
  standalone: true,
  // 1. Importamos CommonModule y RouterLink
  imports: [CommonModule, RouterLink,RouterLinkActive], 
  // 2. Apuntamos a los archivos separados
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css']
})
export class NavbarComponent {

  // 3. Inyectamos los servicios que necesitamos
  public authService = inject(AuthService); // Público para usarlo en el HTML
  public cartService = inject(CartService); // Público para el contador del carrito
  private router = inject(Router);

  constructor() {
    // ✅ Usamos Signals con effect()
    effect(() => {
      const isLoggedIn = this.authService.isLoggedIn(); // se lee como función

      if (isLoggedIn) {
        this.cartService.getMiCarrito().pipe(take(1)).subscribe();
      } else {
        this.cartService.clearCartOnLogout();
      }
    });
  }

  // 4. Lógica de Logout
  onLogout() {
    this.authService.logout();
    this.router.navigate(['/login']); // Redirigimos al login
  }
}
