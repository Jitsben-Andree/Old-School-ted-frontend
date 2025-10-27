import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router'; // Importar ActivatedRoute y Router
import { ProductService } from '../../services/product';
import { CartService } from '../../services/cart'; // Importar CartService
import { AuthService } from '../../services/auth'; // Importar AuthService
import { ProductoResponse } from '../../models/producto';
import { HttpErrorResponse } from '@angular/common/http';
import { take, switchMap } from 'rxjs'; // Importar switchMap

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule ], // Añadir RouterLink y CurrencyPipe
  templateUrl: './product-detail.html',
})
export class ProductDetailComponent implements OnInit {

  // Servicios
  private route = inject(ActivatedRoute);
  private router = inject(Router); // Para navegación
  private productService = inject(ProductService);
  private cartService = inject(CartService);
  public authService = inject(AuthService); // Hacer público

  // Estado
  public product = signal<ProductoResponse | null>(null);
  public isLoading = signal(true);
  public error = signal<string | null>(null);
  // Para manejar la cantidad a añadir (si quieres un selector de cantidad)
  public quantityToAdd = signal(1);

  ngOnInit(): void {
    this.loadProductDetails();
  }

  /**
   * Obtiene el ID de la ruta y carga los detalles del producto
   */
  loadProductDetails(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.route.paramMap.pipe(
      take(1), // Tomar solo el primer valor de los parámetros
      switchMap(params => { // Cambiar al observable del servicio
        const idParam = params.get('id');
        if (!idParam) {
           throw new Error('No se encontró ID de producto en la ruta.');
        }
        const productId = +idParam; // Convertir a número
        if (isNaN(productId)) {
            throw new Error('ID de producto inválido.');
        }
        console.log("Cargando detalles para Producto ID:", productId);
        return this.productService.getProductoById(productId); // Llamar al servicio
      })
    ).subscribe({
      next: (data) => {
        this.product.set(data);
        this.isLoading.set(false);
        console.log("Producto cargado:", data);
      },
      error: (err: Error | HttpErrorResponse) => { // Manejar ambos tipos
        const message = err instanceof HttpErrorResponse ? err.error?.message || err.message : err.message;
        this.error.set('Error al cargar el producto: ' + message);
        this.isLoading.set(false);
        console.error('Error en getProductoById:', err);
        // Opcional: Redirigir si el producto no se encuentra (404)
        if (err instanceof HttpErrorResponse && err.status === 404) {
             alert("Producto no encontrado.");
             this.router.navigate(['/']); // Redirigir al home
        }
      }
    });
  }

  /**
   * Lógica para añadir el producto actual al carrito
   */
  onAddToCart(): void {
    const currentProduct = this.product();
    if (!currentProduct) {
        console.error("Intento de añadir al carrito sin producto cargado.");
        return; // No hacer nada si no hay producto
    }
    // Verificar si está logueado
    if (!this.authService.isLoggedIn()) {
      alert('Debes iniciar sesión para añadir productos al carrito.');
      this.router.navigate(['/login']);
      return;
    }
    // Verificar stock
     if (currentProduct.stock <= 0) {
       alert("Este producto está agotado.");
       return;
     }
      // Verificar si la cantidad a añadir es válida (mayor que 0 y menor o igual al stock)
      const qty = this.quantityToAdd();
      if (qty <= 0) {
          alert("Selecciona una cantidad válida.");
          return;
      }
       if (qty > currentProduct.stock) {
           alert(`Stock insuficiente. Solo quedan ${currentProduct.stock} unidades.`);
           // Opcional: ajustar quantityToAdd al máximo stock
           // this.quantityToAdd.set(currentProduct.stock);
           return;
       }


    console.log(`Intentando añadir Producto ID: ${currentProduct.id}, Cantidad: ${qty}`);
    this.error.set(null); // Limpiar error previo

    this.cartService.addItem(currentProduct.id, qty).pipe(take(1)).subscribe({
      next: (cartResponse) => {
        console.log('Producto añadido al carrito:', cartResponse);
        alert(`¡${qty} x "${currentProduct.nombre}" añadido(s) al carrito!`);
        // Opcional: Redirigir al carrito o mostrar mensaje
        // this.router.navigate(['/cart']);
      },
      error: (err: Error) => { // Capturar Error genérico
        console.error('Error al añadir al carrito desde detalle:', err);
        this.error.set(`Error al añadir al carrito: ${err.message}`);
        alert(`Error al añadir al carrito: ${err.message}`);
      }
    });
  }

  // --- Opcional: Métodos para manejar el input de cantidad ---
  increaseQuantity(): void {
      const currentProduct = this.product();
      if (currentProduct && this.quantityToAdd() < currentProduct.stock) {
          this.quantityToAdd.update(q => q + 1);
      }
  }

  decreaseQuantity(): void {
      if (this.quantityToAdd() > 1) {
          this.quantityToAdd.update(q => q - 1);
      }
  }

  // Validar cantidad al cambiar manualmente (opcional)
  validateQuantity(event: Event): void {
      const input = event.target as HTMLInputElement;
      let value = parseInt(input.value, 10);
      const currentProduct = this.product();

      if (isNaN(value) || value < 1) {
          value = 1;
      } else if (currentProduct && value > currentProduct.stock) {
          value = currentProduct.stock;
           alert(`Stock máximo: ${currentProduct.stock}`);
      }
       this.quantityToAdd.set(value);
       input.value = value.toString(); // Actualizar el input si se corrigió
  }

}
