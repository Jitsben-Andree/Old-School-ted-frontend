import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common'; // Importar Pipes
import { RouterLink } from '@angular/router';
import { PedidoService } from '../../services/pedido';
import { Pedido } from '../../models/pedido';

@Component({
  selector: 'app-my-orders',
  standalone: true,
  // 1. Importar CommonModule, RouterLink y los Pipes
  imports: [CommonModule, RouterLink, DatePipe, CurrencyPipe],
  templateUrl: './my-orders.html',
  styleUrls: ['./my-orders.css']
})
export class MyOrdersComponent implements OnInit {

  // 2. Inyectar servicios
  private pedidoService = inject(PedidoService);

  // 3. Signals para el estado
  public pedidos = signal<Pedido[]>([]);
  public isLoading = signal<boolean>(true);
  public error = signal<string | null>(null);

  ngOnInit(): void {
    this.loadPedidos();
  }

  loadPedidos() {
    this.isLoading.set(true);
    this.error.set(null);

    // 4. Llamar al servicio
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

  // 5. (Opcional) Helper para dar color al estado
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
  
}