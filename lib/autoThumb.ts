/**
 * Store previews made automatically: the piece worn on the default skin, drawn by the same worn-shot
 * renderer the store uses, as a transparent PNG (base64, no data: prefix). Null if it can't be drawn.
 */
export async function thumbFor(id: string, model: unknown, texture: Uint8Array | string): Promise<string | null> {
  const url = typeof texture === "string" ? texture : URL.createObjectURL(new Blob([texture as BlobPart], { type: "image/png" }));
  try {
    const { wornShot } = await import("@/lib/wornShot");
    const shot: string | null = await wornShot({ item: { id: `auto:${id}:${Date.now()}` }, asset: { model, texture: url }, skinUrl: "/skins/steve.png", model: "default" });
    return shot ? shot.replace(/^data:image\/png;base64,/, "") : null;
  } catch {
    return null;
  } finally {
    if (typeof texture !== "string") URL.revokeObjectURL(url);
  }
}

/** A readable name from a file name: "cyber_hood-v2.json" -> "Cyber Hood V2". */
export const nameFromFile = (file: string) => file.replace(/\.[a-z0-9]+$/i, "").replace(/[_\-.]+/g, " ").replace(/\s+/g, " ").trim().replace(/\b\w/g, (c) => c.toUpperCase()).slice(0, 40);
