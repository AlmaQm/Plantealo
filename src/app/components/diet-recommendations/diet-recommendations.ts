import { Component, OnInit, ViewChild, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonModal } from '@ionic/angular/standalone';
import { switchMap } from 'rxjs';
import { PlantasService, diasHastaCosecha, getTipoPlanta } from '../../services/plantas';
import { AuthService } from '../../services/auth';
import { RecetasService } from '../../services/recetas.service';
import { RecetaCardComponent } from '../../shared/components/receta-card/receta-card';
import { RecetaWindowComponent } from '../../shared/components/receta-window/receta-window';
import { Planta as PlantaHuerto, RecetaHuerto } from '../../models/interfaces';
import { LucideIcon, LucideDynamicIcon, LucideSnowflake, LucideFlower2, LucideSun, LucideLeaf, LucideSprout, LucideCalendarDays, LucideCheck } from '@lucide/angular';

interface Planta {
  nombre: string;
  imagen: string;
  consejo: string;
}

const IMG = (f: string) => `/assets/images/${f}`;

const CALENDARIO: Record<number, Planta[]> = {
  1: [
    { nombre: 'Habas',       imagen: IMG('guisantes.jpg'),                    consejo: 'Siembra directa, aguantan heladas suaves'              },
    { nombre: 'Guisantes',   imagen: IMG('guisantes.jpg'),                    consejo: 'Necesitan tutor, suelo húmedo y fresco'                },
    { nombre: 'Ajos',        imagen: IMG('salterado-judias-ajo-perejil.jpg'), consejo: 'Última oportunidad, planta los dientes a 10 cm'        },
    { nombre: 'Espinacas',   imagen: IMG('espinacas.jpg'),                    consejo: 'Solo en interior o invernadero este mes'               },
    { nombre: 'Lechugas',    imagen: IMG('lechuga.jpg'),                      consejo: 'Semillero interior, trasplanta en marzo'               },
    { nombre: 'Cebollas',    imagen: IMG('cebollino.jpg'),                    consejo: 'Semillero interior para trasplantar en abril'          },
  ],
  2: [
    { nombre: 'Tomates',     imagen: IMG('tomate-cherry.jpg'),                consejo: 'Inicia en semillero interior con calor de fondo'       },
    { nombre: 'Pimientos',   imagen: IMG('pimientos.jpg'),                    consejo: 'Semillero interior a 25°C, germinan en 2 semanas'      },
    { nombre: 'Berenjenas',  imagen: IMG('berenjenasç.jpg'),                  consejo: 'Semillero interior, necesitan bastante calor'          },
    { nombre: 'Lechugas',    imagen: IMG('lechuga.jpg'),                      consejo: 'Siembra directa en zona templada sin heladas'          },
    { nombre: 'Zanahorias',  imagen: IMG('zanahoria.jpg'),                    consejo: 'Suelo suelto y profundo, siembra directa'              },
    { nombre: 'Rábanos',     imagen: IMG('rabanos.jpg'),                      consejo: 'Crecen en 3-4 semanas, perfectos para impacientes'     },
    { nombre: 'Guisantes',   imagen: IMG('guisantes.jpg'),                    consejo: 'Última oportunidad de siembra de invierno'             },
    { nombre: 'Habas',       imagen: IMG('guisantes.jpg'),                    consejo: 'Última siembra antes de la primavera'                  },
    { nombre: 'Fresas',      imagen: IMG('fresas.jpg'),                       consejo: 'Trasplanta plantones, primera cosecha en mayo'         },
    { nombre: 'Espinacas',   imagen: IMG('espinacas.jpg'),                    consejo: 'Siembra directa si no hay riesgo de heladas'           },
    { nombre: 'Puerros',     imagen: IMG('cebollino.jpg'),                    consejo: 'Semillero interior, trasplanta en abril-mayo'          },
    { nombre: 'Cebollas',    imagen: IMG('cebollino.jpg'),                    consejo: 'Semillero para trasplantar cuando vengan los calores'  },
  ],
  3: [
    { nombre: 'Tomates',     imagen: IMG('tomate-cherry.jpg'),                consejo: 'Semillero, trasplanta cuando pasen las heladas'        },
    { nombre: 'Pimientos',   imagen: IMG('pimientos.jpg'),                    consejo: 'Semillero interior, trasplanta en mayo'                },
    { nombre: 'Berenjenas',  imagen: IMG('berenjenasç.jpg'),                  consejo: 'Semillero interior, necesitan 20°C mínimo'             },
    { nombre: 'Lechugas',    imagen: IMG('lechuga.jpg'),                      consejo: 'Siembra directa, cosecha en 6 semanas'                 },
    { nombre: 'Zanahorias',  imagen: IMG('zanahoria.jpg'),                    consejo: 'Siembra directa, aclara a 5 cm al germinar'            },
    { nombre: 'Remolacha',   imagen: IMG('acelga-zanahoria.jpg'),             consejo: 'Tolera el frío, riega regularmente'                    },
    { nombre: 'Rábanos',     imagen: IMG('rabanos.jpg'),                      consejo: 'Primera siembra de primavera, cosecha muy rápida'      },
    { nombre: 'Rúcula',      imagen: IMG('rucula.jpg'),                       consejo: 'Siembra directa en suelo húmedo, crece rápido'         },
    { nombre: 'Perejil',     imagen: IMG('peregil.jpg'),                      consejo: 'Germina lento (3 semanas), mantén húmedo'              },
    { nombre: 'Cilantro',    imagen: IMG('cilantro.jpg'),                     consejo: 'Siembra directa, no le gusta el trasplante'            },
    { nombre: 'Menta',       imagen: IMG('menta.jpg'),                        consejo: 'Propaga por esquejes en maceta, es invasiva'           },
    { nombre: 'Romero',      imagen: IMG('romero.jpg'),                       consejo: 'Trasplanta esqueje o siembra directa al sol'           },
    { nombre: 'Fresas',      imagen: IMG('fresas.jpg'),                       consejo: 'Última oportunidad de trasplante para esta temporada'  },
    { nombre: 'Puerros',     imagen: IMG('cebollino.jpg'),                    consejo: 'Semillero, trasplanta en mayo cuando tengan 15 cm'     },
  ],
  4: [
    { nombre: 'Tomates',     imagen: IMG('tomate-cherry.jpg'),                consejo: 'Trasplanta en zonas sin riesgo de heladas'             },
    { nombre: 'Pepinos',     imagen: IMG('pepino.jpg'),                       consejo: 'Semillero interior, necesitan calor para germinar'     },
    { nombre: 'Calabacines', imagen: IMG('calabacin.jpg'),                    consejo: 'Semillero, crece muy rápido una vez establecido'       },
    { nombre: 'Judías verdes',imagen: IMG('judias-verdes.jpg'),               consejo: 'Siembra directa, primera cosecha en 60 días'           },
    { nombre: 'Albahaca',    imagen: IMG('albahaca.jpg'),                     consejo: 'Semillero interior, planta junto a los tomates'        },
    { nombre: 'Rúcula',      imagen: IMG('rucula.jpg'),                       consejo: 'Segunda siembra de primavera, crece en 4 semanas'      },
    { nombre: 'Zanahorias',  imagen: IMG('zanahoria.jpg'),                    consejo: 'Segunda siembra, buena cosecha en julio'               },
    { nombre: 'Remolacha',   imagen: IMG('acelga-zanahoria.jpg'),             consejo: 'Siembra directa, raíces en 70 días'                    },
    { nombre: 'Perejil',     imagen: IMG('peregil.jpg'),                      consejo: 'Siembra directa al sol, riega con frecuencia'          },
    { nombre: 'Cilantro',    imagen: IMG('cilantro.jpg'),                     consejo: 'Siembra directa, evita moverlo una vez plantado'       },
    { nombre: 'Tomillo',     imagen: IMG('tomillo.jpg'),                      consejo: 'Trasplante o esqueje, prefiere sol y suelo seco'        },
    { nombre: 'Orégano',     imagen: IMG('oregano.jpg'),                      consejo: 'Trasplante, muy resistente una vez establecido'        },
    { nombre: 'Cebollino',   imagen: IMG('cebollino.jpg'),                    consejo: 'Siembra directa, rebrota tras cada corte'              },
    { nombre: 'Puerros',     imagen: IMG('cebollino.jpg'),                    consejo: 'Trasplanta los semilleros de febrero-marzo'            },
    { nombre: 'Espinacas',   imagen: IMG('espinacas.jpg'),                    consejo: 'Última siembra de primavera antes del calor'           },
  ],
  5: [
    { nombre: 'Tomates',     imagen: IMG('tomate-pera.jpg'),                  consejo: 'Mes ideal para trasplantar, añade tutor sólido'        },
    { nombre: 'Pepinos',     imagen: IMG('agua-pepino.jpg'),                  consejo: 'Trasplanta o siembra directa, cosecha en 60 días'      },
    { nombre: 'Calabacines', imagen: IMG('calabacin.jpg'),                    consejo: 'Siembra directa, una planta produce mucho'             },
    { nombre: 'Pimientos',   imagen: IMG('pimientos.jpg'),                    consejo: 'Trasplanta al exterior, riega con regularidad'         },
    { nombre: 'Berenjenas',  imagen: IMG('berenjenasç.jpg'),                  consejo: 'Trasplanta al exterior con buen calor establecido'     },
    { nombre: 'Judías verdes',imagen: IMG('judias-verdes.jpg'),               consejo: 'Segunda siembra, puedes escalonar cada 3 semanas'      },
    { nombre: 'Albahaca',    imagen: IMG('albahaca.jpg'),                     consejo: 'Siembra directa o trasplanta, quiere sol pleno'        },
    { nombre: 'Cebollino',   imagen: IMG('cebollino.jpg'),                    consejo: 'Siembra directa, perfecto en maceta o bancal'          },
    { nombre: 'Cilantro',    imagen: IMG('cilantro.jpg'),                     consejo: 'Siembra directa, cosecha hojas en 3-4 semanas'         },
    { nombre: 'Perejil',     imagen: IMG('peregil.jpg'),                      consejo: 'Siembra directa, pica las hojas para que rebrote'      },
    { nombre: 'Remolacha',   imagen: IMG('acelga-zanahoria.jpg'),             consejo: 'Siembra directa, cosecha a finales de verano'          },
    { nombre: 'Zanahorias',  imagen: IMG('zanahoria.jpg'),                    consejo: 'Tercera siembra, cosecha en agosto-septiembre'         },
  ],
  6: [
    { nombre: 'Calabacines', imagen: IMG('calabacin.jpg'),                    consejo: 'Segunda siembra del año, cosecha en agosto'            },
    { nombre: 'Judías verdes',imagen: IMG('judias-verdes.jpg'),               consejo: 'Última siembra, riega temprano para evitar calor'      },
    { nombre: 'Pepinos',     imagen: IMG('pepino.jpg'),                       consejo: 'Segunda siembra, riego abundante en verano'            },
    { nombre: 'Remolacha',   imagen: IMG('acelga-zanahoria.jpg'),             consejo: 'Riego frecuente para raíces tiernas en verano'         },
    { nombre: 'Kale',        imagen: IMG('kale.jpg'),                         consejo: 'Siembra ahora para cosechar en otoño-invierno'         },
    { nombre: 'Albahaca',    imagen: IMG('albahaca.jpg'),                     consejo: 'Siembra directa, máximo rendimiento en verano'         },
    { nombre: 'Cilantro',    imagen: IMG('cilantro.jpg'),                     consejo: 'Siembra escalonada, tolera el calor moderado'          },
  ],
  7: [
    { nombre: 'Kale',        imagen: IMG('kale.jpg'),                         consejo: 'Aguanta el calor mejor que otras coles'                },
    { nombre: 'Acelgas',     imagen: IMG('acelgas.jpg'),                      consejo: 'Resistente al calor, riega a primera hora'             },
    { nombre: 'Remolacha',   imagen: IMG('acelga-zanahoria.jpg'),             consejo: 'Última siembra de verano, cosecha en septiembre'       },
    { nombre: 'Albahaca',    imagen: IMG('albahaca.jpg'),                     consejo: 'Recórtala para que no florezca y dure más'             },
    { nombre: 'Lechugas',    imagen: IMG('lechuga.jpg'),                      consejo: 'Semillero en sombra para trasplantar en septiembre'    },
    { nombre: 'Brócoli',     imagen: IMG('kale-guisantes.jpg'),               consejo: 'Semillero a la sombra, trasplanta en agosto'           },
    { nombre: 'Coliflor',    imagen: IMG('kale-guisantes.jpg'),               consejo: 'Semillero para cosecha otoñal, necesita espacio'       },
    { nombre: 'Judías verdes',imagen: IMG('judias-verdes.jpg'),               consejo: 'Última oportunidad, siembra muy temprano'              },
  ],
  8: [
    { nombre: 'Lechugas',    imagen: IMG('lechuga.jpg'),                      consejo: 'Siembra a la sombra, cosecha en octubre'               },
    { nombre: 'Brócoli',     imagen: IMG('kale-guisantes.jpg'),               consejo: 'Trasplanta semilleros de julio, cosecha en nov'        },
    { nombre: 'Coliflor',    imagen: IMG('kale-guisantes.jpg'),               consejo: 'Trasplanta en agosto, cosecha en noviembre'            },
    { nombre: 'Zanahorias',  imagen: IMG('zanahoria.jpg'),                    consejo: 'Siembra de otoño, cosecha en noviembre-diciembre'      },
    { nombre: 'Espinacas',   imagen: IMG('espinacas.jpg'),                    consejo: 'Espera a final de mes cuando baje el calor'            },
    { nombre: 'Acelgas',     imagen: IMG('acelgas.jpg'),                      consejo: 'Siembra directa, muy productivas en otoño'             },
    { nombre: 'Kale',        imagen: IMG('kale.jpg'),                         consejo: 'Última siembra del año, mejora con el frío'            },
    { nombre: 'Rúcula',      imagen: IMG('rucula.jpg'),                       consejo: 'Primera siembra de otoño, crece en fresco'             },
    { nombre: 'Rábanos',     imagen: IMG('rabanos.jpg'),                      consejo: 'Primera siembra otoñal, cosecha en septiembre'         },
  ],
  9: [
    { nombre: 'Espinacas',   imagen: IMG('espinacas.jpg'),                    consejo: 'Temperatura ideal, siembra directa abundante'          },
    { nombre: 'Lechugas',    imagen: IMG('lechuga.jpg'),                      consejo: 'Gran variedad: romana, hoja de roble, batavia…'        },
    { nombre: 'Acelgas',     imagen: IMG('acelgas.jpg'),                      consejo: 'Siembra directa, muy productivas en otoño'             },
    { nombre: 'Brócoli',     imagen: IMG('kale-guisantes.jpg'),               consejo: 'Trasplanta los semilleros de agosto al exterior'       },
    { nombre: 'Zanahorias',  imagen: IMG('zanahoria.jpg'),                    consejo: 'Siembra directa, cosecha para navidades'               },
    { nombre: 'Rábanos',     imagen: IMG('rabanos.jpg'),                      consejo: 'Siembra directa, cosecha en octubre en 3 semanas'      },
    { nombre: 'Rúcula',      imagen: IMG('rucula.jpg'),                       consejo: 'Temperatura perfecta, crece en 4 semanas'              },
    { nombre: 'Cilantro',    imagen: IMG('cilantro.jpg'),                     consejo: 'Siembra directa, última oportunidad del año'           },
    { nombre: 'Perejil',     imagen: IMG('peregil.jpg'),                      consejo: 'Siembra directa, aguanta el invierno si es suave'      },
    { nombre: 'Cebollino',   imagen: IMG('cebollino.jpg'),                    consejo: 'Siembra directa, rebrota tras cada corte'              },
  ],
  10: [
    { nombre: 'Ajos',        imagen: IMG('salterado-judias-ajo-perejil.jpg'), consejo: 'Octubre es el mejor mes para plantar ajos en España'   },
    { nombre: 'Habas',       imagen: IMG('guisantes.jpg'),                    consejo: 'Siembra directa, las heladas suaves las benefician'    },
    { nombre: 'Guisantes',   imagen: IMG('guisantes.jpg'),                    consejo: 'Siembra directa, florecen en primavera'                },
    { nombre: 'Cebollas',    imagen: IMG('cebollino.jpg'),                    consejo: 'Variedades de invierno, siembra directa'               },
    { nombre: 'Espinacas',   imagen: IMG('espinacas.jpg'),                    consejo: 'Temperatura perfecta para siembra otoñal'              },
    { nombre: 'Lechugas',    imagen: IMG('lechuga.jpg'),                      consejo: 'Variedades de invierno, cosecha en diciembre'          },
    { nombre: 'Brócoli',     imagen: IMG('kale-guisantes.jpg'),               consejo: 'Última oportunidad en zona mediterránea cálida'        },
    { nombre: 'Rábanos',     imagen: IMG('rabanos.jpg'),                      consejo: 'Última siembra otoñal, cosecha en noviembre'           },
  ],
  11: [
    { nombre: 'Ajos',        imagen: IMG('salterado-judias-ajo-perejil.jpg'), consejo: 'Todavía a tiempo, planta antes de diciembre'          },
    { nombre: 'Habas',       imagen: IMG('guisantes.jpg'),                    consejo: 'Mes óptimo en zona mediterránea cálida'                },
    { nombre: 'Guisantes',   imagen: IMG('guisantes.jpg'),                    consejo: 'Siembra directa, cosecha en febrero-marzo'             },
    { nombre: 'Espinacas',   imagen: IMG('espinacas.jpg'),                    consejo: 'Última siembra antes del frío intenso'                 },
    { nombre: 'Lechugas',    imagen: IMG('lechuga.jpg'),                      consejo: 'Solo en zonas sin heladas o bajo túnel'                },
    { nombre: 'Cebollas',    imagen: IMG('cebollino.jpg'),                    consejo: 'Siembra directa de variedades de invierno tardías'     },
  ],
  12: [
    { nombre: 'Ajos',        imagen: IMG('salterado-judias-ajo-perejil.jpg'), consejo: 'Última oportunidad, antes de que la tierra se hiele'  },
    { nombre: 'Habas',       imagen: IMG('guisantes.jpg'),                    consejo: 'Solo en zonas sin heladas fuertes'                     },
    { nombre: 'Guisantes',   imagen: IMG('guisantes.jpg'),                    consejo: 'Zona cálida: siembra directa en exterior'              },
    { nombre: 'Espinacas',   imagen: IMG('espinacas.jpg'),                    consejo: 'Solo en interior, invernadero o bajo túnel'            },
    { nombre: 'Lechugas',    imagen: IMG('lechuga.jpg'),                      consejo: 'Solo en interior o invernadero con protección'         },
  ],
};

const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
const ESTACIONES: Record<number, string> = {
  1: 'Invierno', 2: 'Invierno', 3: 'Primavera',
  4: 'Primavera', 5: 'Primavera', 6: 'Verano',
  7: 'Verano',   8: 'Verano',   9: 'Otoño',
  10: 'Otoño',  11: 'Otoño',  12: 'Invierno',
};
const ESTACION_ICONOS: Record<number, LucideIcon> = {
  1: LucideSnowflake, 2: LucideSnowflake, 3: LucideFlower2,
  4: LucideFlower2, 5: LucideFlower2, 6: LucideSun,
  7: LucideSun,      8: LucideSun,      9: LucideLeaf,
  10: LucideLeaf,   11: LucideLeaf,   12: LucideSnowflake,
};

interface Temporada {
  nombre: string;
  imagen: string;
  meses: number[];
}

const MESES_CORTOS = ['E','F','M','A','M','J','J','A','S','O','N','D'];

@Component({
  selector: 'app-diet-recommendations',
  standalone: true,
  imports: [CommonModule, IonModal, LucideDynamicIcon, LucideSprout, LucideCheck, RecetaCardComponent, RecetaWindowComponent],
  templateUrl: './diet-recommendations.html',
  styleUrls: ['./diet-recommendations.scss'],
})
export class DietRecommendationsComponent implements OnInit {
  @ViewChild('calModal') calModal!: IonModal;

  plantas: Planta[] = [];
  temporadas: Temporada[] = [];
  mesNombre = '';
  estacion = '';
  estacionIcon: LucideIcon = LucideCalendarDays;
  mesActual = 0;
  mesSeleccionado = signal(0);
  readonly mesesCortos = MESES_CORTOS;

  plantadaReciente = signal<string | null>(null);
  private confirmTimer: any;

  // Recomanació de recepta amb el sistema de recetes de l'Alma (RecetaHuerto)
  private readonly authService = inject(AuthService);
  private readonly recetasService = inject(RecetasService);
  recetaRecomendada: RecetaHuerto | null = null;
  usuarioId = 1;
  mostrarRecetaModal = signal(false);

  constructor(private plantasService: PlantasService) {}

  ngOnInit() {
    this.mesActual = new Date().getMonth() + 1;
    this.mesSeleccionado.set(this.mesActual);
    this.mesNombre = MESES[this.mesActual - 1];
    this.estacion = ESTACIONES[this.mesActual];
    this.estacionIcon = ESTACION_ICONOS[this.mesActual];
    this.plantas = CALENDARIO[this.mesActual] ?? [];
    this.temporadas = this.buildTemporadas();
    this.usuarioId = this.authService.getStoredUser()?.usuario_id ?? 1;
    this.cargarRecetaRecomendada();
  }

  seleccionarMes(i: number) {
    this.mesSeleccionado.set(i + 1);
  }

  // Recomana una recepta segons l'hort de l'usuari, usant el feed de l'Alma.
  private cargarRecetaRecomendada(): void {
    this.recetasService.getPlantasUsuarioIds(this.usuarioId).pipe(
      switchMap(idsPlantas => this.recetasService.getFeed(idsPlantas, this.usuarioId))
    ).subscribe({
      next: (recetas) => {
        // El backend ja retorna el feed ordenat; agafem la primera (millor match).
        this.recetaRecomendada = recetas[0] ?? null;
      },
      error: () => { this.recetaRecomendada = null; },
    });
  }

  abrirReceta(): void {
    this.mostrarRecetaModal.set(true);
  }

  cerrarReceta(): void {
    this.mostrarRecetaModal.set(false);
  }

  private buildTemporadas(): Temporada[] {
    const map = new Map<string, { imagen: string; meses: Set<number> }>();
    for (const [mes, plantas] of Object.entries(CALENDARIO)) {
      for (const p of plantas) {
        if (!map.has(p.nombre)) {
          map.set(p.nombre, { imagen: p.imagen, meses: new Set() });
        }
        map.get(p.nombre)!.meses.add(Number(mes));
      }
    }
    return Array.from(map.entries())
      .map(([nombre, data]) => ({
        nombre,
        imagen: data.imagen,
        meses: Array.from(data.meses).sort((a, b) => a - b),
      }))
      .sort((a, b) => a.nombre.localeCompare(b.nombre));
  }

  plantarAhora(t: Temporada) {
    const hoy = new Date();
    const cosecha = new Date(hoy);
    cosecha.setDate(cosecha.getDate() + diasHastaCosecha(t.nombre));

    const nueva: PlantaHuerto = {
      planta_id: Date.now(),
      usuario_id: 1,
      nombre_planta: t.nombre,
      imagen_url: t.imagen,
      f_siembra: hoy,
      f_recogida: cosecha,
      tipo_planta: getTipoPlanta(t.nombre),
      estado: 'PLANTADA',
    };

    this.plantasService.addPlanta(nueva);

    this.plantadaReciente.set(t.nombre);
    clearTimeout(this.confirmTimer);
    this.confirmTimer = setTimeout(() => this.plantadaReciente.set(null), 2500);
  }

  abrirCalendario() {
    this.calModal.present();
  }
}
