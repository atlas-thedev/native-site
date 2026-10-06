type P = React.SVGProps<SVGSVGElement>;
const base = { viewBox: "0 0 24 24", fill: "currentColor", "aria-hidden": true } as const;

export const Discord = (p: P) => (
  <svg {...base} {...p}>
    <path d="M20.32 4.37A19.8 19.8 0 0 0 15.43 2.9l-.23.46a18.3 18.3 0 0 0-4.4 0l-.24-.46a19.7 19.7 0 0 0-4.89 1.47C2.57 9.02 1.73 13.55 2.15 18a19.9 19.9 0 0 0 6 3l.48-.8c-.92-.34-1.8-.76-2.62-1.26l.64-.5a14.2 14.2 0 0 0 12.7 0l.65.5c-.83.5-1.7.92-2.63 1.26l.49.8a19.8 19.8 0 0 0 6-3c.5-5.16-.84-9.65-3.54-13.63ZM9.35 15.3c-1.18 0-2.16-1.08-2.16-2.4s.95-2.4 2.16-2.4 2.18 1.08 2.16 2.4c0 1.32-.95 2.4-2.16 2.4Zm5.3 0c-1.18 0-2.15-1.08-2.15-2.4s.95-2.4 2.15-2.4 2.18 1.08 2.16 2.4c0 1.32-.95 2.4-2.16 2.4Z" />
  </svg>
);
export const Apple = (p: P) => (
  <svg {...base} {...p}>
    <path d="M16.37 12.6c-.03-2.7 2.2-4 2.3-4.06-1.25-1.83-3.2-2.08-3.9-2.1-1.65-.17-3.23.98-4.07.98-.85 0-2.15-.96-3.54-.93a5.2 5.2 0 0 0-4.4 2.68c-1.9 3.3-.48 8.1 1.34 10.76.9 1.3 1.98 2.76 3.38 2.7 1.36-.06 1.87-.88 3.5-.88 1.64 0 2.1.88 3.54.85 1.46-.03 2.38-1.32 3.27-2.63a11.5 11.5 0 0 0 1.48-3.04c-.03-.01-2.87-1.1-2.9-4.33ZM13.7 4.5c.74-.9 1.24-2.14 1.1-3.38-1.07.04-2.36.71-3.13 1.6-.68.8-1.28 2.07-1.12 3.28 1.19.1 2.4-.6 3.15-1.5Z" />
  </svg>
);
export const Windows = (p: P) => (
  <svg {...base} {...p}>
    <path d="M3 5.5 10.5 4.5v7H3v-6Zm8.5-1.15L21 3v8.5h-9.5v-7.15ZM3 12.5h7.5v7L3 18.5v-6Zm8.5 0H21V21l-9.5-1.35V12.5Z" />
  </svg>
);
export const Linux = (p: P) => (
  <svg {...base} {...p}>
    <path d="M12.5 2C9.9 2 9.2 4.4 9.3 6.8c.05 1.3-.2 2-.9 3-.9 1.2-2.2 3.1-2.3 5.2-.1 1.1.2 1.9.6 2.4-.5.4-1.2.8-1.9 1-.7.3-.8.8-.2 1.3.7.6 2.1.7 3.2 1 .8.3 1.2 1 2.2 1.1 1 .1 1.5-.3 2.3-.3s1.3.4 2.3.3c1-.1 1.4-.8 2.2-1.1 1.1-.3 2.5-.4 3.2-1 .6-.5.5-1-.2-1.3-.7-.2-1.4-.6-1.9-1 .4-.5.7-1.3.6-2.4-.1-2.1-1.4-4-2.3-5.2-.7-1-.95-1.7-.9-3C15.8 4.4 15.1 2 12.5 2Zm-1 4.2c.4 0 .7.5.7 1.1s-.3 1.1-.7 1.1-.7-.5-.7-1.1.3-1.1.7-1.1Zm2.2 0c.4 0 .7.5.7 1.1s-.3 1.1-.7 1.1-.7-.5-.7-1.1.3-1.1.7-1.1Z" />
  </svg>
);
export const YouTube = (p: P) => (
  <svg {...base} {...p}>
    <path d="M23 7.2a3 3 0 0 0-2.1-2.1C19 4.6 12 4.6 12 4.6s-7 0-8.9.5A3 3 0 0 0 1 7.2C.5 9.1.5 12 .5 12s0 2.9.5 4.8a3 3 0 0 0 2.1 2.1c1.9.5 8.9.5 8.9.5s7 0 8.9-.5a3 3 0 0 0 2.1-2.1c.5-1.9.5-4.8.5-4.8s0-2.9-.5-4.8ZM9.7 15.1V8.9l5.8 3.1-5.8 3.1Z" />
  </svg>
);

/* Native pixel glyphs (hand-made, crisp at any size). */
const px = { shapeRendering: "crispEdges" as const, fill: "currentColor", "aria-hidden": true } as const;

/** A 4-point pixel star. */
export const PixelStar = (p: P) => (
  <svg viewBox="0 0 7 7" {...px} {...p}>
    <path d="M3 0h1v2H3zM2 2h3v1H2zM0 3h7v1H0zM2 4h3v1H2zM3 5h1v2H3z" />
  </svg>
);

/** A pixel cape with a star cut out of it. */
export const PixelCape = (p: P) => (
  <svg viewBox="0 0 12 14" {...px} {...p}>
    <path fillRule="evenodd" d="M1 0h10v2h-1v10H7v1H5v-1H2V2H1zM6 3h2v1H6zM5 4h1v1H5zM4 5h1v3H4zM5 8h1v1H5zM6 9h2v1H6zM7 6h1v1H7z" />
  </svg>
);

/** A pixel top hat. */
export const PixelHat = (p: P) => (
  <svg viewBox="0 0 14 12" {...px} {...p}>
    <path d="M3 0h8v1H3zM3 1h1v6H3zM10 1h1v6h-1zM4 1h6v4H4zM4 5h6v1H4zM4 6h6v1H4zM0 8h14v2H0zM1 7h12v1H1zM1 10h12v1H1z" />
    <path d="M4 5h6v1H4z" opacity="0.45" />
  </svg>
);

/** Pixel sunglasses. */
export const PixelGlasses = (p: P) => (
  <svg viewBox="0 0 16 8" {...px} {...p}>
    <path fillRule="evenodd" d="M0 1h16v1h-1v3h-1v1h-3V5h-1V3H6v2H5v1H2V5H1V2H0zM2 2v3h3V2zM11 2v3h3V2z" />
    <path d="M2 2h3v3H2zM11 2h3v3h-3z" opacity="0.4" />
  </svg>
);

/** Pixel wings. */
export const PixelWings = (p: P) => (
  <svg viewBox="0 0 16 11" {...px} {...p}>
    <path d="M0 0h2v1h1v1h1v1h2v1h1v3H6v1H5v1H3v1H1V9H0zM16 0h-2v1h-1v1h-1v1h-2v1H9v3h1v1h1v1h2v1h2V9h1z" />
    <path d="M7 4h2v4H7z" opacity="0.5" />
  </svg>
);

/** A pixel sneaker. */
export const PixelShoe = (p: P) => (
  <svg viewBox="0 0 14 9" {...px} {...p}>
    <path d="M1 0h5v1h1v1h2v1h2v1h2v1h1v2H0V1h1z" />
    <path d="M0 7h14v2H0z" opacity="0.5" />
  </svg>
);

/** Four pixel squares: everything. */
export const PixelGrid = (p: P) => (
  <svg viewBox="0 0 7 7" {...px} {...p}>
    <path d="M0 0h3v3H0zM4 0h3v3H4zM0 4h3v3H0zM4 4h3v3H4z" />
  </svg>
);
