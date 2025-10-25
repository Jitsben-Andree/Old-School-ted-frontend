import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms'; // Para el formulario
import { Router, RouterLink, RouterModule } from '@angular/router';
import { CartService } from '../../services/cart';
import { PedidoService } from '../../services/pedido';
import { PedidoRequest } from '../../models/pedido-request';
import { Carrito } from '../../models/carrito';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule], // Añadir FormsModule
  templateUrl: './checkout.html',
  styleUrls: ['./checkout.css']
})
export class CheckoutComponent implements OnInit {
  // Inyectar servicios
  public cartService = inject(CartService); // Público para usar en HTML
  private pedidoService = inject(PedidoService);
  private router = inject(Router);

  public cart: Carrito | null = null;
  public isLoading = false;
  public errorMessage: string | null = null;

  // Modelo para el formulario
  public pedidoRequest: PedidoRequest = {
    direccionEnvio: '',
    metodoPagoInfo: 'Yape' // Valor por defecto
  };

  ngOnInit(): void {
    // Nos aseguramos de tener la info del carrito
    const currentCart = this.cartService.cart();
    if (currentCart && currentCart.items.length > 0) {
      this.cart = currentCart;
    } else {
      // Si no hay carrito o está vacío, redirigir
      alert('Tu carrito está vacío. Serás redirigido.');
      this.router.navigate(['/cart']);
    }
  }

  onSubmit(form: NgForm) {
    if (form.invalid) {
      form.control.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;

    // Asignamos los valores del formulario al request
    const request: PedidoRequest = {
      direccionEnvio: form.value.direccionEnvio,
      metodoPagoInfo: form.value.metodoPagoInfo
    };

    this.pedidoService.crearPedidoDesdeCarrito(request).subscribe({
      next: (pedidoCreado) => {
        this.isLoading = false;
        
        // ¡Éxito! Limpiamos el carrito local
        this.cartService.clearCartOnLogout(); // (Usamos este método para limpiar)
        
        // Redirigir a "Mis Pedidos"
        alert('¡Pedido realizado con éxito!');
        this.router.navigate(['/mis-pedidos']);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.message; // Ej. "Stock insuficiente"
        console.error(err);
      }
    });
  }
}