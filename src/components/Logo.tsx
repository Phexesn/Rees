import Link from "next/link";

/** On very narrow phones only the icon shows, so the header never forces sideways scrolling. */
export function Logo({ href = "/", name = "RealtyBoost" }: { href?: string; name?: string }) {
  return (
    <Link href={href} aria-label={name} className="inline-flex min-h-12 shrink-0 items-center gap-2 text-2xl font-bold text-slate-900">
      <span aria-hidden className="flex size-10 items-center justify-center rounded-xl bg-brand-700 text-xl text-white">
        ⌂
      </span>
      <span className="hidden min-[440px]:inline">{name}</span>
    </Link>
  );
}
