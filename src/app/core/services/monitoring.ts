import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { SystemMetrics, SystemStatus } from '../interface/monitoring';

@Injectable({
  providedIn: 'root'
})
export class MonitoringService {

  // URL Base de tu API (incluyendo el context-path)
  private baseUrl = 'http://localhost:8080/api/v1';

  constructor(private http: HttpClient) { }

  /**
   * 1. ESTADO DEL SISTEMA (Adaptado para Actuator)
   * Consume /actuator/health y lo transforma al formato que usa tu Dashboard.
   */
  getSystemStatus(): Observable<SystemStatus> {
    return this.http.get<any>(`${this.baseUrl}/actuator/health`).pipe(
      map(response => {
        // Mapeamos la respuesta compleja de Actuator a tu interfaz simple
        return {
          app: response.status, // "UP"
          database: response.components?.db?.status || 'UNKNOWN' // "UP" o "DOWN"
        };
      }),
      catchError(() => {
        // Si falla, devolvemos estado DOWN
        return of({ app: 'DOWN', database: 'DOWN' });
      })
    );
  }

  /**
   * 2. MÉTRICAS (Adaptado para Actuator)
   * Actuator no da todas las métricas en una sola llamada.
   * Hacemos 3 llamadas en paralelo (forkJoin) y combinamos los resultados.
   */
  getSystemMetrics(): Observable<SystemMetrics> {
    const uptime$ = this.http.get<any>(`${this.baseUrl}/actuator/metrics/process.uptime`);
    const memoryUsed$ = this.http.get<any>(`${this.baseUrl}/actuator/metrics/jvm.memory.used`);
    const memoryMax$ = this.http.get<any>(`${this.baseUrl}/actuator/metrics/jvm.memory.max`);
    const processors$ = this.http.get<any>(`${this.baseUrl}/actuator/metrics/system.cpu.count`);

    return forkJoin([uptime$, memoryUsed$, memoryMax$, processors$]).pipe(
      map(([uptimeRes, memUsedRes, memMaxRes, procRes]) => {
        
        // 1. Calcular Uptime
        const uptimeSeconds = uptimeRes.measurements[0].value;
        const uptimeHuman = this.formatUptime(uptimeSeconds);

        // 2. Calcular Memoria (Bytes -> MB)
        const memUsed = Math.round(memUsedRes.measurements[0].value / (1024 * 1024));
        const memTotal = Math.round(memMaxRes.measurements[0].value / (1024 * 1024));
        
        // 3. Procesadores
        const cores = procRes.measurements[0].value;

        return {
          memory_total_mb: memTotal,
          memory_used_mb: memUsed,
          memory_free_mb: memTotal - memUsed,
          uptime_human: uptimeHuman,
          uptime_millis: uptimeSeconds * 1000,
          processors_available: cores
        };
      })
    );
  }

  // --- LOGS (Sentry reemplaza esto, pero mantenemos el endpoint local por si acaso) ---
  // Si decidiste usar Sentry, puedes mostrar los logs de Sentry en su web.
  // Si aún quieres ver logs locales en tu dashboard, mantén esto:
  getRecentLogs(): Observable<string[]> {
    // Este endpoint sigue siendo manual porque Actuator no expone el contenido del archivo de log por defecto (por seguridad)
    // Así que usamos nuestro LogController que es seguro.
    return this.http.get<string[]>(`${this.baseUrl}/admin/logs/recent`);
  }

  // Descarga de logs
  downloadLogFile(): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/admin/logs/download`, {
      responseType: 'blob' 
    });
  }

  // Helper para formatear tiempo
  private formatUptime(seconds: number): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${h}h ${m}m ${s}s`;
  }
}