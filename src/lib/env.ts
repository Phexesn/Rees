/** Typed access to environment variables. Names only — never log values. */
export const env = {
  appUrl: () => process.env.APP_URL ?? "http://localhost:3000",
  isProd: () => process.env.NODE_ENV === "production",
  adminEmails: () =>
    (process.env.ADMIN_EMAILS ?? "")
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean),
  llmProviderOverride: () => process.env.LLM_PROVIDER?.trim() || undefined,
  llmModelFor: (provider: string) => process.env[`LLM_MODEL_${provider.toUpperCase()}`]?.trim() || undefined,
  anthropicKey: () => process.env.ANTHROPIC_API_KEY,
  openaiKey: () => process.env.OPENAI_API_KEY,
  googleKey: () => process.env.GOOGLE_API_KEY ?? process.env.GEMINI_API_KEY,
  stripeSecret: () => process.env.STRIPE_SECRET_KEY,
  stripeWebhookSecret: () => process.env.STRIPE_WEBHOOK_SECRET,
  stripePrice: (plan: "SOLO" | "PRO" | "TEAM") => process.env[`STRIPE_PRICE_${plan}`],
  resendKey: () => process.env.RESEND_API_KEY,
  emailFrom: () => process.env.EMAIL_FROM ?? "RealtyBoost <onboarding@resend.dev>",
  /** Dev billing lets you switch plans without Stripe. Never on in production. */
  devBillingEnabled: () => !process.env.STRIPE_SECRET_KEY && process.env.NODE_ENV !== "production",
};
