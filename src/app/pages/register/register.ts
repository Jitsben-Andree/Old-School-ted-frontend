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
  styleUrls: ['./register.css']
})
export class RegisterComponent implements AfterViewInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  @ViewChild('bgVideo', { static: true }) bgVideo!: ElementRef<HTMLVideoElement>;

  public errorMessage: string | null = null;
  public isSubmitting = false;

  ngAfterViewInit(): void {
  const video = this.bgVideo?.nativeElement;
  if (video) {
    // 🔇 Forzar todas las formas de silencio posibles
    video.pause();
    video.muted = true;
    video.defaultMuted = true;
    video.volume = 0;

    // 🔁 Asegurar bucle infinito
    video.loop = true;

    // 🧠 Algunos navegadores recuerdan volumen anterior, lo restablecemos
    try {
      video.setAttribute('muted', 'true');
      video.setAttribute('volume', '0');
      video.removeAttribute('controls');
    } catch {}

    // ▶️ Intentar reproducir en silencio
    const playVideo = () => {
      video.play().catch(() => {
        // Si el autoplay falla, volvemos a intentar en silencio
        video.muted = true;
        setTimeout(() => video.play().catch(() => {}), 500);
      });
    };

    // Reintenta si el navegador lo pausa
    video.addEventListener('ended', () => {
      video.currentTime = 0;
      playVideo();
    });

    playVideo();
  }
}


  onSubmit(form: NgForm) {
    if (form.invalid) {
      form.control.markAllAsTouched();
      return;
    }

    if (form.value.password !== form.value.confirmPassword) {
      this.errorMessage = 'Las contraseñas no coinciden.';
      return;
    }

    this.errorMessage = null;
    this.isSubmitting = true;

    const request: RegisterRequest = {
      nombre: form.value.nombre,
      email: form.value.email,
      password: form.value.password
    };

    this.authService.register(request).subscribe({
      next: () => {
        this.isSubmitting = false;
        alert('¡Registro exitoso! Ahora serás redirigido al Home.');
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.isSubmitting = false;
        this.errorMessage = err.message;
        console.error(err);
      }
    });
  }
}
