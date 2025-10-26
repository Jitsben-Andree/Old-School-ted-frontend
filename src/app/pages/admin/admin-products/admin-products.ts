import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../../services/product';
import { ProductoResponse } from '../../../models/producto';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [CommonModule, RouterLink], // RouterLink para los botones de "Crear" y "Editar"
  templateUrl: './admin-products.html',
  styleUrls: ['./admin-products.css']
})
export class AdminProductsComponent implements OnInit {
  
  // Inyectamos los servicios
  private productService = inject(ProductService);

  // Signals para manejar el estado
  public products = signal<ProductoResponse[]>([]);
  public loading = signal<boolean>(true);
  public error = signal<string | null>(null);

  ngOnInit(): void {
    this.loadProducts();
  }

  /**
   * Carga la lista de todos los productos (activos e inactivos)
   */
  loadProducts(): void {
    this.loading.set(true);
    this.error.set(null);

    // Usamos el nuevo método de admin para obtener TODOS los productos
    this.productService.getAllProductosAdmin().subscribe({
      next: (data) => {
        this.products.set(data);
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        console.error(err);
        this.error.set('Error al cargar los productos.');
        this.loading.set(false);
      }
    });
  }

  /**
   * Maneja el borrado lógico (desactivación) de un producto
   */
  onDeleteProduct(id: number): void {
    if (confirm('¿Estás seguro de que quieres desactivar este producto? (Borrado lógico)')) {
      
      this.productService.deleteProducto(id).subscribe({
        next: () => {
          // Opción 1: Recargar toda la lista
          // this.loadProducts(); 
          
          // Opción 2: Actualizar el signal local (más rápido)
          this.products.update(currentProducts => 
            currentProducts.map(p => 
              p.id === id ? { ...p, activo: false } : p
            )
          );
        },
        error: (err: HttpErrorResponse) => {
          console.error(err);
          alert('Error al desactivar el producto.');
        }
      });
    }
  }
}

