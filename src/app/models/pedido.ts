// Coincide con tu DTO PedidoResponse
export interface PedidoResponse {
  pedidoId: number;
  fecha: string; 
  estado: string;
  total: number;
  detalles: DetallePedido[];
  direccionEnvio: string;
  estadoEnvio: string;
  estadoPago: string;
  metodoPago: string;
  usuarioId?: number; 
}


export interface DetallePedido {
  detallePedidoId: number;
  productoId: number;
  productoNombre: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  montoDescuento: number;
}
