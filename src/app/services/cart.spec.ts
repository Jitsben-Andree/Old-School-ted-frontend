import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { CartService } from './cart'; // ⬅️ asegúrate del nombre/ruta real

describe('CartService', () => {
  let service: CartService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(CartService);
  });

  it('debe crearse el servicio CartService', () => {
    expect(service).toBeTruthy();
  });

  // Basado en tu HomeComponent, existe addItem(productId, cantidad)
  it('debe exponer el método addItem', () => {
    expect(typeof (service as any).addItem).toBe('function');
  });

  // Si tu servicio expone un "cart()" o signal equivalente, lo validamos suavemente
  it('debe exponer un método/propiedad para leer el carrito si existe (opcional)', () => {
    const hasCartReader =
      typeof (service as any).cart === 'function' ||
      typeof (service as any).cartSig === 'function' ||
      typeof (service as any).cartSig === 'object';

    expect(hasCartReader).toBeTrue(); // cambia a .toBeDefined() si prefieres menos estricto
  });
});
