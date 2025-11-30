import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { CatalogoComponent } from './catalogo';
// si necesitas directamente el servicio, por ejemplo para más tests:
// import { ProductService } from '../../services/product';

describe('CatalogoComponent', () => {
  let component: CatalogoComponent;
  let fixture: ComponentFixture<CatalogoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CatalogoComponent,      // standalone
        HttpClientTestingModule, // 💥 para HttpClient en ProductService
        RouterTestingModule      // por si Catalogo usa Router/ActivatedRoute
      ],
      // SOLO si ProductService NO tiene providedIn: 'root'
      // providers: [ProductService]
    }).compileComponents();

    fixture = TestBed.createComponent(CatalogoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
