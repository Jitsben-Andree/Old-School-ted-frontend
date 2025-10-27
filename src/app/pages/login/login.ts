import { Component, inject, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';
import { LoginRequest } from '../../models/login-request';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent implements AfterViewInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  @ViewChild('bgVideo', { static: true }) bgVideo!: ElementRef<HTMLVideoElement>;

  public errorMessage: string | null = null;
  public isSubmitting = false;

  ngAfterViewInit(): void {
  const video = this.bgVideo?.nativeElement;
  if (!video) return;

  // Silencio absoluto antes de cualquier reproducción
  video.muted = true;
  video.defaultMuted = true;
  video.volume = 0;
  video.removeAttribute('controls');

  // Candado: si el navegador cambia volumen o mute, lo revertimos
  const lockSilence = () => {
    if (!video.muted) video.muted = true;
    if (video.volume !== 0) video.volume = 0;
  };
  video.addEventListener('volumechange', lockSilence);
  video.addEventListener('loadedmetadata', lockSilence);
  video.addEventListener('play', lockSilence);

  // iOS/Android: asegurar inline + muted
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

  video.addEventListener('ended', () => {
    video.currentTime = 0;
    playVideo();
  });

  playVideo();
}

  onSubmit(form: NgForm) {
    if (form.invalid) {
      form.control.markAllAsTouched();
      return;
    }

    this.errorMessage = null;
    this.isSubmitting = true;
    const request: LoginRequest = form.value;

    this.authService.login(request).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.router.navigate(['/']); // Home
      },
      error: (err) => {
        this.isSubmitting = false;
        this.errorMessage = err.message;
        console.error(err);
      }
    });
  }
}
