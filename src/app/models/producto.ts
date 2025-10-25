export interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  talla: string;
  precio: number;
  activo: boolean;
  categoriaNombre: string;
  stock: number;
  // imageUrl: string; // (Cuando se implemente)
}
