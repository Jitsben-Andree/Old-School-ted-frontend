import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Importar FormsModule
import { InventarioService } from '../../../services/inventario';
import { Inventario } from '../../../models/inventario';
import { InventarioUpdateRequest } from '../../../models/inventario-update-request';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-admin-inventory',
  standalone: true,
  imports: [CommonModule, FormsModule], // Añadir FormsModule
  templateUrl: './admin-inventory.html',
})
export class AdminInventoryComponent implements OnInit {

  private inventarioService = inject(InventarioService);

  // Signals para el estado
  public inventarioList = signal<Inventario[]>([]);
  public inventarioEdit: { [key: number]: number } = {}; // Objeto para guardar los nuevos stocks
  public status = signal<'loading' | 'success' | 'error'>('loading');
  public error = signal<string | null>(null);

  ngOnInit(): void {
    this.loadInventario();
  }

  /**
   * Carga la lista completa del inventario
   */
  loadInventario(): void {
    this.status.set('loading');
    this.error.set(null);
    this.inventarioService.getTodoElInventario().subscribe({
      next: (data) => {
        this.inventarioList.set(data);
        // Inicializar el objeto de edición con los stocks actuales
        this.inventarioEdit = data.reduce((acc, item) => {
          acc[item.inventarioId] = item.stock; // Usamos inventarioId como clave
          return acc;
        }, {} as { [key: number]: number });
        this.status.set('success');
      },
      error: (err: HttpErrorResponse) => {
        this.error.set(err.message || 'Error al cargar el inventario.');
        this.status.set('error');
      }
    });
  }

  /**
   * Llama al servicio para actualizar el stock de un item específico
   */
  onUpdateStock(item: Inventario): void {
    const nuevoStock = this.inventarioEdit[item.inventarioId];

    // Validación simple
    if (nuevoStock === null || nuevoStock === undefined || nuevoStock < 0) {
      alert('Por favor, ingrese un valor de stock válido (mayor o igual a 0).');
      // Revertir al valor original si es inválido
      this.inventarioEdit[item.inventarioId] = item.stock;
      return;
    }

    // Si el stock no ha cambiado, no hacer nada
    if (nuevoStock === item.stock) {
      return;
    }


    this.status.set('loading'); // Mostrar indicador de carga
    this.error.set(null);

    const request: InventarioUpdateRequest = {
      productoId: item.productoId, // Usamos productoId para el request
      nuevoStock: nuevoStock
    };

    this.inventarioService.actualizarStock(request).subscribe({
      next: (updatedInventory) => {
        // Actualizar la lista local con la respuesta del servidor
        this.inventarioList.update(list =>
          list.map(inv =>
            inv.inventarioId === updatedInventory.inventarioId ? updatedInventory : inv
          )
        );
        // Actualizar el valor de edición también
        this.inventarioEdit[updatedInventory.inventarioId] = updatedInventory.stock;
        this.status.set('success');
        alert(`Stock de "${updatedInventory.productoNombre}" actualizado a ${updatedInventory.stock}`);
      },
      error: (err: HttpErrorResponse) => {
        this.error.set(err.message || `Error al actualizar stock de "${item.productoNombre}".`);
        // Revertir al valor original en caso de error
        this.inventarioEdit[item.inventarioId] = item.stock;
        this.status.set('success'); // Volver al estado 'success' para mostrar la tabla
        alert(`Error al actualizar: ${this.error()}`);
      }
    });
  }
}

