export const MAX_PIECES = 100;
export const MAX_FILE_BYTES = 15 * 1024 * 1024;

export function validateImage(file: File): string | null {
  if (!file.type.startsWith('image/')) return `“${file.name}” isn’t an image.`;
  if (file.size > MAX_FILE_BYTES) return `“${file.name}” is over 15 MB.`;
  return null;
}

/** Re-encodes any image as a JPEG no larger than `maxSide` px, so uploads are small and always .jpg. */
export async function toJpeg(file: File, maxSide = 1280): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Couldn’t process that image.');
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Couldn’t process that image.'))), 'image/jpeg', 0.85),
  );
}
