import { permanentRedirect } from "next/navigation";

/** Items are browsed and bought in the Native launcher now. */
export default function ItemPage() {
  permanentRedirect("/store");
}
