export const GALLERY_MAX_ITEMS = 12;
export const GALLERY_MAX_EDGE = 1200;
export const GALLERY_JPEG_QUALITY = 0.82;

export function galleryPublicUrl(storagePath: string): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "") ?? "";
  return `${base}/storage/v1/object/public/gallery/${storagePath}`;
}

/** Compress & resize in the browser before upload to keep the client page light. */
export async function prepareGalleryImage(file: File): Promise<Blob> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Please choose an image file.");
  }

  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, GALLERY_MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not process image.");
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/webp", GALLERY_JPEG_QUALITY)
  );

  if (!blob) throw new Error("Could not compress image.");
  return blob;
}
