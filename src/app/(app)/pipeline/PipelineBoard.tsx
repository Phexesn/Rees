"use client";

import Link from "next/link";
import { useOptimistic, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { moveDealAction } from "@/app/(app)/deals/actions";
import { DEAL_STAGES } from "@/lib/crm";

export type BoardDeal = {
  id: string;
  title: string;
  stage: string;
  position: number;
  value: number | null;
  side: string;
  contactName: string;
  address: string | null;
  overdueTasks: number;
  daysInStage: number;
};

const STAGE_TONE: Record<string, string> = {
  NEW_LEAD: "border-t-brand-600",
  NURTURE: "border-t-amber-500",
  APPOINTMENT: "border-t-purple-600",
  ACTIVE: "border-t-sky-600",
  UNDER_CONTRACT: "border-t-orange-600",
  CLOSED: "border-t-green-700",
  LOST: "border-t-slate-500",
};

export function PipelineBoard({ deals }: { deals: BoardDeal[] }) {
  const t = useTranslations("pipeline");
  const ts = useTranslations("contacts.stages");
  const [, startTransition] = useTransition();
  const [optimistic, applyMove] = useOptimistic(deals, (state, move: { id: string; stage: string }) =>
    state.map((d) => (d.id === move.id ? { ...d, stage: move.stage, daysInStage: 0 } : d)),
  );
  const [dragging, setDragging] = useState<string | null>(null);
  const [over, setOver] = useState<string | null>(null);

  const move = (id: string, stage: string) => {
    const current = optimistic.find((d) => d.id === id);
    if (!current || current.stage === stage) return;
    const position = optimistic.filter((d) => d.stage === stage).length + 1;
    const fd = new FormData();
    fd.set("id", id);
    fd.set("stage", stage);
    fd.set("position", String(position));
    startTransition(async () => {
      applyMove({ id, stage });
      await moveDealAction(fd);
    });
  };

  const usd = (n: number) => `$${n.toLocaleString("en-US")}`;

  return (
    <div className="relative overflow-x-auto pb-4">
      <div className="flex min-w-max gap-4">
        {DEAL_STAGES.map((stage) => {
          const column = optimistic.filter((d) => d.stage === stage).sort((a, b) => a.position - b.position);
          const total = column.reduce((sum, d) => sum + (d.value ?? 0), 0);
          return (
            <section
              key={stage}
              aria-label={ts(stage)}
              onDragOver={(e) => {
                e.preventDefault();
                setOver(stage);
              }}
              onDragLeave={() => setOver(null)}
              onDrop={(e) => {
                e.preventDefault();
                const id = e.dataTransfer.getData("text/deal-id") || dragging;
                if (id) move(id, stage);
                setOver(null);
                setDragging(null);
              }}
              className={`flex w-72 shrink-0 flex-col rounded-2xl border-2 border-t-8 bg-slate-100 ${STAGE_TONE[stage]} ${
                over === stage ? "border-brand-600 bg-brand-50" : "border-slate-200"
              }`}
            >
              <header className="p-4">
                <h2 className="text-lg font-bold">{ts(stage)}</h2>
                <p className="text-base text-slate-700">
                  {t("dealCount", { count: column.length })}
                  {total ? ` · ${usd(total)}` : ""}
                </p>
              </header>
              <ul className="flex-1 space-y-3 px-3 pb-3">
                {column.map((deal) => (
                  <li
                    key={deal.id}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData("text/deal-id", deal.id);
                      e.dataTransfer.effectAllowed = "move";
                      setDragging(deal.id);
                    }}
                    onDragEnd={() => setDragging(null)}
                    className={`rounded-xl border-2 border-slate-200 bg-white p-4 shadow-sm ${dragging === deal.id ? "opacity-50" : ""}`}
                  >
                    <Link href={`/deals/${deal.id}`} className="block text-lg font-bold hover:underline">{deal.title}</Link>
                    <p className="text-base text-slate-700">{deal.contactName}</p>
                    {deal.address ? <p className="truncate text-base text-slate-700">🏡 {deal.address}</p> : null}
                    <p className="mt-1 flex flex-wrap items-center gap-2 text-base">
                      {deal.value ? <span className="font-semibold">{usd(deal.value)}</span> : null}
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-sm font-semibold">{t(`sides.${deal.side}`)}</span>
                      {deal.overdueTasks ? <span className="rounded-full bg-red-100 px-2 py-0.5 text-sm font-semibold text-red-900">⚠️ {t("overdue", { count: deal.overdueTasks })}</span> : null}
                      {deal.daysInStage >= 14 && stage !== "CLOSED" && stage !== "LOST" ? (
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-sm font-semibold text-amber-950">{t("stale", { days: deal.daysInStage })}</span>
                      ) : null}
                    </p>
                    <label className="mt-3 block">
                      <span className="sr-only">{t("moveTo")}</span>
                      <select
                        value={deal.stage}
                        onChange={(e) => move(deal.id, e.target.value)}
                        className="block min-h-11 w-full cursor-pointer rounded-lg border-2 border-slate-300 bg-white px-2 text-base"
                        aria-label={`${t("moveTo")}: ${deal.title}`}
                      >
                        {DEAL_STAGES.map((s) => (
                          <option key={s} value={s}>{s === deal.stage ? `${t("moveTo")}…` : ts(s)}</option>
                        ))}
                      </select>
                    </label>
                  </li>
                ))}
                {column.length === 0 ? <li className="rounded-xl border-2 border-dashed border-slate-300 p-4 text-center text-base text-slate-600">{t("dropHere")}</li> : null}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}
