// Seeds baseline data. Safe to run repeatedly (upserts by unique key).
// Run with: npm run db:seed
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, type Prisma } from "../lib/generated/prisma/client";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is not set");

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

const categories = [
  {
    slug: "men",
    name: "ছেলেদের পোশাক",
    description: "শার্ট, টি-শার্ট, পাঞ্জাবি ও প্যান্ট।",
  },
  {
    slug: "women",
    name: "মেয়েদের পোশাক",
    description: "কুর্তি, থ্রি-পিস ও টপস।",
  },
  {
    slug: "kids",
    name: "বাচ্চাদের পোশাক",
    description: "প্রতিদিনের আরামদায়ক বাচ্চাদের পোশাক।",
  },
];

type SampleProduct = Omit<Prisma.ProductUncheckedCreateInput, "categoryId"> & {
  categorySlug: string;
};

// Placeholder products without photos (add real products and images from
// the admin). Slugs and codes stay in English; everything shown in the UI
// is Bengali.
const products: SampleProduct[] = [
  {
    code: "SH-001",
    slug: "white-cotton-shirt",
    name: "সাদা কটন শার্ট",
    categorySlug: "men",
    description: "নরম সুতি কাপড়ের ক্লাসিক ফুল হাতা শার্ট।",
    fabric: "সুতি",
    color: "সাদা",
    size: "M, L, XL",
    regularPrice: 1250,
    isFeatured: true,
  },
  {
    code: "PJ-001",
    slug: "navy-panjabi",
    name: "নেভি ব্লু পাঞ্জাবি",
    categorySlug: "men",
    description: "উৎসবের জন্য হালকা এমব্রয়ডারি করা পাঞ্জাবি।",
    fabric: "কটন ব্লেন্ড",
    color: "নেভি ব্লু",
    size: "38, 40, 42, 44",
    regularPrice: 2200,
    salePrice: 1950,
  },
  {
    code: "KT-001",
    slug: "printed-kurti",
    name: "প্রিন্টেড কুর্তি",
    categorySlug: "women",
    description: "প্রতিদিনের জন্য আরামদায়ক প্রিন্টেড কুর্তি।",
    fabric: "লিনেন",
    color: "সবুজ",
    size: "S, M, L",
    regularPrice: 1450,
    isFeatured: true,
  },
  {
    code: "TP-001",
    slug: "georgette-three-piece",
    name: "জর্জেট থ্রি-পিস",
    categorySlug: "women",
    description: "ওড়না ও সালোয়ারসহ জর্জেট থ্রি-পিস।",
    fabric: "জর্জেট",
    color: "মেরুন",
    size: "ফ্রি সাইজ",
    careInstructions: "ঠান্ডা পানিতে হাতে ধুয়ে নিন।",
    regularPrice: 3200,
  },
  {
    code: "KD-001",
    slug: "kids-cotton-tshirt",
    name: "বাচ্চাদের কটন টি-শার্ট",
    categorySlug: "kids",
    description: "নরম সুতি কাপড়ের হাফ হাতা টি-শার্ট।",
    fabric: "সুতি",
    color: "হলুদ",
    size: "২-৩, ৪-৫, ৬-৭ বছর",
    regularPrice: 550,
  },
];

// Order-level discount, matched by name so re-seeding does not duplicate it.
const sampleDiscount = {
  name: "৳200 off orders over ৳5,000",
  amount: 200,
  minOrderValue: 5000,
};

async function main() {
  for (const [sortOrder, category] of categories.entries()) {
    await db.category.upsert({
      where: { slug: category.slug },
      update: { name: category.name, description: category.description, sortOrder },
      create: { ...category, sortOrder },
    });
  }
  console.log(`Seeded ${categories.length} categories.`);

  const categoryIds = new Map(
    (await db.category.findMany({ select: { id: true, slug: true } })).map(
      (category) => [category.slug, category.id],
    ),
  );
  for (const { categorySlug, ...product } of products) {
    const categoryId = categoryIds.get(categorySlug);
    if (!categoryId) throw new Error(`Unknown category: ${categorySlug}`);
    await db.product.upsert({
      where: { code: product.code },
      update: { ...product, categoryId },
      create: { ...product, categoryId },
    });
  }
  console.log(`Seeded ${products.length} products.`);

  const existingDiscount = await db.discount.findFirst({
    where: { name: sampleDiscount.name },
  });
  if (!existingDiscount) await db.discount.create({ data: sampleDiscount });
  console.log("Seeded 1 discount.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
