import Link from "next/link";

export function Logo({ href = "/", name = "RealtyBoost" }: { href?: string; name?: string }) {
  return (
    <Link href={href} className="inline-flex min-h-12 items-center gap-2 text-2xl font-bold text-slate-900">
      <span aria-hidden className="flex size-10 items-center justify-center rounded-xl bg-brand-700 text-xl text-white">
        ⌂
      </span>
      {name}
    </Link>
  );
}
