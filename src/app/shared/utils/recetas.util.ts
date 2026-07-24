export function getFaltantesIcono(faltantes: number, tieneIngredientes: boolean): string {
  if (!tieneIngredientes) return '⚪';
  if (faltantes === 0) return '🟢';
  if (faltantes === 1) return '🟡';
  return '🔴';
}

export function getFaltantesTexto(faltantes: number, tieneIngredientes: boolean): string {
  if (!tieneIngredientes) return 'Ingredientes no especificados';
  if (faltantes === 0) return '¡Tienes todo en tu huerto!';
  if (faltantes === 1) return '¡Te falta solo 1 ingrediente!';
  return `Te faltan ${faltantes} ingredientes`;
}

export function getFaltantesClase(faltantes: number, tieneIngredientes: boolean): string {
  if (!tieneIngredientes) return 'faltantes--sin-datos';
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
