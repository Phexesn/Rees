"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

/** Time-of-day greeting from the agent's own device clock (the server runs in UTC). */
export function Greeting({ name }: { name: string }) {
  const t = useTranslations("dashboard");
  const [hour, setHour] = useState<number | null>(null);
  useEffect(() => setHour(new Date().getHours()), []);
  const text =
    hour === null
      ? t("welcome", { name })
      : hour < 12
        ? t("morning", { name })
        : hour < 18
          ? t("afternoon", { name })
          : t("evening", { name });
  return <h1 className="text-3xl font-bold md:text-4xl">{text}</h1>;
}
