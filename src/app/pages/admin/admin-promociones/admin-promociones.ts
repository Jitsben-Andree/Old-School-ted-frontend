import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, formatDate } from '@angular/common'; // Importa formatDate
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PromocionService } from '../../../services/promocion';
import { Promocion } from '../../../models/promocion';
import { PromocionRequest } from '../../../models/promocion-request';

@Component({
  selector: 'app-admin-promociones',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-promociones.html',
})
export class AdminPromocionesComponent implements OnInit {

  private promocionService = inject(PromocionService);
  private fb = inject(FormBuilder);

  public promociones = signal<Promocion[]>([]);
  public promocionForm: FormGroup;
  public modoEdicion = signal(false);
  public promoIdActual = signal<number | null>(null);
  public error = signal<string | null>(null);

  constructor() {
    this.promocionForm = this.fb.group({
      codigo: ['', [Validators.required, Validators.maxLength(50)]],
      descripcion: ['', [Validators.maxLength(255)]],
      descuento: [0, [Validators.required, Validators.min(0.01)]],
      fechaInicio: ['', Validators.required],
      fechaFin: ['', Validators.required],
      activa: [true]
    });
  }

  ngOnInit(): void {
    this.cargarPromociones();
  }

  cargarPromociones(): void {
    this.promocionService.getAllPromociones().subscribe({
      next: (data) => this.promociones.set(data),
      error: (err) => this.error.set('Error al cargar promociones: ' + err.message)
    });
  }

  manejarSubmit(): void {
    if (this.promocionForm.invalid) {
      return;
    }
    this.error.set(null);

    // Convertir fechas a formato ISO (YYYY-MM-DDTHH:mm:ss) que Spring espera
    const formValues = this.promocionForm.value;
    const request: PromocionRequest = {
      ...formValues,
      fechaInicio: new Date(formValues.fechaInicio).toISOString(),
      fechaFin: new Date(formValues.fechaFin).toISOString()
    };

    if (this.modoEdicion() && this.promoIdActual() !== null) {
      // --- MODO ACTUALIZAR ---
      this.promocionService.updatePromocion(this.promoIdActual()!, request).subscribe({
        next: (promoActualizada) => {
          this.promociones.update(promos =>
            promos.map(p => p.idPromocion === promoActualizada.idPromocion ? promoActualizada : p)
          );
          this.resetearFormulario();
        },
        error: (err) => this.error.set('Error al actualizar la promoción: ' + err.message)
      });
    } else {
      // --- MODO CREAR ---
      this.promocionService.createPromocion(request).subscribe({
        next: (nuevaPromo) => {
          this.promociones.update(promos => [...promos, nuevaPromo]);
          this.resetearFormulario();
        },
        error: (err) => this.error.set('Error al crear la promoción: ' + err.message)
      });
    }
  }

  cargarPromoEnForm(promocion: Promocion): void {
    this.modoEdicion.set(true);
    this.promoIdActual.set(promocion.idPromocion);
    
    // Formatear las fechas para el input 'datetime-local'
    // Spring envía un string ISO (ej: 2025-10-25T14:30:00), 
    // pero el input necesita 'YYYY-MM-DDTHH:mm' (sin segundos)
    const fechaInicio = this.formatoFechaParaInput(promocion.fechaInicio);
    const fechaFin = this.formatoFechaParaInput(promocion.fechaFin);

    this.promocionForm.patchValue({
      ...promocion,
      fechaInicio: fechaInicio,
      fechaFin: fechaFin
    });
  }

  // Helper para formatear fecha de ISO a 'YYYY-MM-DDTHH:mm'
  private formatoFechaParaInput(fechaISO: string): string {
    if (!fechaISO) return '';
    // Usamos formatDate de Angular para evitar problemas de zona horaria
    // 'yyyy-MM-ddTHH:mm' es el formato exacto que espera <input type="datetime-local">
    return formatDate(fechaISO, 'yyyy-MM-ddTHH:mm', 'en-US'); 
  }

  desactivarPromo(id: number): void {
    if (confirm('¿Estás seguro de que quieres desactivar esta promoción?')) {
      this.error.set(null);
      this.promocionService.desactivarPromocion(id).subscribe({
        next: () => {
          // Actualiza el estado 'activa' en la lista del signal
          this.promociones.update(promos =>
            promos.map(p => p.idPromocion === id ? { ...p, activa: false } : p)
          );
        },
        error: (err) => this.error.set('Error al desactivar la promoción: ' + err.message)
      });
    }
  }

  resetearFormulario(): void {
    this.promocionForm.reset({ activa: true }); // Resetea y deja "activa" en true
    this.modoEdicion.set(false);
    this.promoIdActual.set(null);
    this.error.set(null);
  }
}
