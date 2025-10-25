export interface DetalleCarrito {
  detalleCarritoId: number;
  productoId: number;
  productoNombre: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface Carrito {
  carritoId: number;
  usuarioId: number;
  items: DetalleCarrito[];
  total: number;
}

// Basado en tu DTO AddItemRequest.java
export interface AddItemRequest {
  productoId: number;
  cantidad: number;
}

