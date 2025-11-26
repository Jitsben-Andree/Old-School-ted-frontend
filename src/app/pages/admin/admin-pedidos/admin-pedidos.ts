import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { PedidoService } from '../../../services/pedido';
import { PedidoResponse } from '../../../models/pedido';
import { AdminUpdatePedidoStatusRequest } from '../../../models/admin-update-pedido-request';
import { AdminUpdatePagoRequest } from '../../../models/admin-update-pago-request';
import { AdminUpdateEnvioRequest } from '../../../models/admin-update-envio-request';
import { HttpErrorResponse } from '@angular/common/http';
import { take } from 'rxjs';

@Component({
  selector: 'app-admin-pedidos',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyPipe, DatePipe],
  templateUrl: './admin-pedidos.html',
})
export class AdminPedidosComponent implements OnInit {
  
  private pedidoService = inject(PedidoService);

  // Signals
  public pedidos = signal<PedidoResponse[]>([]);
  public isLoading = signal(true);
  public error = signal<string | null>(null);

  // Opciones para Dropdowns (Mismas del Backend Enums)
  public estadosPedido = ['PENDIENTE', 'PAGADO', 'ENVIADO', 'ENTREGADO', 'CANCELADO'];
  public estadosPago = ['PENDIENTE', 'COMPLETADO', 'FALLIDO'];
  public estadosEnvio = ['EN_PREPARACION', 'EN_CAMINO', 'ENTREGADO', 'RETRASADO'];

  ngOnInit(): void {
    this.loadPedidos();
  }

  loadPedidos(): void {
    this.isLoading.set(true);
    this.error.set(null);
    
    this.pedidoService.getAllPedidosAdmin().pipe(take(1)).subscribe({
      next: (data) => {
        this.pedidos.set(data);
        this.isLoading.set(false);
      },
      error: (err: HttpErrorResponse | Error) => {
        const message = err instanceof HttpErrorResponse ? err.error?.message || err.message : err.message;
        this.error.set('Error al cargar pedidos: ' + message);
        this.isLoading.set(false);
      }
    });
  }

  // --- Métodos de Actualización ---

  onEstadoPedidoChange(pedidoId: number, event: Event): void {
    const select = event.target as HTMLSelectElement;
    const nuevoEstado = select.value;
    const req: AdminUpdatePedidoStatusRequest = { nuevoEstado };
    this.actualizarEstado(pedidoId, 'estado', req);
  }

  onEstadoPagoChange(pedidoId: number, event: Event): void {
    const select = event.target as HTMLSelectElement;
    const nuevoEstadoPago = select.value;
    const req: AdminUpdatePagoRequest = { nuevoEstadoPago };
    this.actualizarEstado(pedidoId, 'pago', req);
  }

  onEstadoEnvioChange(pedidoId: number, event: Event): void {
    const select = event.target as HTMLSelectElement;
    const nuevoEstadoEnvio = select.value;
    const req: AdminUpdateEnvioRequest = { nuevoEstadoEnvio };
    this.actualizarEstado(pedidoId, 'envio', req);
  }

  private actualizarEstado(pedidoId: number, tipo: 'estado' | 'pago' | 'envio', request: any): void {
    this.error.set(null);
    let updateObservable;

    switch (tipo) {
      case 'estado':
        updateObservable = this.pedidoService.updatePedidoStatusAdmin(pedidoId, request);
        break;
      case 'pago':
        updateObservable = this.pedidoService.updatePagoStatusAdmin(pedidoId, request);
        break;
      case 'envio':
        updateObservable = this.pedidoService.updateEnvioStatusAdmin(pedidoId, request);
        break;
    }

    if (!updateObservable) return;

    updateObservable.pipe(take(1)).subscribe({
      next: (pedidoActualizado) => {
        // Actualización optimista local
        this.pedidos.update(current => 
           current.map(p => p.pedidoId === pedidoId ? pedidoActualizado : p)
        );
      },
      error: (err: HttpErrorResponse | Error) => {
        const message = err instanceof HttpErrorResponse ? err.error?.message || err.message : err.message;
        this.error.set(`Error al actualizar ${tipo}: ${message}`);
        this.loadPedidos(); // Revertir cambios recargando
        alert(`No se pudo actualizar: ${message}`);
      }
    });
  }

  trackById(index: number, item: PedidoResponse): number {
    return item.pedidoId;
  }
}
