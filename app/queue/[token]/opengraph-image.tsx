import { OG_IMAGE_SIZE, renderClientLinkPreviewPng } from "@/lib/og-client-preview";

export const runtime = "nodejs";
export const alt = "Orbit by Jupiter";
export const size = OG_IMAGE_SIZE;
export const contentType = "image/png";

export default async function Image() {
  const png = await renderClientLinkPreviewPng();
  return new Response(new Uint8Array(png), {
    headers: { "Content-Type": "image/png" },
  });
}
