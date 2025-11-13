import { Component, inject, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';
import { UnlockRequest } from '../../models/UnlockRequest';

@Component({
  selector: 'app-unlock-account',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './unlock.html',
  // Asegúrate de que el CSS esté siendo referenciado aquí
  styleUrls: ['./unlock.css'] 
})
export class UnlockAccountComponent implements OnInit, AfterViewInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  // Para el control del video
  @ViewChild('bgVideo') bgVideo!: ElementRef<HTMLVideoElement>;

  // Control de Pasos: 1 = Pedir Email, 2 = Pedir Código
  public step = 1;

  public unlockData: UnlockRequest = {
    email: '',
    code: '',
    newPassword: ''
  };

  public errorMessage: string | null = null;
  public successMessage: string | null = null;
  public isSubmitting = false;

  ngOnInit(): void {
    // Si viene el email de la URL (desde el error de Login), lo prellenamos
    this.route.queryParams.subscribe(params => {
      if (params['email']) {
        this.unlockData.email = params['email'];
        // Opcional: Si ya viene el email, podríamos saltar al paso 2
        // o llamar a handleStep1Submit() automáticamente.
        // Por ahora, solo lo prellenamos.
      }
    });
  }

  ngAfterViewInit(): void {
    const video = this.bgVideo?.nativeElement;
    if (!video) return;

    // Silencio absoluto
    video.muted = true;
    video.defaultMuted = true;
    video.volume = 0;
    video.removeAttribute('controls');

    // Candado
    const lockSilence = () => {
      if (!video.muted) video.muted = true;
      if (video.volume !== 0) video.volume = 0;
    };
    video.addEventListener('volumechange', lockSilence);
    video.addEventListener('loadedmetadata', lockSilence);
    video.addEventListener('play', lockSilence);

    // iOS/Android
    video.setAttribute('muted', '');
    video.setAttribute('playsinline', '');
    video.setAttribute('webkit-playsinline', '');
    video.setAttribute('x5-playsinline', '');

    const playVideo = () => {
      video.play().catch(() => {
        video.muted = true;
        video.volume = 0;
        setTimeout(() => video.play().catch(() => {}), 300);
      });
    };
    playVideo();
  }

  /**
   * PASO 1: Valida el form, llama al servicio para enviar el código.
   */
  handleStep1Submit(form: NgForm): void {
    if (form.invalid) {
      form.control.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = null;
    this.successMessage = null;

    this.authService.requestResetCode(this.unlockData.email).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        this.successMessage = response.message || `Código enviado a ${this.unlockData.email}`;
        this.step = 2; // Avanzar al siguiente paso
      },
      error: (err: Error) => {
        this.isSubmitting = false;
        this.errorMessage = err.message || 'No pudimos enviar el código. Verifica el email.';
      }
    });
  }

  /**
   * PASO 2: Valida el form, llama al servicio para desbloquear/resetear.
   */
  handleStep2Submit(form: NgForm): void {
    if (form.invalid) {
      form.control.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = null;
    this.successMessage = null;

    // Asegurarnos de que todos los datos van en el request
    const request: UnlockRequest = {
      email: this.unlockData.email,
      code: this.unlockData.code,
      newPassword: this.unlockData.newPassword
    };

    this.authService.unlockAccount(request).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        this.successMessage = response.message || '¡Cuenta recuperada con éxito!';
        form.resetForm();
        
        // Limpiamos todo y redirigimos al Login después de 2 segundos
        this.unlockData = { email: '', code: '', newPassword: '' };
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (err: Error) => {
        this.isSubmitting = false;
        this.errorMessage = err.message || 'Código inválido, expirado o la contraseña no es válida.';
      }
    });
  }

  /**
   * Botón "Volver a intentar / Reenviar" en Paso 2.
   * Simplemente vuelve a ejecutar la lógica del paso 1.
   */
  resendCode(): void {
    // No necesitamos validar un formulario aquí, solo reenviar.
    this.isSubmitting = true; // Mostramos el loader
    this.errorMessage = null;
    this.successMessage = null;

    this.authService.requestResetCode(this.unlockData.email).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        this.successMessage = response.message || `Código reenviado a ${this.unlockData.email}`;
      },
      error: (err: Error) => {
        this.isSubmitting = false;
        this.errorMessage = err.message || 'No pudimos reenviar el código.';
      }
    });
  }
}