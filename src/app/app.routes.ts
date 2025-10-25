import { Routes } from '@angular/router';
import { authGuard } from './guards/auth-guard'; // Importamos el guard

// 1. Importar los componentes de página
import { HomeComponent } from './pages/home/home';
import { LoginComponent } from './pages/login/login';
import { RegisterComponent } from './pages/register/register';

// (Deberás crear estos componentes más adelante)

 import { CartComponent } from './pages/cart/cart';

export const routes: Routes = [
  // --- Rutas Públicas ---
  { 
    path: '', 
    component: HomeComponent 
  },
  { 
    path: 'login', 
    component: LoginComponent 
  },
   { 
     path: 'register', 
     component: RegisterComponent 
  },
   //{ 
   // path: 'producto/:id', 
   // component: ProductDetailComponent // (Página de detalle de producto)
  //},

  // --- Rutas Protegidas ---
   { 
     path: 'cart', 
     component: CartComponent, 
     canActivate: [authGuard] // ¡Esta ruta está protegida!
  },

  // --- Redirección ---
  // Si la ruta no existe, redirige al Home
  { 
    path: '**', 
    redirectTo: '', 
    pathMatch: 'full' 
  }
];
