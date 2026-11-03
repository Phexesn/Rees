import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { logoutAction } from "@/app/(auth)/actions";
import { NavLinks, type NavItem } from "@/app/(app)/NavLinks";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Logo } from "@/components/Logo";
import { requireContext } from "@/lib/auth/context";
import { effectivePlan, trialDaysLeft } from "@/lib/features";
import { isDemoMode } from "@/lib/llm";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const ctx = await requireContext();
  const t = await getTranslations("nav");
  const tb = await getTranslations("billing");
  const tc = await getTranslations("common");
  const plan = effectivePlan(ctx.tenant);
  const daysLeft = trialDaysLeft(ctx.tenant);
  const whiteLabel = ctx.can("WHITE_LABEL") && ctx.tenant.brandName;

  const items: NavItem[] = [
    { href: "/dashboard", label: t("home"), icon: "🏠" },
    { href: "/properties", label: t("listings"), icon: "🏡" },
    { href: "/create", label: t("create"), icon: "✨" },
    { href: "/create/follow-up-coach", label: t("coach"), icon: "🧭" },
    { href: "/contacts", label: t("contacts"), icon: "👥", locked: !ctx.can("CRM") },
    { href: "/pipeline", label: t("pipeline"), icon: "📋", locked: !ctx.can("CRM") },
    { href: "/tasks", label: t("tasks"), icon: "✅", locked: !ctx.can("CRM") },
    { href: "/cma", label: t("cma"), icon: "📊", locked: !ctx.can("CMA") },
    { href: "/settings", label: t("settings"), icon: "⚙️" },
    { href: "/help", label: t("help"), icon: "❓" },
  ];
  if (ctx.can("TEAM_DASHBOARD")) items.splice(8, 0, { href: "/team", label: t("team"), icon: "🧑‍🤝‍🧑" });
  if (ctx.user.isPlatformAdmin) items.push({ href: "/admin", label: t("admin"), icon: "🛡️" });

  const sidebar = (
    <nav aria-label={t("main")} className="space-y-6">
      <NavLinks items={items} lockedLabel={t("locked")} />
      <form action={logoutAction}>
        <button className="flex min-h-14 w-full items-center gap-3 rounded-xl px-4 text-lg font-semibold text-slate-900 hover:bg-slate-100">
          <span aria-hidden className="text-2xl">🚪</span>
          {t("signOut")}
        </button>
      </form>
    </nav>
  );

  return (
    <div className="min-h-screen">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:p-4 focus:text-lg">
        {tc("skipToContent")}
      </a>
      {isDemoMode() ? (
        <div className="bg-amber-100 px-4 py-2 text-center text-base font-semibold text-amber-950">🧪 {tc("demoMode")}</div>
      ) : null}
      {daysLeft !== null ? (
        <div className="bg-brand-900 px-4 py-2 text-center text-base text-white">
          {tb("trialBanner", { days: daysLeft })}{" "}
          <Link href="/settings/billing" className="font-bold underline">
            {tb("choosePlan")}
          </Link>
        </div>
      ) : null}
      {!plan ? (
        <div className="bg-red-700 px-4 py-2 text-center text-base font-semibold text-white">
          {tb("inactiveBanner")}{" "}
          <Link href="/settings/billing" className="underline">
            {tb("choosePlan")}
          </Link>
        </div>
      ) : null}
      <header className="border-b-2 border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3">
          <Logo href="/dashboard" name={whiteLabel ? ctx.tenant.brandName! : "RealtyBoost"} />
          <div className="flex items-center gap-3">
            <div className="hidden lg:block">
              <LanguageSwitcher back="/dashboard" />
            </div>
            <div className="lg:hidden">
              <LanguageSwitcher back="/dashboard" compact />
            </div>
            <details className="relative lg:hidden">
              <summary className="flex min-h-12 cursor-pointer list-none items-center gap-2 rounded-xl border-2 border-slate-300 px-4 text-lg font-semibold">
                ☰ {t("menu")}
              </summary>
              <div className="absolute right-0 z-40 mt-2 w-72 rounded-2xl border-2 border-slate-200 bg-white p-3 shadow-xl">{sidebar}</div>
            </details>
          </div>
        </div>
      </header>
      <div className="mx-auto flex max-w-7xl gap-8 px-4 py-8">
        <aside className="hidden w-64 shrink-0 lg:block">{sidebar}</aside>
        <main id="main" className="min-w-0 flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
