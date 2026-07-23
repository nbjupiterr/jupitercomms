import { readFile } from "fs/promises";
import { join } from "path";
import sharp from "sharp";

export const runtime = "nodejs";
export const alt = "Orbit by Jupiter";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Off-white matching --color-bg-primary (#f4f3f1) */
const BG = { r: 244, g: 243, b: 241 };

export default async function Image() {
  const svg = await readFile(join(process.cwd(), "public/assets/solar-system-pana.svg"));
  const illustration = await sharp(svg)
    .resize({ width: 780, height: 520, fit: "inside" })
    .png()
    .toBuffer();

  const meta = await sharp(illustration).metadata();
  const left = Math.max(0, Math.round((size.width - (meta.width ?? 780)) / 2));
  const top = Math.max(0, Math.round((size.height - (meta.height ?? 520)) / 2));

  const png = await sharp({
    create: {
      width: size.width,
      height: size.height,
      channels: 3,
      background: BG,
    },
  })
    .composite([{ input: illustration, left, top }])
    .png()
    .toBuffer();

  return new Response(new Uint8Array(png), {
    headers: { "Content-Type": "image/png" },
  });
}
