import type { Contact, Prisma, Property } from "@prisma/client";

/** Listings that fit a buyer's stated preferences (budget, beds, baths, home type). */
export function listingsForBuyerWhere(c: Pick<Contact, "priceMin" | "priceMax" | "bedsMin" | "bathsMin" | "propertyTypes">): Prisma.PropertyWhereInput {
  return {
    status: { in: ["ACTIVE", "COMING_SOON"] },
    ...(c.priceMin || c.priceMax ? { price: { ...(c.priceMin ? { gte: c.priceMin } : {}), ...(c.priceMax ? { lte: c.priceMax } : {}) } } : {}),
    ...(c.bedsMin ? { beds: { gte: c.bedsMin } } : {}),
    ...(c.bathsMin ? { baths: { gte: c.bathsMin } } : {}),
    ...(c.propertyTypes.length ? { propertyType: { in: c.propertyTypes } } : {}),
  };
}

/** Buyers whose preferences fit a listing. Contacts with no preferences are not matched. */
export function buyersForListingWhere(p: Pick<Property, "price" | "beds" | "baths" | "propertyType">): Prisma.ContactWhereInput {
  return {
    roles: { has: "BUYER" },
    status: { notIn: ["DO_NOT_CONTACT", "PAST_CLIENT"] },
    OR: [{ priceMin: { not: null } }, { priceMax: { not: null } }, { bedsMin: { not: null } }],
    AND: [
      p.price ? { OR: [{ priceMin: null }, { priceMin: { lte: p.price } }] } : {},
      p.price ? { OR: [{ priceMax: null }, { priceMax: { gte: p.price } }] } : {},
      p.beds !== null ? { OR: [{ bedsMin: null }, { bedsMin: { lte: p.beds } }] } : {},
      p.baths !== null ? { OR: [{ bathsMin: null }, { bathsMin: { lte: p.baths } }] } : {},
      { OR: [{ propertyTypes: { isEmpty: true } }, { propertyTypes: { has: p.propertyType } }] },
    ],
  };
}

export function hasBuyerPreferences(c: Pick<Contact, "priceMin" | "priceMax" | "bedsMin" | "bathsMin" | "roles">): boolean {
  return c.roles.includes("BUYER") && Boolean(c.priceMin || c.priceMax || c.bedsMin || c.bathsMin);
}
