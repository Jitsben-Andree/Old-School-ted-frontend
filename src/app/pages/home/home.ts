import { Component, OnInit, AfterViewInit, OnDestroy, inject, signal, Renderer2 } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common'; // <<< AÑADIDO CurrencyPipe
import { Router, RouterModule, RouterLink } from '@angular/router'; // <<< AÑADIDO RouterLink
import { take } from 'rxjs';

import { ProductService } from '../../services/product';
import { CartService } from '../../services/cart';
import { AuthService } from '../../services/auth';
import { ProductoResponse } from '../../models/producto'; 
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, RouterModule, RouterLink], 
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

  // === Lógica para tus Sliders ===
  ngAfterViewInit(): void {
    // 1. Lógica para el Slider de CSS (Sección 1)
    this.setupAutoSlider();
    this.setupManualArrows();

    // 2. Lógica para el Slider de Colecciones (Sección 3)
    const slider = document.getElementById('manualSlider'); // contenedor
    const next   = document.getElementById('nextManual');
    const prev   = document.getElementById('prevManual');

    if (!slider || !next || !prev) return;

    const getStep = () => {
      const firstCard = slider.querySelector<HTMLElement>('.manual-item');
      if (!firstCard) return 420; // Valor por defecto
      const style = getComputedStyle(slider);
      const gap = parseInt(style.gap || '20', 10);
      const width = firstCard.getBoundingClientRect().width;
      return width + gap;
    };

    const scrollRight = () => {
      const step = getStep();
      const maxScroll = slider.scrollWidth - slider.clientWidth;
      // Añadir un pequeño buffer para el cálculo del final
      if (slider.scrollLeft + step >= maxScroll - step) {
        slider.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        slider.scrollBy({ left: step, behavior: 'smooth' });
      }
    };

    const scrollLeft = () => {
      const step = getStep();
      if (slider.scrollLeft - step <= 0) {
        slider.scrollTo({ left: slider.scrollWidth, behavior: 'smooth' });
      } else {
        slider.scrollBy({ left: -step, behavior: 'smooth' });
      }
    };

    this.unlisteners.push(this.renderer.listen(next, 'click', scrollRight));
    this.unlisteners.push(this.renderer.listen(prev, 'click', scrollLeft));

    this.unlisteners.push(
      this.renderer.listen(slider, 'keydown', (e: KeyboardEvent) => {
        if (e.key === 'ArrowRight') scrollRight();
        if (e.key === 'ArrowLeft') scrollLeft();
      })
    );
  }

  ngOnDestroy(): void {
    // Limpiar todos los listeners
    this.unlisteners.forEach(off => { try { off(); } catch {} });
    this.unlisteners = [];
  }

  // --- Helpers para el slider de CSS (Sección 1) ---
  setupAutoSlider(): void {
    let counter = 1;
    const intervalId = setInterval(() => {
        const radio = document.getElementById('radio' + counter) as HTMLInputElement;
        if (radio) radio.checked = true;
        counter++;
        if (counter > 4) counter = 1;
    }, 5000); // Cambia cada 5 segundos

    this.unlisteners.push(() => clearInterval(intervalId)); // Limpiar al destruir
  }

  setupManualArrows(): void {
     // Esta función se asigna al 'window' para que "onclick=" en el HTML funcione
     // No es la mejor práctica de Angular, pero es necesario para ese HTML
     (window as any).moveSlide = (n: number) => {
        const radios = document.querySelectorAll<HTMLInputElement>('input[name="radio-btn"]');
        let currentIdx = 0;
        radios.forEach((radio, idx) => {
            if(radio.checked) currentIdx = idx;
        });
        
        let nextIdx = (currentIdx + n) % radios.length;
        if (nextIdx < 0) nextIdx = radios.length - 1; // Manejar -1

        const nextRadio = radios[nextIdx];
        if (nextRadio) nextRadio.checked = true;
     };
  }

  // === Lógica del Catálogo de Productos ===
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
    this.error.set(null); // Limpiar error global

    this.cartService.addItem(productId, cantidad).pipe(take(1)).subscribe({
      next: (cartResponse) => {
        console.log('Producto añadido al carrito:', cartResponse);
        alert(`¡"${productName}" añadido al carrito!`);
      },
      error: (err: HttpErrorResponse | Error) => {
        const backendErrorMessage = err instanceof HttpErrorResponse ? (err.error?.message || err.message) : err.message;
        alert(`Error al añadir "${productName}": ${backendErrorMessage || 'Ocurrió un error inesperado.'}`);
      }
    });
  }

  /**
   * Función TrackBy para optimizar el @for del catálogo
   */
  trackById(index: number, item: ProductoResponse): number {
    return item.id;
  }
}

