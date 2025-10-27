import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface LinkItem { label: string; url: string; external?: boolean; }

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './footer.html',
  styleUrls: ['./footer.css'],
})
export class FooterComponent {
  year = new Date().getFullYear();

  helpLinks: LinkItem[] = [
    { label: 'Centro de ayuda', url: '/ayuda' },
    { label: 'Cuidado de tus camisetas', url: '/cuidado' },
    { label: 'Promociones y legales', url: '/promociones' },
    { label: 'Opciones de pago', url: '/pagos' },
    { label: 'Tipos de envío', url: '/envios' },
    { label: 'Cambios, devoluciones y garantías', url: '/devoluciones' },
    { label: 'Política de privacidad', url: '/privacidad' },
    { label: 'Términos y condiciones', url: '/terminos' },
    { label: 'Preguntas frecuentes', url: '/faq' },
    { label: 'Guía de tallas', url: '/tallas' },
  ];

  aboutLinks: LinkItem[] = [
    { label: 'Trabaja con nosotros', url: '/trabaja' },
    { label: 'Acerca de OldSchoolTed', url: '/acerca' },
    { label: 'Noticias corporativas', url: '/noticias' },
    { label: 'Sustentabilidad', url: '/sustentabilidad' },
    { label: 'Buscador de tiendas', url: '/tiendas' },
    { label: 'Libro de reclamaciones', url: '/libro' },
  ];

  onSubscribe(email: string) {
    // Aquí podrías integrar tu servicio real de newsletter
    console.log('Suscripción footer:', email);
    alert('¡Gracias por suscribirte! 😄');
  }
}
