import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoggerService {

  constructor() { }

  log(message: string, ...args: any[]): void {
    this.print('LOG', 'green', message, args);
  }

  info(message: string, ...args: any[]): void {
    this.print('INFO', 'blue', message, args);
  }

  warn(message: string, ...args: any[]): void {
    this.print('WARN', 'orange', message, args);
  }

  error(message: string, ...args: any[]): void {
    this.print('ERROR', 'red', message, args);
  }

  private print(level: string, color: string, message: string, args: any[]): void {
    const timestamp = new Date().toISOString();
    // Formato visual: [FECHA] [NIVEL]: Mensaje
    const logPrefix = `[${timestamp}] [%c${level}%c]:`;
    
    // Usamos estilos CSS en la consola para diferenciar niveles
    // %c aplica el estilo que sigue en el siguiente argumento
    console.log(logPrefix, `color: ${color}; font-weight: bold`, 'color: inherit', message, ...args);
  }
}