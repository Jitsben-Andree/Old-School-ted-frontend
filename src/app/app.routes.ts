import { Routes } from '@angular/router';
import { authGuard } from './guards/auth-guard'; // Importamos el guard

// 1. Importar los componentes de página
import { HomeComponent } from './pages/home/home';
import { LoginComponent } from './pages/login/login';
import { RegisterComponent } from './pages/register/register';

// (Deberás crear estos componentes más adelante)

import { AdminLayoutComponent } from './pages/admin/admin-layout/admin-layout';
import { AdminProductsComponent } from './pages/admin/admin-products/admin-products';
import { AdminProductFormComponent } from './pages/admin/admin-product-form/admin-product-form'; // 1. IMPORTAR


 import { CartComponent } from './pages/cart/cart';
import { adminGuard } from './guards/admin-guard';

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
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [authGuard, adminGuard],
    children: [
      { path: '', redirectTo: 'products', pathMatch: 'full' },
      { path: 'products', component: AdminProductsComponent },
      // 2. AÑADIR RUTA PARA CREAR
      { path: 'products/new', component: AdminProductFormComponent },
      // 3. AÑADIR RUTA PARA EDITAR
      { path: 'products/edit/:id', component: AdminProductFormComponent }
      // { path: 'orders', component: AdminOrdersComponent }, // (Próximamente)
      // { path: 'inventory', component: AdminInventoryComponent }, // (Próximamente)
    ]
  },

  // --- Redirección ---
  // Si la ruta no existe, redirige al Home
  { 
    path: '**', 
    redirectTo: '', 
    pathMatch: 'full' 
  }
];
