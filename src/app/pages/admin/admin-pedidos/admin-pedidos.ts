import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { PedidoService } from '../../../services/pedido';
import { PedidoResponse, DetallePedido } from '../../../models/pedido';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms'; // Para los <select>

// Listas de estados (basadas en tus Enums de Spring)
const ESTADOS_PEDIDO = ['Pendiente', 'Pagado', 'Enviado', 'Entregado', 'Cancelado'];
const ESTADOS_PAGO = ['Pendiente', 'Completado', 'Fallido'];
const ESTADOS_ENVIO = ['En_preparacion', 'En_camino', 'Entregado', 'Retrasado'];

@Component({
  selector: 'app-admin-pedidos',
  standalone: true,
  imports: [CommonModule, DatePipe, CurrencyPipe, FormsModule], // Añadir FormsModule
  templateUrl: './admin-pedidos.html',
  styleUrls: ['./admin-pedidos.css'],
})
export class AdminPedidosComponent implements OnInit {
  private pedidoService = inject(PedidoService);

  // Signals de estado
  public pedidos = signal<PedidoResponse[]>([]);
  public isLoading = signal(true);
  public error = signal<string | null>(null);

  // Estados para los <select>
  public readonly estadosPedidoList = ESTADOS_PEDIDO;
  public readonly estadosPagoList = ESTADOS_PAGO;
  public readonly estadosEnvioList = ESTADOS_ENVIO;

  // Signal para rastrear qué pedido se está actualizando (para spinners)
  public updatingStatus = signal<Record<string, boolean>>({});

  ngOnInit(): void {
    this.loadPedidos();
  }

  loadPedidos(): void {
    this.isLoading.set(true);
    this.error.set(null);
    this.pedidoService.getAllPedidosAdmin().subscribe({
      next: (data) => {
        // Ordenar por fecha, los más nuevos primero
        data.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
        this.pedidos.set(data);
        this.isLoading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.error.set(err.message || 'Error al cargar los pedidos.');
        this.isLoading.set(false);
      },
    });
  }

  // --- Métodos de Actualización ---

  onEstadoPedidoChange(pedidoId: number, event: Event): void {
  const nuevoEstado = (event.target as HTMLSelectElement).value;
  this.actualizarEstado(pedidoId, 'pedido', () =>
    this.pedidoService.updatePedidoStatusAdmin(pedidoId, { nuevoEstado })
  );
}

onEstadoPagoChange(pedidoId: number, event: Event): void {
  const nuevoEstado = (event.target as HTMLSelectElement).value;
  this.actualizarEstado(pedidoId, 'pago', () =>
    this.pedidoService.updatePagoStatusAdmin(pedidoId, { nuevoEstadoPago: nuevoEstado })
  );
}

onEstadoEnvioChange(pedidoId: number, event: Event): void {
  const nuevoEstado = (event.target as HTMLSelectElement).value;
  this.actualizarEstado(pedidoId, 'envio', () =>
    this.pedidoService.updateEnvioStatusAdmin(pedidoId, { nuevoEstadoEnvio: nuevoEstado })
  );
}


  /**
   * Función genérica para manejar la actualización de estado
   * @param pedidoId ID del pedido
   * @param tipo 'pedido', 'pago', 'envio' (para el spinner)
   * @param serviceCall La función observable del servicio a llamar
   */
  private actualizarEstado(pedidoId: number, tipo: string, serviceCall: () => any): void {
    const updateKey = `${pedidoId}-${tipo}`;
    this.setUpdatingStatus(updateKey, true);

    serviceCall().subscribe({
      next: (pedidoActualizado: PedidoResponse) => {
        // Actualizar el pedido en la lista local
        this.pedidos.update((lista) =>
          lista.map((p) => (p.pedidoId === pedidoId ? pedidoActualizado : p))
        );
        this.setUpdatingStatus(updateKey, false);
      },
      error: (err: HttpErrorResponse) => {
        alert(`Error al actualizar estado ${tipo}: ${err.message}`);
        this.setUpdatingStatus(updateKey, false);
        // Opcional: recargar los pedidos para revertir el <select>
        this.loadPedidos();
      },
    });
  }

  // Helper para manejar el estado de carga de los <select>
  private setUpdatingStatus(key: string, isUpdating: boolean): void {
    this.updatingStatus.update((current) => ({ ...current, [key]: isUpdating }));
  }

  // Helper para dar color a los estados (opcional)
  getStatusColor(status: string): string {
    switch (status.toUpperCase()) {
      case 'PENDIENTE':
        return 'bg-yellow-100 text-yellow-800';
      case 'COMPLETADO':
      case 'PAGADO':
      case 'ENTREGADO':
        return 'bg-green-100 text-green-800';
      case 'FALLIDO':
      case 'CANCELADO':
      case 'RETRASADO':
        return 'bg-red-100 text-red-800';
      case 'EN_CAMINO':
      case 'ENVIADO':
      case 'EN_PREPARACION':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }
}
