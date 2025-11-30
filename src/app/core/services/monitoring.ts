import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SystemMetrics, SystemStatus } from '../interface/monitoring';

@Injectable({
  providedIn: 'root'
})
export class MonitoringService {

  private baseUrl = 'http://localhost:8080/api/v1';

  constructor(private http: HttpClient) { }

  getSystemStatus(): Observable<SystemStatus> {
    return this.http.get<SystemStatus>(`${this.baseUrl}/health/status`);
  }

  getSystemMetrics(): Observable<SystemMetrics> {
    return this.http.get<SystemMetrics>(`${this.baseUrl}/health/metrics`);
  }

  getRecentLogs(): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/admin/logs/recent`);
  }

  // --- NUEVO MÉTODO PARA DESCARGAR ---
  // Pedimos un 'blob' (archivo binario) en lugar de JSON
  downloadLogFile(): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/admin/logs/download`, {
      responseType: 'blob' 
    });
  }
}