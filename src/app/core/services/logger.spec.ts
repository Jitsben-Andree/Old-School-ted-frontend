import { TestBed } from '@angular/core/testing';
import { LoggerService } from './logger';

describe('LoggerService', () => {
  let service: LoggerService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [LoggerService]
    });

    service = TestBed.inject(LoggerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // Opcional: probar que no revienta al llamar a log()
  it('should call log without errors', () => {
    service.log('Mensaje de prueba', { foo: 'bar' });
  });
});
