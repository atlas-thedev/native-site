import { ImageResponse } from "next/og";
import type { ReactElement } from "react";
import { isCosmetic, type StoreItem } from "../store";

export const OG = { width: 1200, height: 630 };
const SKY = "linear-gradient(180deg, #7ec8ff 0%, #bfe6ff 62%, #e9f7ff 100%)";

type Pic = { src: string; w: number; h: number };

/** Natural size of a PNG from its header. */
async function pngPic(url: string): Promise<Pic | null> {
  try {
    const r = await fetch(url, { next: { revalidate: 3600 }, signal: AbortSignal.timeout(6000) });
    if (!r.ok) return null;
    const buf = Buffer.from(await r.arrayBuffer());
    if (buf.length < 24 || buf.readUInt32BE(12) !== 0x49484452) return null;
    return { src: `data:image/png;base64,${buf.toString("base64")}`, w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
  } catch {
    return null;
  }
}

/** The front panel of a cape texture, scaled to `boxH` tall. */
function CapeFront({ pic, boxH }: { pic: Pic; boxH: number }) {
  const k = pic.w * 17 === pic.h * 22 ? pic.w / 22 : pic.w * 22 === pic.h * 46 ? pic.w / 46 : pic.w / 64;
  const scale = boxH / (16 * k);
  return (
    <div style={{ display: "flex", position: "relative", overflow: "hidden", width: Math.round(10 * k * scale), height: boxH }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={pic.src} alt="" width={Math.round(pic.w * scale)} height={Math.round(pic.h * scale)} style={{ position: "absolute", left: -Math.round(k * scale), top: -Math.round(k * scale) }} />
    </div>
  );
}

async function ItemArt({ item, size }: { item: StoreItem; size: number }) {
  const pic = await pngPic(item.stillUrl);
  if (!pic) return <div style={{ display: "flex", width: size, height: size }} />;
  if (isCosmetic(item)) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={pic.src} alt="" width={size} height={size} style={{ objectFit: "contain" }} />;
  }
  return <CapeFront pic={pic} boxH={size} />;
}

const priceText = (it: StoreItem) => (it.exclusive ? "Event" : it.paid ? `$${Number(it.price).toFixed(2)}` : "Free");

function Frame({ children }: { children: ReactElement | ReactElement[] }) {
  return (
    <div style={{ display: "flex", width: "100%", height: "100%", background: SKY, position: "relative", fontFamily: "sans-serif", color: "#0b1220" }}>
      <div style={{ position: "absolute", left: 90, top: 70, width: 150, height: 34, background: "rgba(255,255,255,0.8)", display: "flex" }} />
      <div style={{ position: "absolute", right: 120, top: 120, width: 190, height: 40, background: "rgba(255,255,255,0.7)", display: "flex" }} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 120, background: "#2f2f3a", borderTop: "8px solid #54546a", display: "flex" }} />
      {children}
    </div>
  );
}

const Pill = ({ children, bg = "#0b1220", fg = "#fff" }: { children: string; bg?: string; fg?: string }) => (
  <div style={{ display: "flex", padding: "8px 18px", background: bg, color: fg, fontSize: 28, fontWeight: 700, borderRadius: 999 }}>{children}</div>
);

export async function itemCard(item: StoreItem): Promise<ImageResponse> {
  const art = await ItemArt({ item, size: 360 });
  const kind = isCosmetic(item) ? "Cosmetic" : item.animated ? "Animated cloak" : "Cloak";
  return new ImageResponse(
    (
      <Frame>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", flex: 1, padding: "0 20px 0 80px" }}>
          <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
            <Pill bg="#0b1220">{kind}</Pill>
            <Pill bg={item.exclusive ? "#9b6bff" : "#ffffff"} fg={item.exclusive ? "#ffffff" : "#0b1220"}>{priceText(item)}</Pill>
          </div>
          <div style={{ display: "flex", fontSize: 92, fontWeight: 800, letterSpacing: -3, lineHeight: 1.02 }}>{item.name}</div>
          <div style={{ display: "flex", marginTop: 22, fontSize: 30, color: "#27405c", maxWidth: 640 }}>
            {(item.description || "Only on Native. Wear it in the launcher and in game.").slice(0, 110)}
          </div>
          <div style={{ display: "flex", marginTop: 34, fontSize: 28, fontWeight: 700 }}>playnative.fun</div>
        </div>
        <div style={{ display: "flex", width: 420, alignItems: "center", justifyContent: "center", paddingRight: 70, paddingBottom: 60 }}>
          <div style={{ display: "flex", padding: 28, background: "rgba(11,18,32,0.88)", border: "6px solid #0b1220", borderRadius: 18 }}>{art}</div>
        </div>
      </Frame>
    ),
    OG,
  );
}

export async function notFoundCard(text: string): Promise<ImageResponse> {
  return new ImageResponse(
    (
      <Frame>
        <div style={{ display: "flex", flex: 1, alignItems: "center", justifyContent: "center", fontSize: 80, fontWeight: 800 }}>{text}</div>
      </Frame>
    ),
    OG,
  );
}

export async function playerCard(name: string, owned: number, wished: number, items: StoreItem[], plus: boolean): Promise<ImageResponse> {
  const arts = await Promise.all(items.slice(0, 5).map((it) => ItemArt({ item: it, size: 150 })));
  return new ImageResponse(
    (
      <Frame>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", flex: 1, padding: "0 80px 140px" }}>
          <div style={{ display: "flex", gap: 12, marginBottom: 22 }}>
            <Pill>Native player</Pill>
            {plus ? <Pill bg="#ffd166" fg="#2a1c00">Native+</Pill> : <div style={{ display: "flex" }} />}
          </div>
          <div style={{ display: "flex", fontSize: 112, fontWeight: 800, letterSpacing: -4, lineHeight: 1 }}>{name}</div>
          <div style={{ display: "flex", marginTop: 20, fontSize: 40, fontWeight: 700, color: "#27405c" }}>{`${owned} ${owned === 1 ? "item" : "items"} owned · ${wished} on wishlist`}</div>
          <div style={{ display: "flex", gap: 18, marginTop: 36 }}>
            {arts.map((a, i) => (
              <div key={i} style={{ display: "flex", padding: 14, background: "rgba(11,18,32,0.88)", border: "5px solid #0b1220", borderRadius: 14 }}>{a}</div>
            ))}
          </div>
        </div>
      </Frame>
    ),
    OG,
  );
}
