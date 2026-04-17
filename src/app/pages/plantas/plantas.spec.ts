import { TestBed } from '@angular/core/testing';
import { PlantasService } from './plantas'; // Asegúrate que el nombre del archivo coincida

describe('PlantasService', () => {
  let service: PlantasService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      // Si en el futuro tu servicio usa HttpClient, aquí deberás añadir:
      // imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(PlantasService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});