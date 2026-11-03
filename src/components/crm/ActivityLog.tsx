import type { Activity } from "@prisma/client";
import { getFormatter, getTranslations } from "next-intl/server";
import { logActivityAction } from "@/app/(app)/contacts/actions";
import { Field, Input, Select, Textarea } from "@/components/ui";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { ACTIVITY_TYPES } from "@/lib/crm";

const ICONS: Record<string, string> = {
  CALL: "📞", EMAIL: "✉️", TEXT: "💬", MEETING: "🤝", SHOWING: "🏠", LEAD: "🔔", STAGE_CHANGE: "📋", OTHER: "📝",
};

export async function ActivityLog({ activities, contactId, dealId }: { activities: Activity[]; contactId?: string; dealId?: string }) {
  const t = await getTranslations("crm.activity");
  const format = await getFormatter();
  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-bold">🕒 {t("title")}</h2>
      <form action={logActivityAction} className="grid gap-4 rounded-2xl border-2 border-slate-200 bg-white p-5 md:grid-cols-[10rem_10rem_1fr_auto]">
        {contactId ? <input type="hidden" name="contactId" value={contactId} /> : null}
        {dealId ? <input type="hidden" name="dealId" value={dealId} /> : null}
        <Field label={t("type")} htmlFor="activityType">
          <Select id="activityType" name="type" defaultValue="CALL">
            {ACTIVITY_TYPES.map((a) => <option key={a} value={a}>{t(`types.${a}`)}</option>)}
          </Select>
        </Field>
        <Field label={t("direction")} htmlFor="direction">
          <Select id="direction" name="direction" defaultValue="OUTBOUND">
            <option value="OUTBOUND">{t("outbound")}</option>
            <option value="INBOUND">{t("inbound")}</option>
          </Select>
        </Field>
        <Field label={t("summary")} htmlFor="summary">
          <Input id="summary" name="summary" placeholder={t("summaryPlaceholder")} required />
        </Field>
        <div className="flex items-end">
          <SubmitButton pendingText={t("logging")}>{t("logButton")}</SubmitButton>
        </div>
      </form>
      {activities.length === 0 ? (
        <p className="text-lg text-slate-700">{t("empty")}</p>
      ) : (
        <ol className="space-y-2">
          {activities.map((a) => (
            <li key={a.id} className="flex gap-3 rounded-xl border-2 border-slate-200 bg-white p-4">
              <span className="text-2xl" aria-hidden>{ICONS[a.type] ?? "📝"}</span>
              <div className="min-w-0 flex-1">
                <p className="text-lg">{a.summary}</p>
                <p className="text-base text-slate-700">
                  {t(`types.${a.type}`)} · {a.direction === "INBOUND" ? t("inbound") : a.direction === "OUTBOUND" ? t("outbound") : ""} ·{" "}
                  {format.dateTime(a.occurredAt, { dateStyle: "medium", timeStyle: "short" })}
                </p>
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

export async function NotesPanel({
  notes,
  contactId,
  dealId,
  action,
}: {
  notes: { id: string; body: string; createdAt: Date }[];
  contactId?: string;
  dealId?: string;
  action: (formData: FormData) => Promise<void>;
}) {
  const t = await getTranslations("crm.notes");
  const format = await getFormatter();
  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-bold">📝 {t("title")}</h2>
      <form action={action} className="space-y-3 rounded-2xl border-2 border-slate-200 bg-white p-5">
        {contactId ? <input type="hidden" name="contactId" value={contactId} /> : null}
        {dealId ? <input type="hidden" name="dealId" value={dealId} /> : null}
        <label htmlFor="noteBody" className="sr-only">{t("title")}</label>
        <Textarea id="noteBody" name="body" placeholder={t("placeholder")} className="min-h-24" required />
        <SubmitButton pendingText={t("adding")} variant="secondary">{t("addButton")}</SubmitButton>
      </form>
      {notes.map((n) => (
        <div key={n.id} className="rounded-xl border-2 border-amber-200 bg-amber-50 p-4">
          <p className="whitespace-pre-wrap text-lg">{n.body}</p>
          <p className="mt-2 text-base text-slate-700">{format.dateTime(n.createdAt, { dateStyle: "medium", timeStyle: "short" })}</p>
        </div>
      ))}
    </section>
  );
}
