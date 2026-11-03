import type { Task } from "@prisma/client";
import Link from "next/link";
import { getFormatter, getTranslations } from "next-intl/server";
import { addTaskAction, toggleTaskAction } from "@/app/(app)/contacts/actions";
import { Field, Input } from "@/components/ui";
import { SubmitButton } from "@/components/ui/SubmitButton";

type TaskRow = Task & { contact?: { id: string; firstName: string; lastName: string | null } | null; deal?: { id: string; title: string } | null };

export async function TaskList({
  tasks,
  back,
  contactId,
  dealId,
  showLinks = false,
  showForm = true,
}: {
  tasks: TaskRow[];
  back: string;
  contactId?: string;
  dealId?: string;
  showLinks?: boolean;
  showForm?: boolean;
}) {
  const t = await getTranslations("crm.tasks");
  const format = await getFormatter();
  const now = new Date();
  return (
    <div className="space-y-4">
      {showForm ? (
        <form action={addTaskAction} className="grid gap-4 rounded-2xl border-2 border-slate-200 bg-white p-5 md:grid-cols-[1fr_14rem_auto]">
          <input type="hidden" name="back" value={back} />
          {contactId ? <input type="hidden" name="contactId" value={contactId} /> : null}
          {dealId ? <input type="hidden" name="dealId" value={dealId} /> : null}
          <Field label={t("newTask")} htmlFor="taskTitle">
            <Input id="taskTitle" name="title" placeholder={t("placeholder")} required />
          </Field>
          <Field label={t("due")} htmlFor="taskDue" optional optionalLabel="">
            <Input id="taskDue" name="dueAt" type="datetime-local" />
          </Field>
          <div className="flex items-end">
            <SubmitButton pendingText={t("adding")}>{t("addButton")}</SubmitButton>
          </div>
        </form>
      ) : null}
      {tasks.length === 0 ? (
        <p className="text-lg text-slate-700">{t("empty")}</p>
      ) : (
        <ul className="space-y-2">
          {tasks.map((task) => {
            const overdue = !task.completedAt && task.dueAt && task.dueAt < now;
            return (
              <li key={task.id} className={`flex items-start gap-4 rounded-xl border-2 bg-white p-4 ${overdue ? "border-red-300" : "border-slate-200"}`}>
                <form action={toggleTaskAction}>
                  <input type="hidden" name="id" value={task.id} />
                  <input type="hidden" name="back" value={back} />
                  <button
                    aria-label={task.completedAt ? t("markNotDone", { title: task.title }) : t("markDone", { title: task.title })}
                    aria-pressed={Boolean(task.completedAt)}
                    className={`flex size-10 items-center justify-center rounded-lg border-2 text-xl ${
                      task.completedAt ? "border-green-700 bg-green-700 text-white" : "border-slate-400 bg-white hover:border-brand-600"
                    }`}
                  >
                    {task.completedAt ? "✓" : ""}
                  </button>
                </form>
                <div className="min-w-0 flex-1">
                  <p className={`text-lg ${task.completedAt ? "text-slate-500 line-through" : "font-semibold"}`}>{task.title}</p>
                  <p className={`text-base ${overdue ? "font-semibold text-red-700" : "text-slate-700"}`}>
                    {task.dueAt ? `${overdue ? t("overdue") + " · " : ""}${format.dateTime(task.dueAt, { dateStyle: "medium", timeStyle: "short" })}` : t("noDueDate")}
                    {showLinks && task.contact ? (
                      <>
                        {" · "}
                        <Link href={`/contacts/${task.contact.id}`} className="font-semibold text-brand-800 underline">
                          {task.contact.firstName} {task.contact.lastName ?? ""}
                        </Link>
                      </>
                    ) : null}
                    {showLinks && task.deal ? (
                      <>
                        {" · "}
                        <Link href={`/deals/${task.deal.id}`} className="font-semibold text-brand-800 underline">{task.deal.title}</Link>
                      </>
                    ) : null}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
