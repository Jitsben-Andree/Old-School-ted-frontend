import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { ProductService } from './product'; // ⬅️ asegúrate del nombre/ruta real

describe('ProductService', () => {
  let service: ProductService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(ProductService);
  });

  it('debe crearse el servicio ProductService', () => {
    expect(service).toBeTruthy();
  });

  // Según tu HomeComponent, existe getAllProductosActivos()
  it('debe exponer el método getAllProductosActivos', () => {
    expect(typeof (service as any).getAllProductosActivos).toBe('function');
  });

  /* 
   * (Opcional avanzado) Si quieres testear la petición HTTP real,
   * descomenta y reemplaza 'TU_ENDPOINT' cuando tengas la URL exacta.
   *
   * import { HttpTestingController } from '@angular/common/http/testing';
   *
   * it('debe llamar al endpoint de productos activos', () => {
   *   const httpMock = TestBed.inject(HttpTestingController);
   *   let respuesta: any[] | undefined;
   *
   *   service.getAllProductosActivos().subscribe(r => (respuesta = r));
   *
   *   const req = httpMock.expectOne((req) => req.url.includes('TU_ENDPOINT'));
   *   expect(req.request.method).toBe('GET');
   *   req.flush([{ id: 1, nombre: 'Camiseta Retro' }]);
   *
   *   expect(respuesta).toBeDefined();
   *   expect(respuesta!.length).toBeGreaterThan(0);
   *   httpMock.verify();
   * });
   */
});
