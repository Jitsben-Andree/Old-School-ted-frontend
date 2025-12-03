import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MonitoringService } from '../../../core/services/monitoring';
import { SystemMetrics, SystemStatus } from '../../../core/interface/monitoring';
import { Subscription, interval } from 'rxjs';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-admin-logs',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-logs.html', 
  styleUrls: ['./admin-logs.css']
})
export class AdminLogsComponent implements OnInit, OnDestroy {

  status: SystemStatus | null = null;
  metrics: SystemMetrics | null = null;
  logs: string[] = [];
  
  isLoading = true;
  error = '';
  
  private refreshSubscription: Subscription | null = null;

  constructor(
    private monitoringService: MonitoringService,
    private cd: ChangeDetectorRef 
  ) {}

  ngOnInit(): void {
    this.loadData(true);
    this.refreshSubscription = interval(3000).subscribe(() => {
      this.loadData(false);
    });
  }

  ngOnDestroy(): void {
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }
  }

  loadData(showLoading = true): void {
    if (showLoading) this.isLoading = true;
    if (showLoading) this.error = '';

    // Status
    this.monitoringService.getSystemStatus()
      .pipe(
        finalize(() => {
          if (showLoading) {
            this.isLoading = false;
            this.cd.detectChanges();
          }
        })
      )
      .subscribe({
        next: (data) => {
          this.status = data;
          this.cd.detectChanges();
        },
        error: (err) => {
          console.error('Error status:', err);
          if (showLoading) this.error = 'No se pudo conectar con el servidor.';
        }
      });

    //Metrics
    this.monitoringService.getSystemMetrics().subscribe({
      next: (data) => {
        this.metrics = data;
        this.cd.detectChanges();
      },
      error: (err) => console.warn('Error métricas:', err)
    });

    
    // Verificamos si existe el método antes de llamarlo para evitar errores si no actualizaste el servicio aún
    if (this.monitoringService.getRecentLogs) {
        this.monitoringService.getRecentLogs().subscribe({
        next: (data) => {
            this.logs = data;
            this.cd.detectChanges();
        },
        error: (err) => console.warn('Error logs:', err)
        });
    }
  }

  get memoryUsagePercent(): number {
    if (!this.metrics) return 0;
    return Math.round((this.metrics.memory_used_mb / this.metrics.memory_total_mb) * 100);
  }

  
  downloadLogs(): void {
    this.monitoringService.downloadLogFile().subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'app.log'; 
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        console.error('Error descargando el log:', err);
        alert('No se pudo descargar el archivo de logs.');
      }
    });
  }
  public throwTestError(): void {
    throw new Error("Sentry Test Error (Frontend - Angular)");
  }
  
}