import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms'; // ¡Importante!
import { Router, RouterLink } from '@angular/router'; // ¡Importante!
import { AuthService } from '../../services/auth';
import { LoginRequest } from '../../models/login-request';

@Component({
  selector: 'app-login',
  standalone: true,
  // 1. Añadimos CommonModule, FormsModule y RouterLink
  imports: [CommonModule, FormsModule, RouterLink], 
  // 2. Apuntamos a los archivos separados
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {
  // Inyectamos servicios
  private authService = inject(AuthService);
  private router = inject(Router);
  
  public errorMessage: string | null = null;
  public isSubmitting = false;

  onSubmit(form: NgForm) {
    // Validar formulario
    if (form.invalid) {
      form.control.markAllAsTouched(); // Marcar todos los campos como "tocados"
      return;
    }
    
    this.errorMessage = null;
    this.isSubmitting = true; // Empezar a cargar
    const request: LoginRequest = form.value;

    this.authService.login(request).subscribe({
      next: () => {
        // Éxito
        this.isSubmitting = false;
        this.router.navigate(['/']); // Redirigir al Home
      },
      error: (err) => {
        // Error
        this.isSubmitting = false;
        this.errorMessage = err.message; // Mostrar error (ej. "Credenciales incorrectas")
        console.error(err);
      }
    });
  }
}

