// Store details shown across the site. Brand name, logo and phone are
// final; the other contact details are still placeholders (docs/PLAN.md,
// decision 6). Empty contact fields are hidden.
export const site = {
  name: "Farista",
  tagline: "নতুন ট্রেন্ডের পোশাক",
  description:
    "বাছাই করা মানসম্মত পোশাক, ক্যাশ অন ডেলিভারিতে সারা বাংলাদেশে পৌঁছে দেওয়া হয়।",
  // Mobile number shown to customers, e.g. "01712345678".
  phone: "01883727155",
  // WhatsApp number in international format without "+", e.g. "8801712345678".
  whatsapp: "",
  email: "",
  facebookUrl: "",
  instagramUrl: "",
  address: "টাঙ্গাইল, বাংলাদেশ",
  // Prefix for order numbers, e.g. "FR-000123".
  orderPrefix: "FR",
  // Earlier prefixes, still accepted so old order links keep working.
  legacyOrderPrefixes: ["TS"],
  // Where customers send the delivery charge before ordering
  // (features/checkout). Personal mobile banking number, "Send Money".
  deliveryPayment: {
    number: "01883727155",
    wallets: "বিকাশ / নগদ",
  },
} as const;

export function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
}
