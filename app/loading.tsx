/** Shown while a route streams in: the Native mark breathing on the page background. */
export default function Loading() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center" role="status" aria-label="Loading">
      <img src="/brand/icon.png" alt="" width={64} height={64} className="logo-img h-16 w-16 animate-[pulse-soft_1.4s_ease-in-out_infinite]" />
      <div className="mt-6 h-[2px] w-28 overflow-hidden rounded-full bg-line">
        <div className="h-full w-1/3 animate-[loadbar_1.1s_ease-in-out_infinite] rounded-full bg-fg" />
      </div>
    </div>
  );
}
