import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AsignacionService } from '../../../services/asignacion';
import { ProductService } from '../../../services/product'; // Necesitamos productos
import { ProveedorService } from '../../../services/proveedor'; // Necesitamos proveedores
import { Asignacion } from '../../../models/asignacion';
import { AsignacionRequest } from '../../../models/asignacion-request';
import { Producto } from '../../../models/producto';
import { Proveedor } from '../../../models/proveedor';

@Component({
  selector: 'app-admin-asignaciones',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-asignaciones.html',
})
export class AdminAsignacionesComponent implements OnInit {

  // Servicios
  private asignacionService = inject(AsignacionService);
  private productoService = inject(ProductService);
  private proveedorService = inject(ProveedorService);
  private fb = inject(FormBuilder);

  // Signals de estado
  public asignacionForm: FormGroup;
  public productos = signal<Producto[]>([]);
  public proveedores = signal<Proveedor[]>([]);
  public asignaciones = signal<Asignacion[]>([]);
  public productoSeleccionadoId = signal<number | null>(null);
  public error = signal<string | null>(null);

  constructor() {
    this.asignacionForm = this.fb.group({
      productoId: [null, Validators.required],
      proveedorId: [null, Validators.required],
      precioCosto: [0, [Validators.required, Validators.min(0.01)]]
    });
  }

  ngOnInit(): void {
    // Cargar los dropdowns del formulario
    this.cargarProductos();
    this.cargarProveedores();
  }

  cargarProductos(): void {
    this.productoService.getAllProductosAdmin().subscribe({ // Trae todos (activos e inactivos)
      next: (data) => this.productos.set(data),
      error: (err) => this.error.set('Error al cargar productos')
    });
  }

  cargarProveedores(): void {
    this.proveedorService.getAllProveedores().subscribe({
      next: (data) => this.proveedores.set(data),
      error: (err) => this.error.set('Error al cargar proveedores')
    });
  }

  // Se llama cuando el admin selecciona un producto del dropdown de la TABLA
  onProductoSelect(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const productoId = selectElement.value ? Number(selectElement.value) : null;
    this.productoSeleccionadoId.set(productoId);
    
    if (productoId) {
      this.cargarAsignaciones(productoId);
    } else {
      this.asignaciones.set([]); // Limpia la tabla si no hay selección
    }
  }

  // Carga la tabla de asignaciones para un producto
  cargarAsignaciones(productoId: number): void {
    this.error.set(null);
    this.asignacionService.getAsignacionesPorProducto(productoId).subscribe({
      next: (data) => this.asignaciones.set(data),
      error: (err) => this.error.set('Error al cargar asignaciones: ' + err.message)
    });
  }

  // Maneja el formulario de "Crear Nueva Asignación"
  manejarSubmit(): void {
    if (this.asignacionForm.invalid) return;
    
    this.error.set(null);
    const request: AsignacionRequest = this.asignacionForm.value;

    this.asignacionService.createAsignacion(request).subscribe({
      next: (nuevaAsignacion) => {
        // Si el producto creado es el que está seleccionado, actualiza la tabla
        if (nuevaAsignacion.productoId === this.productoSeleccionadoId()) {
          this.asignaciones.update(asign => [...asign, nuevaAsignacion]);
        }
        this.asignacionForm.reset();
      },
      error: (err) => this.error.set('Error al crear asignación: ' + err.message)
    });
  }

  // Elimina una asignación de la tabla
  eliminarAsignacion(id: number): void {
    if (confirm('¿Estás seguro de que quieres eliminar esta asignación?')) {
      this.error.set(null);
      this.asignacionService.deleteAsignacion(id).subscribe({
        next: () => {
          this.asignaciones.update(asign => asign.filter(a => a.idAsignacion !== id));
        },
        error: (err) => this.error.set('Error al eliminar asignación: ' + err.message)
      });
    }
  }
  
  // (Opcional) Implementar actualización de precio
  // Por simplicidad, esta versión solo crea y elimina. La lógica de "updatePrecioCosto"
  // se puede añadir con un modal o un input inline, similar a la página de inventario.
}
