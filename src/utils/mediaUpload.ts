/**
 * Client-side media compression and file conversion utilities so user photos,
 * DNI scans, optional certificates, incident images, and short presentation videos
 * work reliably in the browser without exceeding localStorage quotas.
 */

export async function compressImageToDataUrl(
  file: File,
  maxDimension = 900,
  quality = 0.72
): Promise<string> {
  const isImageExt = /\.(jpe?g|png|webp|gif|bmp|avif|heic|heif|svg)$/i.test(file.name || '');
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/') && !isImageExt) {
      reject(new Error('El archivo seleccionado no es una imagen válida.'));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('No se pudo leer el archivo de imagen.'));
    reader.onload = () => {
      const rawDataUrl = reader.result as string;
      const img = new Image();
      img.onerror = () => {
        if (file.size <= 1_200_000 && rawDataUrl) {
          resolve(rawDataUrl);
        } else {
          reject(new Error('Formato de imagen no soportado. Usa JPG, PNG o WebP.'));
        }
      };
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(reader.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        const compressed = canvas.toDataURL('image/jpeg', quality);
        resolve(compressed);
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export async function readCertificateFile(
  file: File
): Promise<{ url: string; fileName: string; warning?: string }> {
  const isImage = file.type.startsWith('image/');
  if (isImage) {
    const url = await compressImageToDataUrl(file, 1000, 0.75);
    return { url, fileName: file.name };
  }

  // PDF or document
  if (file.size > 1_800_000) {
    const objectUrl = URL.createObjectURL(file);
    return {
      url: objectUrl,
      fileName: file.name,
      warning: 'El documento supera 1.8 MB: se mantendrá disponible durante esta sesión.'
    };
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('No se pudo leer el certificado.'));
    reader.onload = () => {
      resolve({
        url: reader.result as string,
        fileName: file.name
      });
    };
    reader.readAsDataURL(file);
  });
}

export async function readPersonVideoFile(
  file: File
): Promise<{ url: string; fileName: string; isSessionOnly: boolean }> {
  if (!file.type.startsWith('video/')) {
    throw new Error('Por favor selecciona un archivo de video válido (MP4, WebM, MOV).');
  }

  // Keep DataURL videos under ~2.2 MB so localStorage remains fast & safe
  if (file.size <= 2_200_000) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('No se pudo procesar el archivo de video.'));
      reader.onload = () => {
        resolve({
          url: reader.result as string,
          fileName: file.name,
          isSessionOnly: false
        });
      };
      reader.readAsDataURL(file);
    });
  }

  // Larger video: use Blob ObjectURL for immediate playback without overflowing localStorage
  const objectUrl = URL.createObjectURL(file);
  return {
    url: objectUrl,
    fileName: file.name,
    isSessionOnly: true
  };
}

export function safeLocalStorageSet(key: string, value: unknown): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}
