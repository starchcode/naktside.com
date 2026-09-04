import { ImageResponse } from "next/og";
import { OgCard, OG_SIZE } from "./og-card";

export const alt = "naktside";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(<OgCard />, size);
}
