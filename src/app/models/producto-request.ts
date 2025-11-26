export interface ProductoRequest {
    nombre: string;
    descripcion: string;
    talla: string;
    precio: number;
    activo: boolean;
    categoriaId: number;
    
    // --- ASEGÚRATE DE TENER ESTOS CAMPOS ---
    colorDorsal?: string;
    leyendas?: LeyendaDto[];
}

export interface LeyendaDto {
    nombre: string;
    numero: string;
}