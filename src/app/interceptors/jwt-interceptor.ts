import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth';


export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  
  const authService = inject(AuthService);
  
  // Obtenemos el token desde el signal del servicio de autenticación
  // Esta es la línea CORREGIDA (usa jwtToken() en lugar de currentToken())
  const token = authService.jwtToken(); 

  // Rutas que no necesitan token (login y registro)
  if (req.url.includes('/auth/login') || req.url.includes('/auth/register')) {
    return next(req);
  }

  // Si tenemos token, clonamos la petición y añadimos la cabecera Authorization
  if (token) {
    const clonedReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(clonedReq);
  }

  // Si no hay token, dejamos pasar la petición original (ej. para ver productos)
  return next(req);
};

