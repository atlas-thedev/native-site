import { permanentRedirect } from "next/navigation";

/** The cape store moved to /capes. */
export default function StorePage() {
  permanentRedirect("/capes");
}
