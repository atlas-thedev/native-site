import { permanentRedirect } from "next/navigation";

/** Cloaks now live in the combined store. */
export default function CloaksPage() {
  permanentRedirect("/store?c=capes");
}
