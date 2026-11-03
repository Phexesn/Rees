import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

/*
 * Age-friendly UI kit. Rules: one primary action per screen, buttons say what
 * they do, minimum 56px tall targets, labels always visible (no placeholder-
 * only fields), errors say what to do next.
 */

type Variant = "primary" | "secondary" | "danger" | "ghost" | "success";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-brand-700 text-white hover:bg-brand-800 border-2 border-brand-700",
  secondary: "bg-white text-brand-800 border-2 border-brand-700 hover:bg-brand-50",
  danger: "bg-white text-red-800 border-2 border-red-700 hover:bg-red-50",
  ghost: "bg-transparent text-slate-900 border-2 border-transparent hover:bg-slate-100",
  success: "bg-green-700 text-white border-2 border-green-700 hover:bg-green-800",
};

const SIZES = {
  md: "min-h-12 px-4 text-base",
  lg: "min-h-14 px-6 text-lg",
  xl: "min-h-16 px-8 text-xl",
};

export function buttonClass(variant: Variant = "primary", size: keyof typeof SIZES = "lg", extra = "") {
  return `inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${VARIANTS[variant]} ${SIZES[size]} ${extra}`;
}

export function Button({
  variant = "primary",
  size = "lg",
  className = "",
  ...props
}: ComponentProps<"button"> & { variant?: Variant; size?: keyof typeof SIZES }) {
  return <button className={buttonClass(variant, size, className)} {...props} />;
}

export function LinkButton({
  variant = "primary",
  size = "lg",
  className = "",
  ...props
}: ComponentProps<typeof Link> & { variant?: Variant; size?: keyof typeof SIZES }) {
  return <Link className={buttonClass(variant, size, className)} {...props} />;
}

export function Field({
  label,
  htmlFor,
  hint,
  error,
  children,
  optional,
  optionalLabel = "optional",
}: {
  label: string;
  htmlFor?: string;
  hint?: ReactNode;
  error?: string | null;
  children: ReactNode;
  optional?: boolean;
  optionalLabel?: string;
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={htmlFor} className="block text-lg font-semibold text-slate-900">
        {label}
        {optional ? <span className="ml-2 text-base font-normal text-slate-700">({optionalLabel})</span> : null}
      </label>
      {hint ? <p className="text-base text-slate-700">{hint}</p> : null}
      {children}
      {error ? (
        <p role="alert" className="flex items-start gap-2 text-base font-semibold text-red-700">
          <span aria-hidden>⚠️</span>
          {error}
        </p>
      ) : null}
    </div>
  );
}

const inputBase =
  "block w-full rounded-xl border-2 border-slate-400 bg-white px-4 text-xl text-slate-900 placeholder:text-slate-500 focus:border-brand-600 focus:outline-none focus:ring-4 focus:ring-brand-200 aria-[invalid=true]:border-red-600";

export function Input({ className = "", ...props }: ComponentProps<"input">) {
  return <input className={`${inputBase} min-h-14 ${className}`} {...props} />;
}

export function Textarea({ className = "", ...props }: ComponentProps<"textarea">) {
  return <textarea className={`${inputBase} min-h-32 py-3 leading-relaxed ${className}`} {...props} />;
}

export function Select({ className = "", children, ...props }: ComponentProps<"select">) {
  return (
    <select className={`${inputBase} min-h-14 cursor-pointer pr-10 ${className}`} {...props}>
      {children}
    </select>
  );
}

export function Checkbox({ label, hint, ...props }: ComponentProps<"input"> & { label: ReactNode; hint?: ReactNode }) {
  return (
    <label className="flex cursor-pointer items-start gap-4 rounded-xl border-2 border-slate-200 bg-white p-4 hover:border-brand-500">
      <input type="checkbox" className="mt-0.5 size-7 shrink-0 cursor-pointer accent-brand-700" {...props} />
      <span>
        <span className="block text-lg font-semibold text-slate-900">{label}</span>
        {hint ? <span className="block text-base text-slate-700">{hint}</span> : null}
      </span>
    </label>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-2xl border-2 border-slate-200 bg-white p-6 shadow-sm ${className}`}>{children}</div>;
}

export function PageHeader({
  title,
  description,
  actions,
  back,
}: {
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
  back?: { href: string; label: string };
}) {
  return (
    <header className="mb-8 space-y-3">
      {back ? (
        <Link href={back.href} className="inline-flex min-h-12 items-center gap-2 text-lg font-semibold text-brand-800 hover:underline">
          <span aria-hidden>←</span> {back.label}
        </Link>
      ) : null}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-slate-900 md:text-4xl">{title}</h1>
          {description ? <p className="max-w-3xl text-lg text-slate-700">{description}</p> : null}
        </div>
        {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
      </div>
    </header>
  );
}

const ALERT = {
  info: "border-brand-300 bg-brand-50 text-brand-900",
  success: "border-green-300 bg-green-50 text-green-900",
  warning: "border-amber-300 bg-amber-50 text-amber-950",
  error: "border-red-300 bg-red-50 text-red-900",
};
const ALERT_ICON = { info: "ℹ️", success: "✅", warning: "⚠️", error: "⛔" };

export function Alert({
  tone = "info",
  title,
  children,
}: {
  tone?: keyof typeof ALERT;
  title?: string;
  children?: ReactNode;
}) {
  return (
    <div role={tone === "error" ? "alert" : "status"} className={`flex gap-3 rounded-xl border-2 p-5 text-lg ${ALERT[tone]}`}>
      <span aria-hidden className="text-xl">{ALERT_ICON[tone]}</span>
      <div className="space-y-1">
        {title ? <p className="font-bold">{title}</p> : null}
        {children ? <div>{children}</div> : null}
      </div>
    </div>
  );
}

export function Badge({ children, tone = "slate" }: { children: ReactNode; tone?: "slate" | "brand" | "green" | "amber" | "red" }) {
  const tones = {
    slate: "bg-slate-100 text-slate-900",
    brand: "bg-brand-100 text-brand-900",
    green: "bg-green-100 text-green-900",
    amber: "bg-amber-100 text-amber-950",
    red: "bg-red-100 text-red-900",
  };
  return <span className={`inline-flex items-center rounded-full px-3 py-1 text-base font-semibold ${tones[tone]}`}>{children}</span>;
}

export function EmptyState({ icon, title, description, action }: { icon: string; title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-white p-10 text-center">
      <p className="text-5xl" aria-hidden>{icon}</p>
      <h2 className="mt-4 text-2xl font-bold text-slate-900">{title}</h2>
      {description ? <p className="mx-auto mt-2 max-w-xl text-lg text-slate-700">{description}</p> : null}
      {action ? <div className="mt-6 flex justify-center">{action}</div> : null}
    </div>
  );
}
