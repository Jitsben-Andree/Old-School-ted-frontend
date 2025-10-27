// home.ts
import { Component, OnInit, AfterViewInit, OnDestroy, inject, signal, Renderer2 } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { take } from 'rxjs';

import { ProductService } from '../../services/product';
import { CartService } from '../../services/cart';
import { AuthService } from '../../services/auth';
import { ProductoResponse } from '../../models/producto';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, RouterModule],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {
  private productService = inject(ProductService);
  private cartService    = inject(CartService);
  public  authService    = inject(AuthService);
  private router         = inject(Router);
  private renderer       = inject(Renderer2);

  public products = signal<ProductoResponse[]>([]);
  public isLoading = signal(true);
  public error = signal<string | null>(null);

  private unlisteners: Array<() => void> = [];

  ngOnInit(): void {
    this.loadProducts();
  }

  // === Carrusel manual con bucle infinito ===
  ngAfterViewInit(): void {
    const slider = document.getElementById('manualSlider'); // contenedor
    const next   = document.getElementById('nextManual');
    const prev   = document.getElementById('prevManual');

    if (!slider || !next || !prev) return;

    const getStep = () => {
      const firstCard = slider.querySelector<HTMLElement>('.manual-item');
      const style = getComputedStyle(slider);
      const gap = parseInt(style.gap || '20', 10);
      const width = firstCard ? firstCard.getBoundingClientRect().width : 420;
      return width + gap;
    };

    const scrollRight = () => {
      const step = getStep();
      const maxScroll = slider.scrollWidth - slider.clientWidth;

      // Si está al final → vuelve al inicio
      if (slider.scrollLeft + step >= maxScroll) {
        slider.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        slider.scrollBy({ left: step, behavior: 'smooth' });
      }
    };

    const scrollLeft = () => {
      const step = getStep();

      // Si está al inicio → va al final
      if (slider.scrollLeft - step <= 0) {
        slider.scrollTo({ left: slider.scrollWidth, behavior: 'smooth' });
      } else {
        slider.scrollBy({ left: -step, behavior: 'smooth' });
      }
    };

    this.unlisteners.push(this.renderer.listen(next, 'click', scrollRight));
    this.unlisteners.push(this.renderer.listen(prev, 'click', scrollLeft));

    // Opcional: navegación con teclado
    this.unlisteners.push(
      this.renderer.listen(slider, 'keydown', (e: KeyboardEvent) => {
        if (e.key === 'ArrowRight') scrollRight();
        if (e.key === 'ArrowLeft') scrollLeft();
      })
    );
  }

  ngOnDestroy(): void {
    this.unlisteners.forEach(off => { try { off(); } catch {} });
    this.unlisteners = [];
  }

  // === Tu lógica original ===
  loadProducts(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.productService.getAllProductosActivos().pipe(take(1)).subscribe({
      next: (data) => {
        this.products.set(data ?? []);
        this.isLoading.set(false);
      },
      error: (err: HttpErrorResponse | Error) => {
        const message = err instanceof HttpErrorResponse ? (err.error?.message || err.message) : err.message;
        this.error.set('Error al cargar productos: ' + message);
        this.isLoading.set(false);
        console.error('Error en getAllProductosActivos:', err);
      }
    });
  }

  onAddToCart(productId: number, productName: string): void {
    if (!this.authService.isLoggedIn()) {
      alert('Debes iniciar sesión para añadir productos al carrito.');
      this.router.navigate(['/login']);
      return;
    }

    const cantidad = 1;
    this.error.set(null);

    this.cartService.addItem(productId, cantidad).pipe(take(1)).subscribe({
      next: () => {
        alert(`¡"${productName}" añadido al carrito!`);
      },
      error: (err: HttpErrorResponse | Error) => {
        const backendErrorMessage = err instanceof HttpErrorResponse ? (err.error?.message || err.message) : err.message;
        alert(`Error al añadir "${productName}": ${backendErrorMessage || 'Ocurrió un error inesperado.'}`);
      }
    });
  }
}
