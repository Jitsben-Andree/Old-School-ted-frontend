import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Importante para [(ngModel)]
import { InventarioService } from '../../../services/inventario';
import { Inventario } from '../../../models/inventario';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-admin-inventory',
  standalone: true,
  imports: [CommonModule, FormsModule], // Añadir FormsModule
  templateUrl: './admin-inventory.html',
  styleUrls: ['./admin-inventory.css']
})
export class AdminInventoryComponent implements OnInit {

  // --- Inyecciones ---
  private inventarioService = inject(InventarioService);

  // --- Signals de Estado ---
  public inventarioLista = signal<Inventario[]>([]);
  public isLoading = signal(true);
  public error = signal<string | null>(null);

  // --- NgModel Binds ---
  // Usaremos un Map para vincular los inputs de "nuevoStock"
  // La clave (key) será el 'productoId'
  public nuevoStockMap: { [key: number]: number } = {};
  
  // Usaremos un Map para los estados de carga de cada fila
  public isUpdatingMap: { [key: number]: boolean } = {};

  ngOnInit(): void {
    this.loadInventario();
  }

  loadInventario(): void {
    this.isLoading.set(true);
    this.error.set(null);
    this.inventarioService.getTodoElInventario().subscribe({
      next: (data) => {
        this.inventarioLista.set(data);
        
        // Inicializar el nuevoStockMap con el stock actual
        data.forEach(item => {
          // Usamos item.productoId como clave única
          this.nuevoStockMap[item.productoId] = item.stock; 
          this.isUpdatingMap[item.productoId] = false;
        });
        
        this.isLoading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.error.set(err.message || 'Error al cargar el inventario.');
        this.isLoading.set(false);
      }
    });
  }

  actualizarStockProducto(productoId: number): void {
    const nuevoStock = this.nuevoStockMap[productoId];
    
    // Validación simple
    if (nuevoStock === null || nuevoStock < 0 || typeof nuevoStock !== 'number') {
      alert('Por favor, ingrese un stock válido (0 o más).');
      return;
    }

    this.isUpdatingMap[productoId] = true; // Mostrar spinner en la fila

    const request = { productoId: productoId, nuevoStock: nuevoStock };

    this.inventarioService.actualizarStock(request).subscribe({
      next: (inventarioActualizado) => {
        
        // Actualizar la lista localmente para que se refleje en la tabla
        this.inventarioLista.update(lista =>
          lista.map(item =>
            item.productoId === productoId ? inventarioActualizado : item
          )
        );
        
        // Sincronizar el input con el valor guardado (importante)
        this.nuevoStockMap[productoId] = inventarioActualizado.stock;
        this.isUpdatingMap[productoId] = false;
      },
      error: (err: HttpErrorResponse) => {
        alert('Error al actualizar: ' + err.message);
        this.isUpdatingMap[productoId] = false;
      }
    });
  }
}

