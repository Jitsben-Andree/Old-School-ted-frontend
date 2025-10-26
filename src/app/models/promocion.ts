export interface Promocion {
  idPromocion: number;
  codigo: string;
  descripcion: string;
  descuento: number; // En el backend es BigDecimal, aquí usamos number
  fechaInicio: string; // En el backend es LocalDateTime, aquí usamos string (ISO format)
  fechaFin: string;    // En el backend es LocalDateTime, aquí usamos string (ISO format)
  activa: boolean;
}

// Interfaz para enviar datos al crear/actualizar (coincide con PromocionRequest.java)
export interface PromocionRequest {
  codigo: string;
  descripcion: string;
  descuento: number;
  fechaInicio: string; // Enviar como string ISO (YYYY-MM-DDTHH:mm:ss)
  fechaFin: string;    // Enviar como string ISO (YYYY-MM-DDTHH:mm:ss)
  activa?: boolean;   // Opcional al crear, podría tener un default
}
