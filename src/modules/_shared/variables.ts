import type { AgentProfile, Contact, Property } from "@prisma/client";

/**
 * Shared prompt-variable builders. Prompts receive plain text blocks, never
 * raw database objects, so prompt authors can read exactly what the model sees.
 */

const TYPE_LABELS: Record<string, string> = {
  single_family: "Single-family home",
  condo: "Condo",
  townhouse: "Townhouse",
  multi_family: "Multi-family",
  manufactured: "Manufactured home",
  land: "Land / lot",
  other: "Other",
};

const FACING: Record<string, string> = {
  N: "north", NE: "northeast", E: "east", SE: "southeast",
  S: "south", SW: "southwest", W: "west", NW: "northwest",
};

export function money(value: number | null | undefined): string {
  if (value === null || value === undefined) return "";
  return `$${value.toLocaleString("en-US")}`;
}

function line(label: string, value: string | number | null | undefined): string | null {
  if (value === null || value === undefined || String(value).trim() === "") return null;
  return `- ${label}: ${value}`;
}

export function propertyFacts(p: Property | null): string {
  if (!p) return "(No specific listing — write general guidance.)";
  const address = [p.address, p.unit ? `Unit ${p.unit}` : null, `${p.city}, ${p.state} ${p.zip}`]
    .filter(Boolean)
    .join(", ");
  return [
    line("Address", address),
    line("Status", p.status.replace(/_/g, " ").toLowerCase()),
    line("Property type", TYPE_LABELS[p.propertyType] ?? p.propertyType),
    line("List price", money(p.price)),
    line("Bedrooms", p.beds),
    line("Bathrooms", p.baths),
    line("Interior size", p.sqft ? `${p.sqft.toLocaleString("en-US")} sq ft` : null),
    line("Lot size", p.lotSize),
    line("Year built", p.yearBuilt),
    line("Stories", p.stories),
    line("Garage / parking", p.garage),
    line("HOA fee", p.hoaFee ? `${money(p.hoaFee)}/month` : null),
    line("Front of house faces", p.facing ? FACING[p.facing] ?? p.facing : null),
    line("Key features", p.features),
    line("Recent upgrades", p.upgrades),
    line("Outdoor spaces", p.outdoor),
    line("Location & nearby (agent-provided facts)", p.neighborhood),
    line(
      "Open house",
      p.openHouseAt
        ? `${p.openHouseAt.toLocaleString("en-US", { dateStyle: "full", timeStyle: "short" })}${
            p.openHouseEnd ? ` to ${p.openHouseEnd.toLocaleTimeString("en-US", { timeStyle: "short" })}` : ""
          }`
        : null,
    ),
    line("Sold price", p.soldPrice ? money(p.soldPrice) : null),
  ]
    .filter(Boolean)
    .join("\n");
}

export function agentBlock(profile: AgentProfile | null): string {
  if (!profile) return "(Agent details not provided.)";
  return [
    line("Agent name", profile.displayName),
    line("Brokerage", profile.brokerage),
    line("Phone", profile.phone),
    line("Email", profile.email),
    line("License", profile.licenseNumber ? `${profile.licenseState ?? ""} #${profile.licenseNumber}`.trim() : null),
    line("Areas served", profile.marketsServed),
  ]
    .filter(Boolean)
    .join("\n");
}

const TONES: Record<string, string> = {
  warm: "Warm and welcoming — friendly, sincere, never gushing.",
  professional: "Polished and professional — clear, confident, concise.",
  luxury: "Refined and elegant — understated luxury, precise details, no hype.",
  friendly: "Casual and upbeat — conversational, like a helpful neighbor.",
  straightforward: "Plain and straightforward — facts first, short sentences.",
};

export function brandVoice(profile: AgentProfile | null): string {
  const tone = TONES[profile?.brandTone ?? "warm"] ?? TONES.warm;
  const parts = [`Tone: ${tone}`];
  if (profile?.brandVoiceNotes) parts.push(`Agent's own notes on their voice: ${profile.brandVoiceNotes}`);
  if (profile?.wordsToAvoid) parts.push(`Words and phrases the agent never wants used: ${profile.wordsToAvoid}`);
  return parts.join("\n");
}

export function contactBlock(c: Contact | null): string {
  if (!c) return "";
  const prefs = [
    c.priceMin || c.priceMax ? `Budget ${money(c.priceMin) || "?"} – ${money(c.priceMax) || "?"}` : null,
    c.bedsMin ? `${c.bedsMin}+ bedrooms` : null,
    c.areas ? `Areas: ${c.areas}` : null,
    c.mustHaves ? `Must-haves: ${c.mustHaves}` : null,
    c.timeline ? `Timeline: ${c.timeline}` : null,
    c.preApproved ? "Pre-approved for a mortgage" : null,
  ].filter(Boolean);
  return [
    line("First name", c.firstName),
    line("Roles", c.roles.join(", ")),
    line("How they found the agent", c.source.replace(/_/g, " ").toLowerCase()),
    line("Details", c.sourceDetail),
    line("Preferred language", c.preferredLanguage),
    prefs.length ? `- Stated preferences: ${prefs.join("; ")}` : null,
  ]
    .filter(Boolean)
    .join("\n");
}

export function todayLong(): string {
  return new Date().toLocaleDateString("en-US", { dateStyle: "full" });
}
