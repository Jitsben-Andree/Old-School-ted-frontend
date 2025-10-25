// Este modelo coincide con tu DTO de Spring Boot
export interface ProductoRequest {
  nombre: string;
  descripcion: string;
  talla: string; // "S", "M", "L", "XL"
  precio: number;
  activo: boolean;
  categoriaId: number;
}
