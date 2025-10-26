export interface AsignacionResponse {
  idAsignacion: number; // El ID de la tabla ProductoProveedor
  productoId: number;
  productoNombre: string;
  proveedorId: number;
  proveedorRazonSocial: string;
  precioCosto: number; // En Java es BigDecimal, en TS usamos number
}

// Interfaz para crear una asignación (ProductoProveedorRequest)
export interface AsignacionRequest {
  productoId: number;
  proveedorId: number;
  precioCosto: number; // En Java es BigDecimal, en TS usamos number
}

// Interfaz para actualizar el precio (UpdatePrecioCostoRequest)
// Renombrada a UpdatePrecioRequest para claridad en Angular
export interface UpdatePrecioRequest {
  nuevoPrecioCosto: number; // En Java es BigDecimal, en TS usamos number
}