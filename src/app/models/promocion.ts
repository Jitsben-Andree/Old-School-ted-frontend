export interface Promocion {
  idPromocion: number;
  codigo: string;
  descripcion: string;
  descuento: number;
  fechaInicio: string; // Angular manejará las fechas como strings (ISO 8601)
  fechaFin: string;
  activa: boolean;
}
