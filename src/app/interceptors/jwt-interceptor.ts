import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth';

/**
 * Interceptor funcional (moderno) para adjuntar el token JWT
 */
export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  
  // Inyecta el servicio de autenticación
  const authService = inject(AuthService);
  
  // Obtiene el token actual usando el signal computado
  const token = authService.currentToken(); 

  // Rutas que NO necesitan token
  const isAuthRoute = req.url.includes('/api/v1/auth');

  // Si tenemos token y NO es una ruta de autenticación
  if (token && !isAuthRoute) {
    // Clona la petición y añade la cabecera 'Authorization'
    const clonedReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    // Continúa con la petición clonada
    return next(clonedReq);
  }

  // Si no hay token o es una ruta de auth, deja pasar la petición original
  return next(req);
};