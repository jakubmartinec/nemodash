// Příprava fotky před nahráním (jen v prohlížeči): zmenšit, převést na JPEG.
// Přepočítáním zmizí i EXIF (poloha GPS, model telefonu).
const MAX_EDGE = 2400; // px — text na faktuře zůstane čitelný
const QUALITY = 0.85;

export async function prepareUpload(file: File): Promise<File> {
  const isImage = file.type.startsWith("image/") || /\.(heic|heif)$/i.test(file.name);
  if (!isImage) return file; // PDF jde beze změny

  try {
    // Safari umí i HEIC; orientaci z EXIF prohlížeč použije sám
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.fillStyle = "#fff"; // průhledné PNG → bílé pozadí
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", QUALITY));
    if (!blob) return file;
    const base = file.name.replace(/\.[^.]+$/, "") || "foto";
    return new File([blob], `${base}.jpg`, { type: "image/jpeg" });
  } catch {
    return file; // formát, který prohlížeč neumí — server ho případně odmítne
  }
}
