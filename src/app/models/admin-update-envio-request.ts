// Coincide con tu DTO AdminUpdateEnvioRequest
export interface AdminUpdateEnvioRequest {
  nuevoEstadoEnvio: string; // Ej: "EN_PREPARACION", "EN_CAMINO", "ENTREGADO"
  // Los demás campos como direccionEnvio o fechaEnvio son opcionales
  // para esta actualización de estado.
}
