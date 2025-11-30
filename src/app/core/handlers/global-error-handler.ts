import { ErrorHandler, Injectable, Injector } from '@angular/core';
import { LoggerService } from '../services/logger';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {

  // Usamos Injector para obtener el LoggerService manualmente.
  // Esto es necesario porque el ErrorHandler se carga ANTES que los servicios normales,
  // y si inyectamos LoggerService en el constructor directamente, daría un error cíclico.
  constructor(private injector: Injector) {}

  handleError(error: any): void {
    const logger = this.injector.get(LoggerService);
    
    // Extraer el mensaje real del error (puede venir en varios formatos)
    const message = error.message ? error.message : error.toString();
    
    // Opcional: Obtener el stack trace (dónde ocurrió)
    // const stack = error.stack ? error.stack : 'No stack trace available';

    // 1. Loguear en la consola con nuestro formato bonito
    logger.error('🔥 ERROR NO CONTROLADO:', message);
    
    // 2. (Futuro) Aquí podrías enviar este error a tu backend:
    // http.post('/api/logs', { error: message, ... })
    
    // 3. Dejar que el error original también salga en consola (para que el navegador lo registre)
    console.error(error);
  }
}