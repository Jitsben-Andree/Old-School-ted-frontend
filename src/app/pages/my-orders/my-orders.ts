import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PedidoService } from '../../services/pedido';
import { PedidoResponse } from '../../models/pedido';

@Component({
  selector: 'app-my-orders',
  standalone: true,
  imports: [CommonModule, RouterLink, DatePipe, CurrencyPipe],
  templateUrl: './my-orders.html',
  styleUrls: ['./my-orders.css']
})
export class MyOrdersComponent implements OnInit {

  private pedidoService = inject(PedidoService);

  public pedidos = signal<PedidoResponse[]>([]);
  public isLoading = signal<boolean>(true);
  public error = signal<string | null>(null);

  ngOnInit(): void {
    this.loadPedidos();
  }

  loadPedidos() {
    this.isLoading.set(true);
    this.error.set(null);

    this.pedidoService.getMisPedidos().subscribe({
      next: (data) => {
        this.pedidos.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set(err.message);
        this.isLoading.set(false);
        console.error(err);
      }
    });
  }

  getStatusColor(estado: string): string {
    switch (estado.toUpperCase()) {
      case 'PENDIENTE':
        return 'bg-yellow-100 text-yellow-800';
      case 'PAGADO':
        return 'bg-blue-100 text-blue-800';
      case 'ENVIADO':
        return 'bg-indigo-100 text-indigo-800';
      case 'ENTREGADO':
        return 'bg-green-100 text-green-800';
      case 'CANCELADO':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  // única versión de isStepActive
  isStepActive(estadoEnvio: string | null | undefined, step: number): boolean {
    const e = (estadoEnvio || '').toUpperCase(); // ej: EN_PREPARACION

    if (step === 1) {
      return ['PENDIENTE', 'EN_PREPARACION', 'LISTO_RECOJO', 'ENTREGADO'].includes(e);
    }
    if (step === 2) {
      return ['EN_PREPARACION', 'LISTO_RECOJO', 'ENTREGADO'].includes(e);
    }
    if (step === 3) {
      return ['LISTO_RECOJO', 'ENTREGADO'].includes(e);
    }
    return false;
  }

  getStepClasses(estadoEnvio: string | null | undefined, step: number): string {
  const base =
    'w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-semibold transition-all duration-200';
  const active =
    ' bg-indigo-600 border-indigo-600 text-white shadow-md';
  const inactive =
    ' bg-white border-indigo-200 text-gray-500';

  return this.isStepActive(estadoEnvio, step)
    ? `${base} ${active}`
    : `${base} ${inactive}`;
}

}