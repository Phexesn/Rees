import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Logo } from "@/components/Logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="border-b-2 border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-4 py-3">
          <Logo />
          <LanguageSwitcher />
        </div>
      </header>
      <main className="mx-auto max-w-xl px-4 py-10">{children}</main>
    </div>
  );
}
