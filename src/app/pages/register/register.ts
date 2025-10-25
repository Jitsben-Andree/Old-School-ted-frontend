import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms'; // Importar FormsModule
import { Router, RouterLink } from '@angular/router'; // Importar RouterLink
import { AuthService } from '../../services/auth';
import { RegisterRequest } from '../../models/register-request';

@Component({
  selector: 'app-register',
  standalone: true,
  // 1. Añadir CommonModule, FormsModule y RouterLink
  imports: [CommonModule, FormsModule, RouterLink], 
  templateUrl: './register.html',
  styleUrls: ['./register.css']
})
export class RegisterComponent {
  // Inyectamos servicios
  private authService = inject(AuthService);
  private router = inject(Router);
  
  public errorMessage: string | null = null;
  public isSubmitting = false;

  onSubmit(form: NgForm) {
    // Validar formulario
    if (form.invalid) {
      form.control.markAllAsTouched();
      return;
    }

    // Validar que las contraseñas coincidan
    if (form.value.password !== form.value.confirmPassword) {
      this.errorMessage = "Las contraseñas no coinciden.";
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
        // Éxito
        this.isSubmitting = false;
        alert('¡Registro exitoso! Ahora serás redirigido al Home.');
        this.router.navigate(['/']); // Redirigir al Home
      },
      error: (err) => {
        // Error
        this.isSubmitting = false;
        this.errorMessage = err.message; // Mostrar error (ej. "El email ya está en uso")
        console.error(err);
      }
    });
  }
}
