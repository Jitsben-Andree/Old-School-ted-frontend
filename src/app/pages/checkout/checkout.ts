import { Component, inject, OnInit, signal } from '@angular/core'; // Importar signal
import { CommonModule, CurrencyPipe } from '@angular/common'; // Importar CurrencyPipe
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms'; // Importar ReactiveForms
import { Router, RouterLink } from '@angular/router';
import { CartService } from '../../services/cart';
import { PedidoService } from '../../services/pedido';
import { PedidoRequest } from '../../models/pedido-request';
import { Carrito } from '../../models/carrito';
import { HttpErrorResponse } from '@angular/common/http';
import { take } from 'rxjs';

@Component({
  selector: 'app-checkout',
  standalone: true,
  // Importar CommonModule, ReactiveFormsModule, RouterLink y CurrencyPipe
  imports: [CommonModule, ReactiveFormsModule, RouterLink, CurrencyPipe],
  templateUrl: './checkout.html',
})
export class CheckoutComponent implements OnInit {
  // Inyectar servicios
  public cartService = inject(CartService); // Hacer público para usar en HTML
  private pedidoService = inject(PedidoService);
  private fb = inject(FormBuilder);
  private router = inject(Router);

  // Usar signal para el carrito
  public cart = signal<Carrito | null>(null);
  public checkoutForm: FormGroup;
  public isLoading = signal(false); // Usar signal
  public errorMessage = signal<string | null>(null); // Usar signal

  // Listado de métodos de pago (ajustado a MAYÚSCULAS para el Enum de Java)
  // Aunque en el HTML se muestren con mayúscula inicial, el valor enviado será este
  public metodosPago = [
    { value: 'YAPE', display: 'Yape' },
    { value: 'PLIN', display: 'Plin' },
    { value: 'TARJETA', display: 'Tarjeta' },
    { value: 'PAYPAL', display: 'PayPal' },
    { value: 'TRANSFERENCIA', display: 'Transferencia' }
  ];

  constructor() {
    // Inicialización del formulario reactivo
    this.checkoutForm = this.fb.group({
      direccionEnvio: ['', [Validators.required, Validators.minLength(10)]],
      // Asegurarse de que el valor por defecto coincida con uno de los 'value' en metodosPago
      metodoPagoInfo: ['TARJETA', Validators.required] 
    });
  }

  ngOnInit(): void {
    // Nos aseguramos de tener la info del carrito usando el signal
    const currentCart = this.cartService.cart(); // Acceder al valor del signal

    if (currentCart && currentCart.items.length > 0) {
      this.cart.set(currentCart); // Asignar al signal local
    } else if (currentCart === null) {
      // Si el signal del servicio es null, intentar cargarlo
      this.loadCart();
    } else {
      // Si el signal del servicio está cargado pero vacío (length === 0), redirigir
      this.handleEmptyCart();
    }
  }

  loadCart() {
     this.isLoading.set(true); // Activar loading
     this.cartService.getMiCarrito().pipe(take(1)).subscribe({
      next: (loadedCart) => {
        this.isLoading.set(false); // Desactivar loading
        if (loadedCart && loadedCart.items.length > 0) {
           this.cart.set(loadedCart); // Asignar al signal local
        } else {
           this.handleEmptyCart(); // Redirigir si está vacío
        }
      },
      error: (err) => { // Simplificar manejo de error
         this.isLoading.set(false); // Desactivar loading
         console.error("Error cargando carrito en checkout:", err);
         this.handleEmptyCart(); // Redirigir en caso de error
      }
    });
  }

  handleEmptyCart() {
     alert('Tu carrito está vacío o la sesión expiró. Serás redirigido.');
     this.router.navigate(['/cart']); // Redirigir a la página del carrito
  }

  onSubmit() {
    if (this.checkoutForm.invalid || !this.cart()) { // Acceder al valor del signal
      this.checkoutForm.markAllAsTouched(); // Marcar campos si son inválidos
      if (!this.cart()) {
          this.errorMessage.set("Error: No se pudo cargar la información del carrito.");
      }
      return;
    }

    this.isLoading.set(true); // Activar loading
    this.errorMessage.set(null); // Limpiar error previo

    // Crear el request con los valores del formulario
    const request: PedidoRequest = {
        direccionEnvio: this.checkoutForm.value.direccionEnvio,
        // Asegurarse de enviar el valor correcto (MAYÚSCULAS)
        metodoPagoInfo: this.checkoutForm.value.metodoPagoInfo 
    };

    console.log("Enviando PedidoRequest:", request); // Log para depurar

    this.pedidoService.crearPedidoDesdeCarrito(request).pipe(take(1)).subscribe({ // Usar take(1)
      next: (pedidoResponse) => { // Recibir la respuesta del pedido
        this.isLoading.set(false); // Desactivar loading
        console.log("Pedido creado:", pedidoResponse); // Log de éxito

        // Éxito: Limpiamos el carrito local en el servicio
        this.cartService.clearCartOnLogout(); // Usar el método que creamos

        // Redirigir a "Mis Pedidos"
        alert('¡Pedido realizado con éxito! Gracias por tu compra.');
        this.router.navigate(['/mis-pedidos']);
      },
      error: (err: HttpErrorResponse | Error) => { // Manejar ambos tipos de error
        this.isLoading.set(false); // Desactivar loading
        // Intentar obtener el mensaje específico del backend
        const backendErrorMessage = err instanceof HttpErrorResponse ? err.error?.message || err.message : err.message;
        const displayMessage = backendErrorMessage || 'Ocurrió un error inesperado al procesar el pedido.';
        this.errorMessage.set(displayMessage); // Mostrar error específico
        console.error('Error en crearPedidoDesdeCarrito:', err);
        alert(`Error al crear el pedido: ${displayMessage}`); // Mostrar alerta con error específico
      }
    });
  }
}

