import type { SVGProps } from "react";

/** Native's own momentum mark, used instead of the generic sparkle icon. */
export default function NativeGlyph({
  className = "",
  ...props
}: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path
        d="M12 2.25 14.05 8 19.8 10.05 14.05 12.1 12 17.85 9.95 12.1 4.2 10.05 9.95 8 12 2.25Z"
        fill="currentColor"
      />
      <path
        d="m18.4 15.15.92 2.58 2.58.92-2.58.92-.92 2.58-.92-2.58-2.58-.92 2.58-.92.92-2.58Z"
        fill="currentColor"
        opacity=".58"
      />
      <path
        d="m4.45 14.2.62 1.74 1.73.61-1.73.62-.62 1.73-.61-1.73-1.74-.62 1.74-.61.61-1.74Z"
        fill="currentColor"
        opacity=".35"
      />
    </svg>
  );
}
