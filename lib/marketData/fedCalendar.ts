type EconomicEvent = {
  date: string;
  country: string;
  event: string;
  actual: string | null;
  estimate: string | null;
  impact: string;
};

export async function fetchFedCalendarEvents(
  finnhubKey: string | undefined,
  macroSnapshot: { name: string; value: number | null; date: string | null }[],
): Promise<string> {
  const lines: string[] = [];

  for (const m of macroSnapshot) {
    if (m.value !== null) {
      lines.push(
        `- ${m.name}: ${m.value}${m.name.includes("Tipos") || m.name.includes("Desempleo") || m.name.includes("Bono") ? "%" : ""} (dato ${m.date ?? "reciente"})`,
      );
    }
  }

  if (!finnhubKey) {
    lines.push("");
    lines.push(
      "Calendario económico Finnhub no disponible (sin API key). Usar datos FRED arriba.",
    );
    return lines.join("\n");
  }

  const today = new Date();
  const from = new Date(today);
  from.setDate(from.getDate() - 1);
  const to = new Date(today);
  to.setDate(to.getDate() + 7);

  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  const url =
    `https://finnhub.io/api/v1/calendar/economic?from=${fmt(from)}&to=${fmt(to)}` +
    `&token=${finnhubKey}`;

  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) {
      lines.push("");
      lines.push("Calendario económico: no disponible temporalmente.");
      return lines.join("\n");
    }

    const payload = (await res.json()) as { economicCalendar?: EconomicEvent[] };
    const relevant = (payload.economicCalendar ?? [])
      .filter(
        (e) =>
          /fed|fomc|ecb|boe|cpi|inflation|unemployment|interest rate|tipos|ipc|desempleo/i.test(
            e.event,
          ) ||
          ["US", "EU", "GB", "DE", "FR"].includes(e.country),
      )
      .slice(0, 15);

    lines.push("");
    lines.push("Calendario macro (últimas 24h + próximos 7 días, Finnhub):");
    if (relevant.length === 0) {
      lines.push("- Sin eventos macro destacados en ventana");
    } else {
      for (const e of relevant) {
        const surprise =
          e.actual && e.estimate
            ? ` | Actual: ${e.actual} vs Est: ${e.estimate}`
            : "";
        lines.push(
          `- [${e.date}] ${e.country} — ${e.event}${surprise} (impacto: ${e.impact})`,
        );
      }
    }
  } catch {
    lines.push("");
    lines.push("Calendario económico: error al obtener datos.");
  }

  return lines.join("\n");
}
