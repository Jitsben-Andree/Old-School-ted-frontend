// Coincide con tu DTO PedidoResponse
export interface PedidoResponse {
  pedidoId: number;
  fecha: string; // (o LocalDateTime, pero string es más fácil)
  estado: string;
  total: number;
  detalles: DetallePedido[];
  direccionEnvio: string;
  estadoEnvio: string;
  estadoPago: string;
  metodoPago: string;
  usuarioId?: number; // (Para la vista de admin)
}

// Coincide con tu DTO DetallePedidoResponse
export interface DetallePedido {
  detallePedidoId: number;
  productoId: number;
  productoNombre: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  montoDescuento: number;
}
