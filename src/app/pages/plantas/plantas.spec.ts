import { TestBed } from '@angular/core/testing';
import { PlantasService } from './plantas'; // Asegúrate que el nombre del archivo coincida

<<<<<<< HEAD
import { PlantasComponent } from './plantas';

describe('PlantasComponent', () => {
  let component: PlantasComponent;
  let fixture: ComponentFixture<PlantasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlantasComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PlantasComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
=======
describe('PlantasService', () => {
  let service: PlantasService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      // Si en el futuro tu servicio usa HttpClient, aquí deberás añadir:
      // imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(PlantasService);
>>>>>>> 3e8d2528ee7f5601fb657dcbe2b467048331e369
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});