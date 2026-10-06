import { permanentRedirect } from "next/navigation";

/** The cape store moved to /cloaks. */
export default function StorePage() {
  permanentRedirect("/cloaks");
}
