/** Phone models the photo/video modules tailor instructions for. */
export const PHONE_MODELS = [
  "iPhone 13", "iPhone 13 Pro", "iPhone 14", "iPhone 14 Pro", "iPhone 15", "iPhone 15 Pro",
  "iPhone 16", "iPhone 16 Pro", "iPhone 17", "iPhone 17 Pro",
  "Samsung Galaxy S22", "Samsung Galaxy S23", "Samsung Galaxy S24", "Samsung Galaxy S25",
  "Samsung Galaxy S22 Ultra", "Samsung Galaxy S23 Ultra", "Samsung Galaxy S24 Ultra", "Samsung Galaxy S25 Ultra",
  "Google Pixel 6", "Google Pixel 7", "Google Pixel 8", "Google Pixel 8 Pro", "Google Pixel 9", "Google Pixel 9 Pro",
  "Google Pixel 10", "Google Pixel 10 Pro",
  "Other Android phone", "Other / not sure",
] as const;

export function phoneFor(propertyPhone: string | null | undefined, profilePhone: string | null | undefined, chosen?: string) {
  return chosen && chosen !== "default" ? chosen : propertyPhone || profilePhone || "Other / not sure";
}
