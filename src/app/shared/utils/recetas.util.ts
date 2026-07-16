export function getFaltantesIcono(faltantes: number): string {
  if (faltantes === 0) return '🟢';
  if (faltantes === 1) return '🟡';
  return '🔴';
}

export function getFaltantesTexto(faltantes: number): string {
  if (faltantes === 0) return '¡Tienes todo en tu huerto!';
  if (faltantes === 1) return '¡Te falta solo 1 ingrediente!';
  return `Te faltan ${faltantes} ingredientes`;
}

export function getFaltantesClase(faltantes: number): string {
  if (faltantes === 0) return 'faltantes--completa';
  if (faltantes === 1) return 'faltantes--falta-uno';
  return 'faltantes--varios';
}

export function formatTiempoPreparacion(tiempo?: string): string {
  if (!tiempo) return '';
  const [horas, minutos] = tiempo.split(':').map(Number);
  if (horas > 0) return `${horas}h ${minutos}min`;
  return `${minutos} min`;
}
