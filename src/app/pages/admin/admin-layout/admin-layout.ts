import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router'; // 1. Importar RouterOutlet y Links
import { AuthService } from '../../../services/auth';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  // 2. Añadir los imports
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive], 
  templateUrl: './admin-layout.html',
  styleUrls: ['./admin-layout.css']
})
export class AdminLayoutComponent {
  // 3. Inyectar AuthService para el saludo
  public authService = inject(AuthService);
}
