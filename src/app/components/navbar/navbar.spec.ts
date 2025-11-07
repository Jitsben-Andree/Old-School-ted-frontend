import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { provideRouter, Router } from '@angular/router';

import { Navbar } from './navbar';

// ====== Mocks de servicios ======
class AuthServiceMock {
  isLoggedIn() { return false; }          // evita que llame getMiCarrito() en el constructor
  logout = jasmine.createSpy('logout');
}

class CartServiceMock {
  cart = { set: jasmine.createSpy('set') }; // el componente hace cart.set(null)
  getMiCarrito() { return of(null); }       // por si en algún momento lo llama
}

describe('Navbar', () => {
  let component: Navbar;
  let fixture: ComponentFixture<Navbar>;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Navbar], // componente standalone
      providers: [
        provideRouter([{ path: 'login', component: class Dummy {} }]),
        { provide: (await import('../../services/auth')).AuthService, useClass: AuthServiceMock },
        { provide: (await import('../../services/cart')).CartService, useClass: CartServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Navbar);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should logout, limpiar carrito y navegar a /login', async () => {
    const auth = TestBed.inject((await import('../../services/auth')).AuthService) as unknown as AuthServiceMock;
    const cart = TestBed.inject((await import('../../services/cart')).CartService) as unknown as CartServiceMock;

    const navSpy = spyOn(router, 'navigate').and.resolveTo(true);

    component.logout();

    expect(auth.logout).toHaveBeenCalled();
    expect(cart.cart.set).toHaveBeenCalledWith(null);
    expect(navSpy).toHaveBeenCalledWith(['/login']);
  });
});
