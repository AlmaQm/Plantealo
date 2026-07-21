import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { RecetasComponent } from './recetas';

describe('RecetasComponent', () => {
  let component: RecetasComponent;
  let fixture: ComponentFixture<RecetasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecetasComponent],
      providers: [provideRouter([]), provideHttpClient()]
    }).compileComponents();

    fixture = TestBed.createComponent(RecetasComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('toggles diet filters independently (free multi-select)', () => {
    component.toggleDieta('VEGETARIANA');
    expect(component.dietasActivas.has('VEGETARIANA')).toBe(true);
    expect(component.dietasActivas.has('VEGANA')).toBe(false);

    component.toggleDieta('VEGANA');
    expect(component.dietasActivas.has('VEGETARIANA')).toBe(true);
    expect(component.dietasActivas.has('VEGANA')).toBe(true);

    component.toggleDieta('VEGETARIANA');
    expect(component.dietasActivas.has('VEGETARIANA')).toBe(false);
    expect(component.dietasActivas.has('VEGANA')).toBe(true);
  });

  it('counts active diet + category filters for the "Filtros" badge', () => {
    expect(component.filtrosActivos()).toBe(0);

    component.toggleDieta('OMNIVORA');
    component.toggleCategoria('POSTRE');
    expect(component.filtrosActivos()).toBe(2);
  });

  it('toggles the collapsible filters panel', () => {
    expect(component.filtrosAbiertos()).toBe(false);
    component.toggleFiltros();
    expect(component.filtrosAbiertos()).toBe(true);
    component.toggleFiltros();
    expect(component.filtrosAbiertos()).toBe(false);
  });
});
