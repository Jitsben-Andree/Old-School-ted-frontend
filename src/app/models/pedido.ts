// Basado en tu PedidoResponse.dto
// (Necesitamos DetallePedidoResponse, que crearé aquí también)

export interface DetallePedidoResponse {
  detallePedidoId: number;
  productoId: number;
  productoNombre: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  montoDescuento: number;
}

export interface Pedido {
  pedidoId: number;
  fecha: string; // (Se recibirá como string ISO)
  estado: string; // Pendiente, Pagado, Enviado, etc.
  total: number;
  detalles: DetallePedidoResponse[];
  direccionEnvio: string;
  estadoEnvio: string;
  estadoPago: string;
  metodoPago: string;
}
