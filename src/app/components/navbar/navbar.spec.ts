import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

import { NavbarComponent } from './navbar';
import { AuthService } from '../../services/auth';
import { CartService } from '../../services/cart';

class AuthServiceMock {
  isLoggedIn() { return false; }
  logout = jasmine.createSpy('logout');
}

class CartServiceMock {
  // ✅ simulamos un signal: función que devuelve array, y además tiene .set()
  cart: any;

  constructor() {
    const fn: any = jasmine.createSpy('cart').and.returnValue([]); // cart()
    fn.set = jasmine.createSpy('set');                             // cart.set(...)
    this.cart = fn;
  }

  getMiCarrito() {
    return of(null);
  }

  clearCartOnLogout = jasmine.createSpy('clearCartOnLogout');
}

describe('Navbar', () => {
  let component: NavbarComponent;
  let fixture: ComponentFixture<NavbarComponent>;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        NavbarComponent,
        RouterTestingModule.withRoutes([
          { path: 'login', component: class DummyComponent {} }
        ])
      ],
      providers: [
        { provide: AuthService, useClass: AuthServiceMock },
        { provide: CartService, useClass: CartServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(NavbarComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should logout, limpiar carrito y navegar a /login', () => {
    const auth = TestBed.inject(AuthService) as unknown as AuthServiceMock;
    const cart = TestBed.inject(CartService) as unknown as CartServiceMock;

    spyOn(window, 'confirm').and.returnValue(true); // simulamos que el usuario confirma
    const navSpy = spyOn(router, 'navigate').and.resolveTo(true);

    component.logout();

    expect(auth.logout).toHaveBeenCalled();
    expect(cart.clearCartOnLogout).toHaveBeenCalled();
    expect(navSpy).toHaveBeenCalledWith(['/login']);
  });
});
