import { readFile } from "fs/promises";
import { join } from "path";
import sharp from "sharp";

/** Off-white matching --color-bg-primary (#f4f3f1) */
const BG = { r: 244, g: 243, b: 241 };

export const OG_IMAGE_SIZE = { width: 1200, height: 630 } as const;

/** Shared preview art: solar-system-pana on site off-white. */
export async function renderClientLinkPreviewPng(): Promise<Buffer> {
  const svg = await readFile(join(process.cwd(), "public/assets/solar-system-pana.svg"));
  const illustration = await sharp(svg)
    .resize({ width: 780, height: 520, fit: "inside" })
    .png()
    .toBuffer();

  const meta = await sharp(illustration).metadata();
  const left = Math.max(0, Math.round((OG_IMAGE_SIZE.width - (meta.width ?? 780)) / 2));
  const top = Math.max(0, Math.round((OG_IMAGE_SIZE.height - (meta.height ?? 520)) / 2));

  return sharp({
    create: {
      width: OG_IMAGE_SIZE.width,
      height: OG_IMAGE_SIZE.height,
      channels: 3,
      background: BG,
    },
  })
    .composite([{ input: illustration, left, top }])
    .png()
    .toBuffer();
}
