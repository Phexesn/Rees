/**
 * Creates (or refreshes) a demo account with listings, contacts, deals, tasks
 * and a published listing page.
 *
 *   npm run db:seed
 *   → sign in as demo@realtyboost.app / demo-password-123
 */
import { hashPassword } from "@/lib/auth/password";
import { systemDb, withSystemTx } from "@/lib/db";
import { checklistTemplate } from "@/lib/crm";
import { SAMPLE_LISTINGS } from "./sample-data";

const EMAIL = "demo@realtyboost.app";
const PASSWORD = "demo-password-123";

async function main() {
  const existing = await systemDb().user.findUnique({ where: { email: EMAIL } });
  if (existing) {
    await systemDb().tenant.delete({ where: { id: existing.tenantId } });
    console.log("Removed previous demo account.");
  }
  const passwordHash = await hashPassword(PASSWORD);
  const now = Date.now();
  const days = (n: number) => new Date(now + n * 86_400_000);

  await withSystemTx(async (tx) => {
    const tenant = await tx.tenant.create({
      data: { name: "Demo Realty", plan: "PRO", subscriptionStatus: "TRIALING", trialEndsAt: days(14) },
    });
    const user = await tx.user.create({
      data: { tenantId: tenant.id, email: EMAIL, passwordHash, name: "Linda Tran", role: "OWNER" },
    });
    await tx.agentProfile.create({
      data: {
        tenantId: tenant.id, userId: user.id, displayName: "Linda Tran", email: EMAIL, phone: "(555) 201-3344",
        brokerage: "Sunrise Realty Group", licenseNumber: "01234567", licenseState: "CA",
        marketsServed: "Garden Grove, Westminster, Fountain Valley", brandTone: "warm",
        phoneModel: "iPhone 15 Pro", contentLanguage: "en", extraLanguages: ["vi", "es"],
        bio: "I've helped families in Orange County buy and sell homes for 18 years. Tôi nói tiếng Việt.",
        setupCompletedAt: new Date(),
      },
    });

    const properties = [];
    for (const listing of SAMPLE_LISTINGS) {
      properties.push(
        await tx.property.create({ data: { tenantId: tenant.id, createdById: user.id, status: "ACTIVE", ...listing } }),
      );
    }
    await tx.microsite.create({
      data: {
        tenantId: tenant.id, propertyId: properties[2].id, slug: "demo-3910-sycamore-court", published: true, language: "en",
        headline: "Single-story Garden Grove home with owned solar and a big backyard",
        intro: "Four bedrooms, three baths and a remodeled kitchen on one level — with fruit trees out back and solar panels that are already paid off.",
        highlights: ["Single-story, 1,980 sq ft", "Remodeled kitchen with island", "Owned solar (2020)", "Copper repipe (2019)", "Large backyard with fruit trees"],
        body: "The kitchen opens to a separate family room, and a bedroom with its own full bath works well as a guest suite.\n\nShopping on Brookhurst St is minutes away, and the 22 freeway is about 5 minutes from the front door.",
        views: 37,
      },
    });

    const people = [
      { firstName: "Luis", lastName: "Garcia", email: "luis@example.com", phone: "555-123-9876", source: "MICROSITE", status: "NEW", roles: ["BUYER"], preferredLanguage: "es", priceMin: 400000, priceMax: 550000, bedsMin: 3 },
      { firstName: "Mai", lastName: "Nguyen", email: "mai@example.com", phone: "555-222-1111", source: "REFERRAL", status: "ACTIVE", roles: ["BUYER"], preferredLanguage: "vi", priceMin: 900000, priceMax: 1100000, bedsMin: 4 },
      { firstName: "Robert", lastName: "Hayes", email: "rhayes@example.com", phone: "555-333-4444", source: "SPHERE", status: "ACTIVE", roles: ["SELLER"], preferredLanguage: "en" },
      { firstName: "Ji-woo", lastName: "Park", email: "jiwoo@example.com", phone: "555-444-5555", source: "OPEN_HOUSE", status: "NURTURE", roles: ["BUYER"], preferredLanguage: "ko", priceMin: 500000, priceMax: 600000 },
      { firstName: "Karen", lastName: "Whitfield", email: "karen@example.com", phone: "555-555-6666", source: "PAST_CLIENT", status: "PAST_CLIENT", roles: ["PAST_CLIENT", "SELLER"], preferredLanguage: "en" },
    ] as const;
    const contacts = [];
    for (const p of people) {
      contacts.push(
        await tx.contact.create({
          data: { tenantId: tenant.id, ...p, roles: [...p.roles], tags: p.preferredLanguage !== "en" ? [`speaks-${p.preferredLanguage}`] : [] },
        }),
      );
    }

    const deals = [
      { title: "Luis — buying in Plano", contact: 0, property: 0, side: "BUYER", stage: "NEW_LEAD", value: 489000 },
      { title: "Mai — Garden Grove home", contact: 1, property: 2, side: "BUYER", stage: "UNDER_CONTRACT", value: 1035000, contractDate: days(-6) },
      { title: "Robert — selling his condo", contact: 2, property: 1, side: "SELLER", stage: "ACTIVE", value: 925000 },
      { title: "Ji-woo — townhouse search", contact: 3, property: 3, side: "BUYER", stage: "NURTURE", value: 565000 },
      { title: "Karen — sold 2025", contact: 4, property: null, side: "SELLER", stage: "CLOSED", value: 610000 },
    ] as const;
    let position = 0;
    for (const d of deals) {
      const deal = await tx.deal.create({
        data: {
          tenantId: tenant.id, title: d.title, contactId: contacts[d.contact].id,
          propertyId: d.property === null ? null : properties[d.property].id,
          side: d.side, stage: d.stage, value: d.value, commissionPct: 2.5, position: position++,
          contractDate: "contractDate" in d ? d.contractDate : null,
          closedAt: d.stage === "CLOSED" ? days(-200) : null,
        },
      });
      if (d.stage === "UNDER_CONTRACT") {
        await tx.checklistItem.createMany({
          data: checklistTemplate(d.side, deal.contractDate).map((item, i) => ({
            tenantId: tenant.id, dealId: deal.id, ...item, completedAt: i < 5 ? days(-3) : null,
          })),
        });
      }
    }

    await tx.task.createMany({
      data: [
        { tenantId: tenant.id, title: "Call Luis — new lead from 1248 Maple Grove Lane", dueAt: days(0), priority: 1, contactId: contacts[0].id, assignedToId: user.id },
        { tenantId: tenant.id, title: "Send Mai the inspection summary", dueAt: days(-1), contactId: contacts[1].id, assignedToId: user.id },
        { tenantId: tenant.id, title: "Price review with Robert", dueAt: days(2), contactId: contacts[2].id, assignedToId: user.id },
        { tenantId: tenant.id, title: "Holiday card to past clients", dueAt: days(20), assignedToId: user.id },
      ],
    });
    await tx.activity.createMany({
      data: [
        { tenantId: tenant.id, type: "LEAD", direction: "INBOUND", contactId: contacts[0].id, summary: "Asked about 1248 Maple Grove Lane: Schedule a private showing" },
        { tenantId: tenant.id, type: "CALL", direction: "OUTBOUND", contactId: contacts[1].id, summary: "Walked through inspection results; buyer wants a credit for the water heater", occurredAt: days(-1) },
        { tenantId: tenant.id, type: "SHOWING", direction: "OUTBOUND", contactId: contacts[3].id, summary: "Showed 512 Peachtree Hollow; liked the layout, worried about HOA", occurredAt: days(-5) },
      ],
    });
  });
  console.log(`Demo account ready. Sign in as ${EMAIL} / ${PASSWORD}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
