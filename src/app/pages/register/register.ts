import { Component, inject, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';

import { RegisterRequest } from '../../models/register-request'; 

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrls: ['./register.css'] // Puedes reutilizar login.css si quieres
})
export class RegisterComponent implements AfterViewInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  @ViewChild('bgVideo') bgVideo!: ElementRef<HTMLVideoElement>;

  public errorMessage: string | null = null;
  public isSubmitting = false;

  // La lógica del video es idéntica a la del login
  ngAfterViewInit(): void {
    const video = this.bgVideo?.nativeElement;
    if (!video) return;

    video.muted = true;
    video.defaultMuted = true;
    video.volume = 0;
    video.removeAttribute('controls');

    const lockSilence = () => {
      if (!video.muted) video.muted = true;
      if (video.volume !== 0) video.volume = 0;
    };
    video.addEventListener('volumechange', lockSilence);
    video.addEventListener('loadedmetadata', lockSilence);
    video.addEventListener('play', lockSilence);

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

  onSubmit(form: NgForm) {
    if (form.invalid) {
      form.control.markAllAsTouched();
      return;
    }

    const { password, confirmPassword } = form.value;

    // 1. Validación de contraseñas
    if (password !== confirmPassword) {
      this.errorMessage = 'Las contraseñas no coinciden.';
      return;
    }

    this.errorMessage = null;
    this.isSubmitting = true;
    
    // 2. Creamos el objeto sin incluir 'confirmPassword'
    const request: RegisterRequest = {
      nombre: form.value.name,
      email: form.value.email,
      password: form.value.password
    };

    // 3. Llamamos al servicio (asumiendo que tienes un método 'register')
    this.authService.register(request).subscribe({
      next: () => {
        this.isSubmitting = false;
        // Éxito: Redirigimos al login
        // Opcional: puedes pasar un queryParam para mostrar un mensaje de éxito en el login
        this.router.navigate(['/login'], { queryParams: { registered: 'true' } });
      },
      error: (err) => {
        this.isSubmitting = false;
        this.errorMessage = err.message || 'Error en el registro. Verifique sus datos.';
        console.error(err);
      }
    });
  }
}