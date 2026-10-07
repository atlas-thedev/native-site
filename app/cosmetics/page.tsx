import { permanentRedirect } from "next/navigation";

/** Cosmetics now live in the combined store. */
export default function CosmeticsPage() {
  permanentRedirect("/store");
}
