import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router'; // Importar RouterLink
import { ProductService } from '../../../services/product';
import { ProductoResponse } from '../../../models/producto'; // Usar ProductoResponse
import { HttpErrorResponse } from '@angular/common/http';
import { take } from 'rxjs';
import { saveAs } from 'file-saver'; // << Importar file-saver

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [CommonModule, RouterLink, CurrencyPipe], // Añadir RouterLink
  templateUrl: './admin-products.html',
})
export class AdminProductsComponent implements OnInit {

  private productService = inject(ProductService);

  public products = signal<ProductoResponse[]>([]);
  public isLoading = signal(true);
  public error = signal<string | null>(null);

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.isLoading.set(true);
    this.error.set(null);
    // Llamar al método que incluye inactivos
    this.productService.getAllProductosAdmin().pipe(take(1)).subscribe({
      next: (data) => {
        this.products.set(data);
        this.isLoading.set(false);
      },
      error: (err: Error) => { // Usar tipo Error
        this.error.set('Error al cargar productos: ' + err.message);
        this.isLoading.set(false);
        console.error("Error en getAllProductosIncludingInactive:", err);
      }
    });
  }

  /**
   * Desactiva un producto (soft delete)
   */
  onDeactivate(id: number, nombre: string): void {
    if (!confirm(`¿Estás seguro de DESACTIVAR el producto "${nombre}"?`)) {
      return;
    }
    this.error.set(null); // Limpiar error
    // Llamar al servicio deleteProducto
    this.productService.deleteProducto(id).pipe(take(1)).subscribe({
        next: () => {
             // Actualizar estado localmente
             this.products.update(currentProds =>
                 currentProds.map(p => p.id === id ? { ...p, activo: false } : p)
             );
              console.log(`Producto ${id} desactivado.`);
        },
        error: (err: Error) => { // Usar tipo Error
            this.error.set(`Error al desactivar producto ${id}: ${err.message}`);
            console.error(`Error en deleteProducto(${id}):`, err);
            alert(`Error al desactivar: ${err.message}`);
        }
    });
  }

  /**
   * Reactiva un producto (establece activo=true)
   */
   onActivate(id: number, nombre: string): void {
      if (!confirm(`¿Estás seguro de REACTIVAR el producto "${nombre}"?`)) {
        return;
      }
      this.error.set(null);
      // Necesitamos llamar a updateProducto para cambiar 'activo' a true
       const productoActual = this.products().find(p => p.id === id);
       if (!productoActual) {
           this.error.set(`No se encontró el producto ID ${id} para reactivar.`);
           return;
       }

       // Creamos el request para actualizar solo el estado 'activo'
       // Asumiendo que tenemos acceso al categoriaId (esto sigue siendo un PENDIENTE)
       // Si no tienes categoriaId, este PUT fallará si categoriaId es requerido en el backend DTO
       const categoriaIdPlaceholder = null; // <<< PENDIENTE: Necesitas obtener el ID real
       if (categoriaIdPlaceholder === null) {
           console.warn("Falta obtener el categoriaId para reactivar el producto ", id);
           // Podrías intentar buscar la categoría por nombre si tienes esa función
           // O mostrar un error más claro al usuario
       }

       const request = {
           nombre: productoActual.nombre,
           descripcion: productoActual.descripcion,
           precio: productoActual.precioOriginal || productoActual.precio,
           talla: productoActual.talla,
           categoriaId: categoriaIdPlaceholder, // <<< USA EL ID, NO EL NOMBRE
           activo: true // <<< El cambio clave
       };

        // Mostrar alerta temporalmente hasta resolver lo de categoriaId
        alert("PENDIENTE: La función Reactivar necesita obtener el ID de la categoría para funcionar correctamente con el endpoint PUT actual.");
        console.log("Request para reactivar (necesita categoriaId):", request);

        // --- DESCOMENTAR CUANDO TENGAS EL CATEGORIA ID ---
        /*
        this.isLoading.set(true); // Indicar carga para la actualización
        this.productService.updateProducto(id, request as any).pipe(take(1)).subscribe({
             next: (updatedProduct) => {
                this.products.update(currentProds =>
                     currentProds.map(p => p.id === id ? updatedProduct : p)
                 );
                 console.log(`Producto ${id} reactivado.`);
                 this.isLoading.set(false);
             },
             error: (err: Error) => {
                this.error.set(`Error al reactivar producto ${id}: ${err.message}`);
                console.error(`Error en updateProducto para activar(${id}):`, err);
                alert(`Error al reactivar: ${err.message}`);
                this.isLoading.set(false);
            }
        });
        */
        // --- FIN DESCOMENTAR ---

   }

  /**
   * Llama al backend para generar y descargar el archivo Excel.
   */
  exportToExcel(): void {
      console.log("Solicitando exportación a Excel...");
      this.isLoading.set(true); // Indicar carga
      this.error.set(null);

      // Llamada directa al servicio que devuelve un Blob
      this.productService.exportProductosToExcel().subscribe({
          next: (blob) => {
              // Usar file-saver para descargar el blob
              const filename = `productos_oldschooltees_${new Date().toISOString().split('T')[0]}.xlsx`;
              saveAs(blob, filename); // saveAs viene de 'file-saver'
              console.log("Archivo Excel descargado:", filename);
              this.isLoading.set(false);
          },
          error: (err: Error) => { // Capturar Error genérico
              this.error.set('Error al exportar a Excel: ' + err.message);
              this.isLoading.set(false);
              console.error("Error en exportToExcel:", err);
              alert('Error al generar el archivo Excel.');
          }
      });
  }


  trackById(index: number, item: ProductoResponse): number {
    return item.id;
  }
}

// Asegúrate de instalar file-saver: npm install file-saver @types/file-saver

