import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { Navbar } from './navbar';

describe('Navbar', () => {
  let component: Navbar;
  let fixture: ComponentFixture<Navbar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Navbar],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(Navbar);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render 4 navigation links', () => {
    const links = fixture.debugElement.queryAll(By.css('a'));
    expect(links.length).toBe(4);
  });

  it('should include a link to /recetas', () => {
    const links = fixture.debugElement.queryAll(By.css('a'));
    const hrefs = links.map(l => l.nativeElement.getAttribute('href'));
    expect(hrefs).toContain('/recetas');
  });

  it('should include links to /inicio, /plantas, /comunidad', () => {
    const links = fixture.debugElement.queryAll(By.css('a'));
    const hrefs = links.map(l => l.nativeElement.getAttribute('href'));
    expect(hrefs).toContain('/inicio');
    expect(hrefs).toContain('/plantas');
    expect(hrefs).toContain('/comunidad');
  });

  it('should render 4 labels', () => {
    const labels = fixture.debugElement.queryAll(By.css('.label'));
    expect(labels.length).toBe(4);
    const texts = labels.map(l => l.nativeElement.textContent.trim());
    expect(texts).toContain('Inicio');
    expect(texts).toContain('Plantas');
    expect(texts).toContain('Recetas');
    expect(texts).toContain('Comunidad');
  });

  it('should render 4 icon wrappers', () => {
    const wrappers = fixture.debugElement.queryAll(By.css('.icon-wrap'));
    expect(wrappers.length).toBe(4);
  });
});
