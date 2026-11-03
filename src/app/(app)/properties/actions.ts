"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { fieldErrorsFrom, formObject, type ActionState } from "@/lib/actions";
import { audit } from "@/lib/audit";
import { requireContext } from "@/lib/auth/context";
import { effectivePlan, PLANS } from "@/lib/features";
import { PHONE_MODELS } from "@/modules/_shared/phones";

const optionalInt = z.coerce.number().int().min(0).max(2_000_000_000).optional();
const optionalNum = z.coerce.number().min(0).max(1000).optional();
const optionalText = (max: number) => z.string().max(max).optional();

const PROPERTY_TYPES = ["single_family", "condo", "townhouse", "multi_family", "manufactured", "land", "other"] as const;
const STATUSES = ["COMING_SOON", "ACTIVE", "PENDING", "SOLD", "OFF_MARKET"] as const;
const FACINGS = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"] as const;

const PropertySchema = z.object({
  address: z.string().min(1).max(200),
  unit: optionalText(40),
  city: z.string().min(1).max(100),
  state: z.string().min(2).max(2),
  zip: z.string().min(3).max(10),
  status: z.enum(STATUSES).default("ACTIVE"),
  propertyType: z.enum(PROPERTY_TYPES).default("single_family"),
  price: optionalInt,
  beds: optionalNum,
  baths: optionalNum,
  sqft: optionalInt,
  lotSize: optionalText(60),
  yearBuilt: z.coerce.number().int().min(1700).max(2100).optional(),
  stories: z.coerce.number().int().min(0).max(100).optional(),
  garage: optionalText(80),
  hoaFee: optionalInt,
  facing: z.enum(FACINGS).optional(),
  features: optionalText(2000),
  upgrades: optionalText(1500),
  outdoor: optionalText(1000),
  neighborhood: optionalText(1500),
  heroImageUrl: z.url().max(1000).optional(),
  openHouseAt: z.string().max(30).optional(),
  openHouseEnd: z.string().max(30).optional(),
  phoneModel: z.enum(PHONE_MODELS).optional(),
  privateNotes: optionalText(2000),
  soldPrice: optionalInt,
});

function toData(parsed: z.infer<typeof PropertySchema>) {
  const date = (v?: string) => (v ? new Date(v) : null);
  return {
    ...parsed,
    state: parsed.state.toUpperCase(),
    unit: parsed.unit ?? null,
    price: parsed.price ?? null,
    beds: parsed.beds ?? null,
    baths: parsed.baths ?? null,
    sqft: parsed.sqft ?? null,
    lotSize: parsed.lotSize ?? null,
    yearBuilt: parsed.yearBuilt ?? null,
    stories: parsed.stories ?? null,
    garage: parsed.garage ?? null,
    hoaFee: parsed.hoaFee ?? null,
    facing: parsed.facing ?? null,
    features: parsed.features ?? null,
    upgrades: parsed.upgrades ?? null,
    outdoor: parsed.outdoor ?? null,
    neighborhood: parsed.neighborhood ?? null,
    heroImageUrl: parsed.heroImageUrl ?? null,
    openHouseAt: date(parsed.openHouseAt),
    openHouseEnd: date(parsed.openHouseEnd),
    phoneModel: parsed.phoneModel ?? null,
    privateNotes: parsed.privateNotes ?? null,
    soldPrice: parsed.soldPrice ?? null,
  };
}

export async function createPropertyAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const ctx = await requireContext();
  const parsed = PropertySchema.safeParse(formObject(formData));
  if (!parsed.success) return { error: "errors.fixFields", fieldErrors: fieldErrorsFrom(parsed.error) };

  const plan = effectivePlan(ctx.tenant);
  if (!plan) return { error: "billing.inactiveBanner" };
  const limit = PLANS[plan].listingsPerMonth;
  if (limit !== null) {
    const start = new Date();
    start.setDate(1);
    start.setHours(0, 0, 0, 0);
    const count = await ctx.db.property.count({ where: { createdAt: { gte: start } } });
    if (count >= limit) return { error: "properties.limitReached" };
  }

  const property = await ctx.db.property.create({
    data: { tenantId: ctx.tenant.id, createdById: ctx.user.id, ...toData(parsed.data) },
  });
  await audit({ tenantId: ctx.tenant.id, userId: ctx.user.id, action: "property:create", entity: "property", entityId: property.id });
  redirect(`/properties/${property.id}?created=1`);
}

export async function updatePropertyAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const ctx = await requireContext();
  const id = String(formData.get("id") ?? "");
  const parsed = PropertySchema.safeParse(formObject(formData));
  if (!parsed.success) return { error: "errors.fixFields", fieldErrors: fieldErrorsFrom(parsed.error) };
  const existing = await ctx.db.property.findUnique({ where: { id } });
  if (!existing) return { error: "errors.notFound" };
  const data = toData(parsed.data);
  await ctx.db.property.update({
    where: { id },
    data: { ...data, soldAt: data.status === "SOLD" && !existing.soldAt ? new Date() : existing.soldAt },
  });
  await audit({ tenantId: ctx.tenant.id, userId: ctx.user.id, action: "property:update", entity: "property", entityId: id });
  revalidatePath(`/properties/${id}`);
  redirect(`/properties/${id}?saved=1`);
}

export async function deletePropertyAction(formData: FormData): Promise<void> {
  const ctx = await requireContext();
  const id = String(formData.get("id") ?? "");
  await ctx.db.property.deleteMany({ where: { id } });
  await audit({ tenantId: ctx.tenant.id, userId: ctx.user.id, action: "property:delete", entity: "property", entityId: id });
  redirect("/properties?deleted=1");
}
