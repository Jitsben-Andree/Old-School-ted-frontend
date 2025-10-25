import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ProductService } from '../../../services/product';
import { Producto } from '../../../models/producto';

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [CommonModule, RouterLink, CurrencyPipe], // Añadir CurrencyPipe
  templateUrl: './admin-products.html',
  styleUrls: ['./admin-products.css']
})
export class AdminProductsComponent implements OnInit {

  private productService = inject(ProductService);
  private router = inject(Router);

  public productos = signal<Producto[]>([]);
  public isLoading = signal<boolean>(true);
  public error = signal<string | null>(null);

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts() {
    this.isLoading.set(true);
    this.error.set(null);

    // 1. Usamos el método de admin para cargar productos
    // (Asegúrate de que tu API devuelva activos e inactivos si es necesario)
    this.productService.getAllProductosAdmin().subscribe({
      next: (data) => {
        this.productos.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set(err.message);
        this.isLoading.set(false);
      }
    });
  }

  // 2. Método para editar
  editProduct(id: number) {
    // (Lo implementaremos después, nos llevará a /admin/products/edit/id)
    console.log('Ir a editar producto:', id);
    // this.router.navigate(['/admin/products/edit', id]);
  }

  // 3. Método para desactivar (borrado lógico)
  deleteProduct(producto: Producto) {
    // Usamos window.confirm para una confirmación simple
    // (En una app real, usarías un modal)
    if (confirm(`¿Estás seguro de que quieres desactivar "${producto.nombre}"?`)) {
      this.productService.deleteProducto(producto.id).subscribe({
        next: () => {
          // Opción 1: Recargar todo
          // this.loadProducts();

          // Opción 2: Actualizar el signal (más rápido)
          this.productos.update(currentProducts => 
            currentProducts.map(p => 
              p.id === producto.id ? { ...p, activo: false } : p
            )
          );
          alert('Producto desactivado con éxito.');
        },
        error: (err) => {
          this.error.set(err.message);
          alert('Error al desactivar el producto.');
        }
      });
    }
  }

  // 4. (Opcional) Método para reactivar un producto
  // (Necesitarías un endpoint PUT /admin/productos/{id}/activar en Spring)
  activateProduct(id: number) {
    // ... lógica para llamar al servicio de reactivación ...
  }
}