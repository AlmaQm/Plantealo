// Comprime una imagen en el navegador y la devuelve como data URI (base64),
// lista para guardar directamente en un campo de texto en BD. Evita depender
// del filesystem del backend (en Render, sin disco persistente, cualquier
// fichero subido se borra en cada redeploy).
export async function comprimirImagen(file: File, maxDimension = 1280, calidad = 0.75): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const escala = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * escala);
  const height = Math.round(bitmap.height * escala);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, width, height);

  return canvas.toDataURL('image/jpeg', calidad);
}
