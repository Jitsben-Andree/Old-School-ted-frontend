export interface DetalleCarrito { // Cambiar nombre a DetalleCarrito
      detalleCarritoId: number;
      productoId: number;
      productoNombre: string;
      cantidad: number;
      precioUnitario: number; // Precio con descuento si aplica
      subtotal: number;       // Subtotal con descuento
      imageUrl?: string;      // <<< Añadir campo opcional
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

