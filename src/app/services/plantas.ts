import { Injectable, inject, signal, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Firestore, collection, collectionData, addDoc, Timestamp } from '@angular/fire/firestore';
import { Auth, authState } from '@angular/fire/auth';
import { Planta } from '../models/interfaces';
import { PLANTAS_DATA } from '../data/planta';

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
};

export function diasHastaCosecha(nombre: string): number {
  return DIAS_COSECHA[nombre] ?? 90;
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
@Injectable({ providedIn: 'root' })
export class PlantasService {
  private firestore  = inject(Firestore);
  private auth       = inject(Auth);
  private platformId = inject(PLATFORM_ID);

  readonly catalogo: Planta[] = PLANTAS_DATA;

  private inventarioSignal = signal<Planta[]>([]);
  readonly inventario = this.inventarioSignal.asReadonly();

  private uid: string | null = null;

  constructor() {
    authState(this.auth).subscribe(user => {
      this.uid = user?.uid ?? null;
      if (user) {
        // 1. Carga inmediata desde localStorage
        this.cargarDesdeStorage(user.uid);
        // 2. Sincroniza con Firestore en segundo plano
        this.sincronizarFirestore(user.uid);
      } else {
        this.inventarioSignal.set([]);
      }
    });
  }

  // ── localStorage ─────────────────────────────────────────────────────────
  private storageKey(uid: string) { return `plantas_${uid}`; }

  private cargarDesdeStorage(uid: string) {
    if (!isPlatformBrowser(this.platformId)) return;
    try {
      const raw = localStorage.getItem(this.storageKey(uid));
      if (!raw) return;
      const plantas: Planta[] = JSON.parse(raw).map((p: any) => ({
        ...p,
        f_siembra:  new Date(p.f_siembra),
        f_recogida: new Date(p.f_recogida),
      }));
      this.inventarioSignal.set(plantas);
    } catch { /* localStorage corrupto, ignorar */ }
  }

  private guardarEnStorage(plantas: Planta[]) {
    if (!isPlatformBrowser(this.platformId) || !this.uid) return;
    try {
      localStorage.setItem(this.storageKey(this.uid), JSON.stringify(plantas));
    } catch { /* cuota excedida u otro error */ }
  }

  // ── Firestore (sincronización opcional) ───────────────────────────────────
  private sincronizarFirestore(uid: string) {
    const ref = collection(this.firestore, `usuarios/${uid}/plantas`);
    collectionData(ref, { idField: 'firestoreId' }).subscribe({
      next: (docs: any[]) => {
        if (docs.length === 0) {
          // Firestore vacío — sube las de localStorage si las hay
          this.subirLocalAFirestore(uid);
          return;
        }
        const plantas: Planta[] = docs.map(d => ({
          ...d,
          f_siembra:  d.f_siembra  instanceof Timestamp ? d.f_siembra.toDate()  : new Date(d.f_siembra),
          f_recogida: d.f_recogida instanceof Timestamp ? d.f_recogida.toDate() : new Date(d.f_recogida),
        }));
        this.inventarioSignal.set(plantas);
        this.guardarEnStorage(plantas);
      },
      error: (e) => {
        console.warn('Firestore no disponible, usando localStorage:', e.message);
        // Inventario ya cargado desde localStorage, no hacemos nada
      }
    });
  }

  private async subirLocalAFirestore(uid: string) {
    if (!isPlatformBrowser(this.platformId)) return;
    try {
      const raw = localStorage.getItem(this.storageKey(uid));
      if (!raw) return;
      const plantas: Planta[] = JSON.parse(raw);
      const ref = collection(this.firestore, `usuarios/${uid}/plantas`);
      for (const p of plantas) {
        await addDoc(ref, {
          planta_id:     p.planta_id,
          usuario_id:    uid,
          nombre_planta: p.nombre_planta,
          imagen_url:    p.imagen_url,
          f_siembra:     Timestamp.fromDate(new Date(p.f_siembra)),
          f_recogida:    Timestamp.fromDate(new Date(p.f_recogida)),
          tipo_planta:   p.tipo_planta,
          estado:        p.estado,
          clima:         p.clima ?? null,
        });
      }
    } catch (e) {
      console.warn('No se pudo subir a Firestore:', e);
    }
  }

  // ── API pública ───────────────────────────────────────────────────────────
  async addPlanta(planta: Planta): Promise<void> {
    const nuevaLista = [...this.inventarioSignal(), planta];
    this.inventarioSignal.set(nuevaLista);
    this.guardarEnStorage(nuevaLista);

    if (!this.uid) return;
    try {
      const ref = collection(this.firestore, `usuarios/${this.uid}/plantas`);
      await addDoc(ref, {
        planta_id:     planta.planta_id,
        usuario_id:    this.uid,
        nombre_planta: planta.nombre_planta,
        imagen_url:    planta.imagen_url,
        f_siembra:     Timestamp.fromDate(planta.f_siembra),
        f_recogida:    Timestamp.fromDate(planta.f_recogida),
        tipo_planta:   planta.tipo_planta,
        estado:        planta.estado,
        clima:         planta.clima ?? null,
      });
    } catch (e) {
      console.warn('Planta guardada en local, fallo Firestore:', e);
    }
  }
}
