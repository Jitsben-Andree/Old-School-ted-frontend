import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { provideRouter, Router } from '@angular/router';
import { NavbarComponent } from './navbar';

class AuthServiceMock {
  isLoggedIn() { return false; }
  logout = jasmine.createSpy('logout');
}

class CartServiceMock {
  cart = { set: jasmine.createSpy('set') };
  getMiCarrito() { return of(null); }
  clearCartOnLogout = jasmine.createSpy('clearCartOnLogout'); 
}

describe('Navbar', () => {
  let component: NavbarComponent;
  let fixture: ComponentFixture<NavbarComponent>;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavbarComponent],
      providers: [
        provideRouter([{ path: 'login', component: class Dummy {} }]),
        { provide: (await import('../../services/auth')).AuthService, useClass: AuthServiceMock },
        { provide: (await import('../../services/cart')).CartService, useClass: CartServiceMock },
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

  it('should logout, limpiar carrito y navegar a /login', async () => {
    const auth = TestBed.inject((await import('../../services/auth')).AuthService) as unknown as AuthServiceMock;
    const cart = TestBed.inject((await import('../../services/cart')).CartService) as unknown as CartServiceMock;

    spyOn(window, 'confirm').and.returnValue(true); // ✅ simulamos que el usuario confirma
    const navSpy = spyOn(router, 'navigate').and.resolveTo(true);

    component.logout();

    expect(auth.logout).toHaveBeenCalled();
    expect(cart.clearCartOnLogout).toHaveBeenCalled(); // ✅ corregido
    expect(navSpy).toHaveBeenCalledWith(['/login']);
  });
});
