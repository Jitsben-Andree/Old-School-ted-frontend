import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../services/product';
import { CartService } from '../../services/cart';
import { AuthService } from '../../services/auth';
import { Producto } from '../../models/producto';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-home',
  standalone: true,
  // 1. Importa CommonModule para ngIf/ngFor/async
  imports: [CommonModule], 
  // 2. Apunta a tus archivos separados
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class HomeComponent implements OnInit {
  // Inyectamos los servicios
  private productService = inject(ProductService);
  private cartService = inject(CartService);
  public authService = inject(AuthService); // Público para usarlo en el template

  public productos$!: Observable<Producto[]>;
  public error: string | null = null;

  ngOnInit(): void {
    // Obtenemos el stream de productos al iniciar
    this.productos$ = this.productService.getAllProductos();
    
    // Nos suscribimos al error para mostrarlo
    this.productos$.subscribe({
      error: (err) => {
        console.error(err);
        this.error = err.message;
      }
    });
  }

  onAddToCart(productoId: number) {
    if (!this.authService.isLoggedIn()) {
      alert("Por favor, inicia sesión para añadir productos al carrito.");
      return;
    }
    
    // Llama al servicio de carrito
    this.cartService.addItem(productoId, 1).subscribe({
      next: (cart) => {
        console.log('Producto añadido', cart);
        alert('¡Producto añadido al carrito!');
      },
      error: (err) => {
        console.error(err);
        alert(err.message); // Muestra el error (ej. "Sesión expirada")
      }
    });
  }

  trackById(index: number, item: any): number {
  return item.id; // o el nombre real de tu ID
  }

}

