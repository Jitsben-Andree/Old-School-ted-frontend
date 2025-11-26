export interface AddItemRequest {
    productoId: number;
    cantidad: number;
    
    // --- NUEVOS CAMPOS OPCIONALES ---
    personalizacion?: {
        tipo: string;   // 'Leyenda' o 'Custom'
        nombre: string; // Ej: "MESSI"
        numero: string; // Ej: "10"
        precio: number; // Ej: 97.00
    };
    parche?: {
        tipo: string;   // 'UCL' o 'LaLiga'
        precio: number; // Ej: 73.00
    };
}