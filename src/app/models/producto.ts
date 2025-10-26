// Interfaz simple para la promoción (coincide con PromocionSimpleDto)
export interface PromocionSimple {
  idPromocion: number;
  codigo: string;
  descripcion: string;
  descuento: number;
  activa: boolean;
}

// Interfaz principal del producto (coincide con ProductoResponse)
export interface ProductoResponse {
  id: number;
  nombre: string;
  descripcion: string;
  talla: string;
  precio: number; // Precio final (con descuento si aplica)
  activo: boolean;
  categoriaNombre: string;
  stock: number;
  imageUrl?: string;

  // --- Campos de Promoción ---
  precioOriginal?: number;
  descuentoAplicado?: number;
  nombrePromocion?: string;

  // --- Lista de Promociones Asociadas ---
  promocionesAsociadas?: PromocionSimple[]; // Puede ser undefined si no hay
}

