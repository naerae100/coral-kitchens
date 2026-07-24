/**
 * Coral Kitchens wordmark.
 *
 * Redrawn in SVG from the Canva logo so the header mark is resolution
 * independent, recolours with the theme, and costs no extra request. The Canva
 * file remains the master for print, social and anywhere a raster is needed.
 *
 * The mark is a shaker door seen flat: an outer frame with an offset inner
 * reveal — the profile the workshop actually cuts.
 */
export function Logo({
  className = "",
  showWordmark = true,
}: {
  className?: string;
  showWordmark?: boolean;
}) {
  return (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      <svg
        viewBox="0 0 36 36"
        aria-hidden="true"
        focusable="false"
        className="h-[26px] w-[26px] shrink-0 text-accent"
      >
        <rect
          x="1.6"
          y="1.6"
          width="32.8"
          height="32.8"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
        />
        <path
          d="M9.4 34.4 V 9.4 H 34.4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="square"
        />
      </svg>

      {showWordmark && (
        <span className="flex flex-col leading-none">
          <span className="text-[15px] font-semibold tracking-[0.16em] text-foreground">CORAL</span>
          <span className="mt-[3px] text-[9px] font-medium tracking-[0.34em] text-muted-foreground">
            KITCHENS
          </span>
        </span>
      )}
    </span>
  );
}
