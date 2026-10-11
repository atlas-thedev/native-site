import Button from "@/components/Button";

export default function NotFound() {
  return (
    <section className="flex min-h-[80vh] flex-col items-center justify-center px-6 text-center">
      <p className="eyebrow">404</p>
      <h1 className="v-display !leading-[0.9] mt-4 text-[clamp(4rem,14vw,10rem)] leading-none ">Lost chunk.</h1>
      <p className="mt-4 text-lg text-mute">This page hasn’t generated yet.</p>
      <div className="mt-8"><Button href="/">Back to spawn</Button></div>
    </section>
  );
}
