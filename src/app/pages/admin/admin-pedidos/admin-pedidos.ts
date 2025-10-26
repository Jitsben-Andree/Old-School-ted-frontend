import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common'; // Importar Pipes
import { PedidoService } from '../../../services/pedido';
import { PedidoResponse } from '../../../models/pedido';
import { AdminUpdatePedidoStatusRequest } from '../../../models/admin-update-pedido-request';
import { AdminUpdatePagoRequest } from '../../../models/admin-update-pago-request';
import { AdminUpdateEnvioRequest } from '../../../models/admin-update-envio-request';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms'; // Importar FormsModule para ngModel
import { take } from 'rxjs';

@Component({
  selector: 'app-admin-pedidos',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyPipe, DatePipe], // Añadir FormsModule y Pipes
  templateUrl: './admin-pedidos.html', // Corregido a .html
  styleUrls: ['./admin-pedidos.css']   // Corregido a .css
})
export class AdminPedidosComponent implements OnInit {
  // Inyectar servicios
  private pedidoService = inject(PedidoService);

  // Señales para datos y estado
  public pedidos = signal<PedidoResponse[]>([]);
  public isLoading = signal(true);
  public error = signal<string | null>(null);

  // Opciones para los dropdowns (basadas en los Enums de Java, en MAYÚSCULAS)
  public estadosPedido = ['PENDIENTE', 'PAGADO', 'ENVIADO', 'ENTREGADO', 'CANCELADO'];
  public estadosPago = ['PENDIENTE', 'COMPLETADO', 'FALLIDO'];
  public estadosEnvio = ['EN_PREPARACION', 'EN_CAMINO', 'ENTREGADO', 'RETRASADO'];

  ngOnInit(): void {
    this.loadPedidos();
  }

  /**
   * Carga la lista de todos los pedidos
   */
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
        console.error('Error en getAllPedidosAdmin:', err);
      }
    });
  }

  /**
   * Se llama cuando se cambia el estado general del pedido
   */
  onEstadoPedidoChange(pedidoId: number, event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const nuevoEstado = selectElement.value;
    const request: AdminUpdatePedidoStatusRequest = { nuevoEstado };
    this.actualizarEstado(pedidoId, 'estado', request, nuevoEstado);
  }

  /**
   * Se llama cuando se cambia el estado del pago
   */
  onEstadoPagoChange(pedidoId: number, event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const nuevoEstadoPago = selectElement.value;
    const request: AdminUpdatePagoRequest = { nuevoEstadoPago };
    this.actualizarEstado(pedidoId, 'pago', request, nuevoEstadoPago);
  }

  /**
   * Se llama cuando se cambia el estado del envío
   */
  onEstadoEnvioChange(pedidoId: number, event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const nuevoEstadoEnvio = selectElement.value;
    // Aquí podrías añadir lógica para pedir fecha o dirección si fuera necesario
    const request: AdminUpdateEnvioRequest = { nuevoEstadoEnvio };
    this.actualizarEstado(pedidoId, 'envio', request, nuevoEstadoEnvio);
  }

  /**
   * Función genérica para actualizar los diferentes estados
   */
  private actualizarEstado(pedidoId: number, tipo: 'estado' | 'pago' | 'envio', request: any, nuevoValor: string): void {
    this.error.set(null); // Limpiar errores previos
    let updateObservable;

    switch (tipo) {
      case 'estado':
        updateObservable = this.pedidoService.updatePedidoStatusAdmin(pedidoId, request as AdminUpdatePedidoStatusRequest);
        break;
      case 'pago':
        updateObservable = this.pedidoService.updatePagoStatusAdmin(pedidoId, request as AdminUpdatePagoRequest);
        break;
      case 'envio':
        updateObservable = this.pedidoService.updateEnvioStatusAdmin(pedidoId, request as AdminUpdateEnvioRequest);
        break;
      default:
        console.error('Tipo de actualización desconocido:', tipo);
        return;
    }

    updateObservable.pipe(take(1)).subscribe({
      next: (pedidoActualizado) => {
        // Actualizar la lista localmente para reflejar el cambio sin recargar todo
        this.pedidos.update(currentPedidos =>
          currentPedidos.map(p => p.pedidoId === pedidoId ? pedidoActualizado : p)
        );
        console.log(`Estado de ${tipo} actualizado para pedido ${pedidoId} a ${nuevoValor}`);
        // Opcional: Mostrar un mensaje de éxito pequeño
      },
      error: (err: HttpErrorResponse | Error) => {
        const message = err instanceof HttpErrorResponse ? err.error?.message || err.message : err.message;
        this.error.set(`Error al actualizar ${tipo} para pedido ${pedidoId}: ${message}`);
        console.error(`Error en update ${tipo}:`, err);
        // Opcional: Revertir el dropdown al valor anterior o recargar la lista
        this.loadPedidos(); // Recargar todo si falla
        alert(`Error al actualizar estado: ${message}`); // Mostrar alerta al usuario
      }
    });
  }

  /**
   * Función TrackBy para optimizar el *ngFor
   */
  trackById(index: number, item: PedidoResponse): number {
    return item.pedidoId;
  }
}

