/** Text that rolls up to a copy of itself on hover (pure CSS). */
export default function Roll({ children }: { children: string }) {
  return (
    <span className="v-roll" data-text={children}>
      <span>{children}</span>
    </span>
  );
}
