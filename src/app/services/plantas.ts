import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Auth, authState } from '@angular/fire/auth';
import { Planta } from '../models/interfaces';
import { environment } from '../../environments/environment';

// ─── Clasificación por nombre ─────────────────────────────────────────────────
// INTERIOR: hierbas pequeñas que se cultivan habitualmente en maceta dentro de casa
// EXTERIOR: hortalizas y plantas que necesitan sol directo, espacio y suelo profundo
export const TIPO_PLANTA: Record<string, 'INTERIOR' | 'EXTERIOR'> = {
  // ── Hierbas de interior (maceta en ventana o cocina) ──────────────────────
  'Albahaca':         'INTERIOR',
  'Cilantro':         'INTERIOR',
  'Menta':            'INTERIOR',
  'Cebollino':        'INTERIOR',
  'Perejil':          'INTERIOR',
  'Tomillo':          'INTERIOR',
  'Orégano':          'INTERIOR',

  // ── Arbustos mediterráneos → exterior (necesitan sol pleno y espacio) ─────
  'Romero':           'EXTERIOR',

  // ── Tomates (todas las variedades) → exterior ─────────────────────────────
  'Tomates':          'EXTERIOR',
  'Tomates Cherry':   'EXTERIOR',
  'Tomate Ramillete': 'EXTERIOR',
  'Tomate Pera':      'EXTERIOR',

  // ── Hortalizas de fruto → exterior ────────────────────────────────────────
  'Pimientos':        'EXTERIOR',
  'Berenjenas':       'EXTERIOR',
  'Calabacines':      'EXTERIOR',
  'Calabacín':        'EXTERIOR',
  'Pepinos':          'EXTERIOR',
  'Pepino':           'EXTERIOR',
  'Judías verdes':    'EXTERIOR',
  'Judías Verdes':    'EXTERIOR',
  'Fresas':           'EXTERIOR',

  // ── Hortalizas de hoja → exterior ─────────────────────────────────────────
  'Lechugas':         'EXTERIOR',
  'Espinacas':        'EXTERIOR',
  'Acelgas':          'EXTERIOR',
  'Kale':             'EXTERIOR',
  'Rúcula':           'EXTERIOR',

  // ── Raíces y bulbos → exterior ────────────────────────────────────────────
  'Zanahorias':       'EXTERIOR',
  'Zanahoria':        'EXTERIOR',
  'Rábanos':          'EXTERIOR',
  'Remolacha':        'EXTERIOR',
  'Cebollas':         'EXTERIOR',
  'Ajos':             'EXTERIOR',
  'Puerros':          'EXTERIOR',

  // ── Legumbres → exterior ──────────────────────────────────────────────────
  'Guisantes':        'EXTERIOR',
  'Habas':            'EXTERIOR',

  // ── Crucíferas → exterior ─────────────────────────────────────────────────
  'Brócoli':          'EXTERIOR',
  'Coliflor':         'EXTERIOR',
};

export function getTipoPlanta(nombre: string): 'INTERIOR' | 'EXTERIOR' {
  return TIPO_PLANTA[nombre] ?? 'EXTERIOR';
}

// ─── Días desde siembra hasta cosecha por planta ─────────────────────────────
export const DIAS_COSECHA: Record<string, number> = {
  'Rábanos':       25,
  'Rúcula':        30,
  'Albahaca':      40,
  'Cilantro':      40,
  'Espinacas':     45,
  'Lechugas':      50,
  'Kale':          55,
  'Acelgas':       55,
  'Calabacines':   55,
  'Judías verdes': 60,
  'Pepinos':       65,
  'Cebollino':     60,
  'Fresas':        60,
  'Remolacha':     70,
  'Perejil':       70,
  'Menta':         70,
  'Zanahorias':    80,
  'Guisantes':     90,
  'Tomates':       90,
  'Pimientos':     90,
  'Berenjenas':    90,
  'Romero':        90,
  'Tomillo':       90,
  'Orégano':       90,
  'Brócoli':      100,
  'Coliflor':     100,
  'Habas':        120,
  'Puerros':      120,
  'Cebollas':     120,
  'Ajos':         180,

  // ── Alias de nombres tal como aparecen en el catálogo (data/planta.ts) ────
  'Tomates Cherry':   90,
  'Tomate Ramillete': 90,
  'Tomate Pera':      90,
  'Zanahoria':        80,
  'Calabacín':        55,
  'Pepino':           65,
  'Judías Verdes':    60,
};

export function diasHastaCosecha(nombre: string): number {
  return DIAS_COSECHA[nombre] ?? 90;
}

// ─── Frecuencia de riego por planta (días entre riegos) ──────────────────────
// Referencia orientativa para huerto/maceta en clima mediterráneo sin lluvia.
export const DIAS_RIEGO: Record<string, number> = {
  'Rábanos':       2,
  'Rúcula':        2,
  'Albahaca':      2,
  'Cilantro':      2,
  'Espinacas':     2,
  'Lechugas':      2,
  'Kale':          3,
  'Acelgas':       3,
  'Calabacines':   2,
  'Judías verdes': 3,
  'Pepinos':       2,
  'Cebollino':     3,
  'Fresas':        2,
  'Remolacha':     3,
  'Perejil':       3,
  'Menta':         2,
  'Zanahorias':    4,
  'Guisantes':     4,
  'Tomates':       3,
  'Pimientos':     3,
  'Berenjenas':    3,
  'Romero':        7,
  'Tomillo':       7,
  'Orégano':       6,
  'Brócoli':       3,
  'Coliflor':      3,
  'Habas':         5,
  'Puerros':       4,
  'Cebollas':      5,
  'Ajos':          6,

  // ── Alias de nombres tal como aparecen en el catálogo (data/planta.ts) ────
  'Tomates Cherry':   3,
  'Tomate Ramillete': 3,
  'Tomate Pera':      3,
  'Zanahoria':        4,
  'Calabacín':        2,
  'Pepino':           2,
  'Judías Verdes':    3,
};

export function diasEntreRiegos(nombre: string): number {
  return DIAS_RIEGO[nombre] ?? 3;
}

// ─── Próximo riego según días transcurridos desde la siembra ─────────────────
export function diasHastaProximoRiego(planta: Planta): number {
  const intervalo = diasEntreRiegos(planta.nombre_planta);
  const transcurridos = Math.floor((Date.now() - new Date(planta.f_siembra).getTime()) / 86_400_000);
  if (transcurridos <= 0) return intervalo;
  const resto = transcurridos % intervalo;
  return resto === 0 ? 0 : intervalo - resto;
}

// ─── Estado calculado según fechas reales ────────────────────────────────────
export function calcularEstado(planta: Planta): Planta['estado'] {
  if (planta.estado === 'ENFERMA') return 'ENFERMA';
  const hoy     = Date.now();
  const siembra = new Date(planta.f_siembra).getTime();
  const cosecha = new Date(planta.f_recogida).getTime();
  const total   = cosecha - siembra;
  if (total <= 0) return 'LISTA';
  const pct = (hoy - siembra) / total;
  if (pct >= 0.85) return 'LISTA';
  if (pct >= 0.20) return 'CRECIENDO';
  return 'PLANTADA';
}

export function diasRestantes(planta: Planta): number {
  return Math.ceil((new Date(planta.f_recogida).getTime() - Date.now()) / 86_400_000);
}

// ─── Servicio ─────────────────────────────────────────────────────────────────
// ─── Tipos de la API (Aiven) ──────────────────────────────────────────────────
interface PlantaCatAiven {
  planta_id: number;
  nombre_planta: string;
  tipo_planta: string;
  freq_riego: number;
  imagen_url: string | null;
  clima: string | null;
}

interface PUsuarioDetallAiven {
  planta_id: number;
  usuario_id: number;
  f_siembra: string;
  f_recogida: string | null;
  estado_crecimiento: string;
  nombre_planta: string;
  tipo_planta: string;
  freq_riego: number;
  imagen_url: string | null;
  clima: string | null;
  caracteristicas: string | null;
}

@Injectable({ providedIn: 'root' })
export class PlantasService {
  private http = inject(HttpClient);
  private auth = inject(Auth);

  // Catálogo (GET /plantas/)
  private catalogoSignal = signal<PlantaCatAiven[]>([]);
  readonly catalogo = this.catalogoSignal.asReadonly();

  // Inventario del usuario (GET /usuarios/by-uid/{uid}/plantas/)
  private inventarioSignal = signal<Planta[]>([]);
  readonly inventario = this.inventarioSignal.asReadonly();

  private uid: string | null = null;

  constructor() {
    authState(this.auth).subscribe(user => {
      this.uid = user?.uid ?? null;
      if (user) {
        this.cargarCatalogo();
        this.cargarInventario(user.uid);
      } else {
        this.inventarioSignal.set([]);
        this.catalogoSignal.set([]);
      }
    });
  }

  // ── Catálogo ──────────────────────────────────────────────────────────────
  async cargarCatalogo(): Promise<void> {
    try {
      const data = await firstValueFrom(
        this.http.get<PlantaCatAiven[]>(`${environment.apiUrl}/plantas/`)
      );
      this.catalogoSignal.set(data ?? []);
    } catch {
      this.catalogoSignal.set([]);
    }
  }

  // ── Inventario ────────────────────────────────────────────────────────────
  async cargarInventario(uid: string): Promise<void> {
    try {
      const data = await firstValueFrom(
        this.http.get<PUsuarioDetallAiven[]>(
          `${environment.apiUrl}/usuarios/by-uid/${uid}/plantas/`
        )
      );
      this.inventarioSignal.set((data ?? []).map(d => this.mapPlanta(d)));
    } catch {
      this.inventarioSignal.set([]);
    }
  }

  // ── API pública ───────────────────────────────────────────────────────────
  async addPlanta(planta: Planta): Promise<void> {
    if (!this.uid) return;
    await firstValueFrom(
      this.http.post(
        `${environment.apiUrl}/usuarios/by-uid/${this.uid}/plantas/`,
        {
          planta_id: planta.planta_id,
          f_siembra: this.toISO(planta.f_siembra),
          f_recogida: this.toISO(planta.f_recogida),
          estado_crecimiento: planta.estado === 'ENFERMA' ? 'CRECIENDO' : planta.estado,
        }
      )
    );
    await this.cargarInventario(this.uid);
  }

  // ── Mapeo backend (PUsuarioDetall) → Planta ─────────────────────────────────
  private mapPlanta(d: PUsuarioDetallAiven): Planta {
    const f_siembra = new Date(d.f_siembra);
    const f_recogida = d.f_recogida
      ? new Date(d.f_recogida)
      : this.calcularRecogida(f_siembra, d.nombre_planta);

    return {
      planta_id:     d.planta_id,
      usuario_id:    0,
      nombre_planta: d.nombre_planta,
      imagen_url:    d.imagen_url ?? 'assets/images/placeholder.jpg',
      f_siembra,
      f_recogida,
      tipo_planta:   this.mapTipoPlanta(d.tipo_planta),
      estado:        this.mapEstado(d.estado_crecimiento),
      clima:         d.clima ?? undefined,
    };
  }

  private mapTipoPlanta(t: string): Planta['tipo_planta'] {
    switch (t) {
      case 'INTERIOR': return 'INTERIOR';
      case 'EXTERIOR': return 'EXTERIOR';
      case 'HUERTO':   return 'EXTERIOR';
      default:         return 'EXTERIOR';
    }
  }

  private mapEstado(e: string): Planta['estado'] {
    switch (e) {
      case 'PLANTADA':  return 'PLANTADA';
      case 'CRECIENDO': return 'CRECIENDO';
      case 'LISTA':     return 'LISTA';
      default:          return 'CRECIENDO';
    }
  }

  private calcularRecogida(f_siembra: Date, nombre: string): Date {
    const d = new Date(f_siembra);
    d.setDate(d.getDate() + diasHastaCosecha(nombre));
    return d;
  }

  // 'YYYY-MM-DD' en hora local
  private toISO(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }
}
