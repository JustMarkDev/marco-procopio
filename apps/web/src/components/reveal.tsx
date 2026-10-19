import { Fragment, type ComponentProps, type CSSProperties } from "react";

export const EASE = [0.16, 1, 0.3, 1] as const;
/** Small lead-in so entrances start after the art begins to fade in, in seconds. */
export const ENTER = 0.08;

/** Style that starts an `enter`, `word` or `grow` animation `delay` seconds after the lead-in. */
export const after = (delay: number): CSSProperties => ({ animationDelay: `${ENTER + delay}s` });

/** Text that rises word by word out of a mask. Wraps like plain text. */
export function Words({
  text,
  delay = 0,
  stagger = 0.06,
}: {
  text: string;
  delay?: number;
  stagger?: number;
}) {
  const words = text.split(" ");
  return (
    <>
      <span className="sr-only">{text}</span>
      <span aria-hidden>
        {words.map((word, i) => (
          <Fragment key={`${word}-${i}`}>
            {i > 0 && " "}
            {/* Padding keeps descenders and overhanging glyphs (tight tracking) inside the mask;
                the negative margins give the space back. */}
            <span className="-mx-[0.12em] -mt-[0.15em] -mb-[0.35em] inline-block overflow-hidden px-[0.12em] pt-[0.15em] pb-[0.35em] align-top">
              <span className="word inline-block" style={after(delay + i * stagger)}>
                {word}
              </span>
            </span>
          </Fragment>
        ))}
      </span>
    </>
  );
}

/** Fades up out of a slight blur. */
export function Rise({ delay = 0, ...props }: ComponentProps<"div"> & { delay?: number }) {
  return <div className="enter [--enter-blur:6px]" style={after(delay)} {...props} />;
}
