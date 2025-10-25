import { Routes } from '@angular/router';

// Guards
import { authGuard } from './guards/auth-guard';
import { adminGuard } from './guards/admin-guard';

// --- COMPONENTES PÚBLICOS ---
import { HomeComponent } from './pages/home/home';
import { LoginComponent } from './pages/login/login';
import { RegisterComponent } from './pages/register/register';

// --- COMPONENTES DE CLIENTE (Protegidos) ---
import { CartComponent } from './pages/cart/cart';
import { CheckoutComponent } from './pages/checkout/checkout';
import { MyOrdersComponent } from './pages/my-orders/my-orders';

// --- COMPONENTES DE ADMIN (Protegidos) ---
import { AdminLayoutComponent } from './pages/admin/admin-layout/admin-layout';
import { AdminProductsComponent } from './pages/admin/admin-products/admin-products';
import { AdminProductFormComponent } from './pages/admin/admin-product-form/admin-product-form';
import { AdminInventoryComponent } from './pages/admin/admin-inventory/admin-inventory';
import { AdminPedidosComponent } from './pages/admin/admin-pedidos/admin-pedidos';
import { AdminCategoriasComponent } from './pages/admin/admin-categorias/admin-categorias';
import { AdminProveedoresComponent } from './pages/admin/admin-proveedores/admin-proveedores';
import { AdminPromocionesComponent } from './pages/admin/admin-promociones/admin-promociones';
import { AdminAsignacionesComponent } from './pages/admin/admin-asignaciones/admin-asignaciones';

export const routes: Routes = [
  // --- RUTAS PÚBLICAS ---
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  // --- RUTAS DE CLIENTE (Protegidas por authGuard) ---
  { path: 'cart', component: CartComponent, canActivate: [authGuard] },
  { path: 'checkout', component: CheckoutComponent, canActivate: [authGuard] },
  { path: 'mis-pedidos', component: MyOrdersComponent, canActivate: [authGuard] },

  // --- RUTAS DE ADMINISTRADOR (Protegidas por adminGuard) ---
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [adminGuard], // Protege el layout principal
    children: [
      // Redirige /admin a /admin/products
      { path: '', redirectTo: 'products', pathMatch: 'full' },
      
      // Gestión de Productos
      { path: 'products', component: AdminProductsComponent },
      { path: 'products/new', component: AdminProductFormComponent }, // Crear
      { path: 'products/edit/:id', component: AdminProductFormComponent }, // Editar
      
      // Gestión de Inventario
      { path: 'inventory', component: AdminInventoryComponent },
      
      // Gestión de Pedidos
      { path: 'pedidos', component: AdminPedidosComponent },
      
      // Gestión de Categorías
      { path: 'categorias', component: AdminCategoriasComponent },
      
      // Gestión de Proveedores
      { path: 'proveedores', component: AdminProveedoresComponent },
      
      // Gestión de Promociones
      { path: 'promociones', component: AdminPromocionesComponent },
      
      // Gestión de Asignaciones
      { path: 'asignaciones', component: AdminAsignacionesComponent }
    ]
  },

  // --- RUTA COMODÍN (Al final) ---
  // Redirige cualquier ruta desconocida al Home
  { path: '**', redirectTo: '' }
];

