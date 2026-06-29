import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

// Postgres driver adapter — supplies the connection string to Prisma 7.
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// Shared demo password for every seeded account (hashed once, reused).
const DEMO_PASSWORD = "Password123!";

// Curated product catalog — realistic names, TND prices and Unsplash imagery.
const CATALOG: Record<
  string,
  { name: string; description: string; price: number; image: string }[]
> = {
  "All-Purpose Cleaners": [
    {
      name: "Multi-Surface Cleaner 750ml",
      description: "Powerful streak-free spray for all surfaces.",
      price: 4.2,
      image:
        "https://images.unsplash.com/photo-1585421514738-01798e348b17?auto=format&fit=crop&w=800&q=80",
    },
    {
      name: "Glass & Window Cleaner 500ml",
      description: "Ammonia-free formula for sparkling windows.",
      price: 3.8,
      image:
        "https://images.unsplash.com/photo-1625601154513-ee9600b6f86a?auto=format&fit=crop&w=800&q=80",
    },
    {
      name: "Disinfectant Spray 1L",
      description: "Kills 99.9% of bacteria and viruses.",
      price: 6.5,
      image:
        "https://images.unsplash.com/photo-1584483766114-2cea6facdf57?auto=format&fit=crop&w=800&q=80",
    },
    {
      name: "Bathroom Cleaner 750ml",
      description: "Removes limescale and soap scum effortlessly.",
      price: 5.2,
      image:
        "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?auto=format&fit=crop&w=800&q=80",
    },
  ],
  "Floor Care": [
    {
      name: "Floor Detergent 1L",
      description: "Concentrated cleaner for all floor types.",
      price: 7.9,
      image:
        "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80",
    },
    {
      name: "Wood Floor Cleaner 750ml",
      description: "Gentle pH-balanced formula for parquet.",
      price: 8.4,
      image:
        "https://images.unsplash.com/photo-1565022536046-1b5e271cfe33?auto=format&fit=crop&w=800&q=80",
    },
    {
      name: "Carpet Shampoo 500ml",
      description: "Deep-cleaning foam for carpets and rugs.",
      price: 9.9,
      image:
        "https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?auto=format&fit=crop&w=800&q=80",
    },
  ],
  "Kitchen & Dish": [
    {
      name: "Dish Soap 500ml",
      description: "Grease-cutting liquid with lemon scent.",
      price: 2.8,
      image:
        "https://images.unsplash.com/photo-1621771530494-0b154e05847e?auto=format&fit=crop&w=800&q=80",
    },
    {
      name: "Dishwasher Tablets x30",
      description: "All-in-one tablets with rinse aid.",
      price: 11.5,
      image:
        "https://images.unsplash.com/photo-1590439597480-92d3a1c25c4a?auto=format&fit=crop&w=800&q=80",
    },
    {
      name: "Degreaser Spray 500ml",
      description: "Powerful kitchen degreaser for stovetops.",
      price: 4.9,
      image:
        "https://images.unsplash.com/photo-1567609758157-0fc34b1093f4?auto=format&fit=crop&w=800&q=80",
    },
    {
      name: "Kitchen Surface Wipes x60",
      description: "Antibacterial wipes for countertops.",
      price: 3.5,
      image:
        "https://images.unsplash.com/photo-1607453998774-d533f65dac99?auto=format&fit=crop&w=800&q=80",
    },
  ],
  Laundry: [
    {
      name: "Laundry Liquid 1L",
      description: "Concentrated detergent for bright colours.",
      price: 8.9,
      image:
        "https://images.unsplash.com/photo-1597039463299-7b0b003ee6e0?auto=format&fit=crop&w=800&q=80",
    },
    {
      name: "Fabric Softener 750ml",
      description: "Leaves clothes soft and fresh-scented.",
      price: 5.4,
      image:
        "https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?auto=format&fit=crop&w=800&q=80",
    },
    {
      name: "Stain Remover Stick",
      description: "Targeted stain treatment for tough marks.",
      price: 4.2,
      image:
        "https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&w=800&q=80",
    },
  ],
  "Mops & Tools": [
    {
      name: "Microfiber Mop Pad x3",
      description: "Reusable washable mop pads.",
      price: 6.2,
      image:
        "https://images.unsplash.com/photo-1565022536046-1b5e271cfe33?auto=format&fit=crop&w=800&q=80",
    },
    {
      name: "Sponge Cloth Pack x5",
      description: "Highly absorbent cellulose cloths.",
      price: 2.4,
      image:
        "https://images.unsplash.com/photo-1567609758157-0fc34b1093f4?auto=format&fit=crop&w=800&q=80",
    },
    {
      name: "Scrub Brush Set",
      description: "3-piece set for tough grime.",
      price: 5.9,
      image:
        "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?auto=format&fit=crop&w=800&q=80",
    },
    {
      name: "Rubber Gloves Medium",
      description: "Reusable heavy-duty cleaning gloves.",
      price: 3.2,
      image:
        "https://images.unsplash.com/photo-1584483766114-2cea6facdf57?auto=format&fit=crop&w=800&q=80",
    },
  ],
  "Trash & Organization": [
    {
      name: "Trash Bags 50L x20",
      description: "Extra-strong drawstring garbage bags.",
      price: 4.8,
      image:
        "https://images.unsplash.com/photo-1607453998774-d533f65dac99?auto=format&fit=crop&w=800&q=80",
    },
    {
      name: "Trash Bags 100L x15",
      description: "Large industrial-grade waste bags.",
      price: 6.9,
      image:
        "https://images.unsplash.com/photo-1607453998774-d533f65dac99?auto=format&fit=crop&w=800&q=80",
    },
  ],
};

async function main() {
  console.log("🌱 Seeding database...");

  // Clear existing data in FK-safe order so the seed is repeatable.
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.inventory.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.event.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.vendingSpot.deleteMany();
  await prisma.user.deleteMany();

  const password = await bcrypt.hash(DEMO_PASSWORD, 10);

  // 1. Vending spots (boutiques) + central warehouse.
  const spots = await Promise.all([
    prisma.vendingSpot.create({
      data: {
        name: "Central Warehouse",
        location: "Tunis",
        address: "Zone Industrielle, Tunis",
        phone: "+216 71 000 000",
        isWarehouse: true,
      },
    }),
    prisma.vendingSpot.create({
      data: {
        name: "Lac Boutique",
        location: "Les Berges du Lac",
        address: "Rue du Lac, Tunis",
        phone: "+216 71 000 111",
      },
    }),
    prisma.vendingSpot.create({
      data: {
        name: "Sousse Spot",
        location: "Sousse",
        address: "Avenue Habib Bourguiba, Sousse",
        phone: "+216 73 000 222",
      },
    }),
  ]);

  // 2. Users across every role. Staff are assigned to their vending spot.
  const [admin, manager, , client] = await Promise.all([
    prisma.user.create({
      data: {
        email: "admin@alamine.com",
        password,
        firstName: "System",
        lastName: "Admin",
        role: "ADMIN",
        phone: "+216 20 000 001",
      },
    }),
    prisma.user.create({
      data: {
        email: "manager@alamine.com",
        password,
        firstName: "Mona",
        lastName: "Manager",
        role: "MANAGER",
        phone: "+216 20 000 002",
        assignedSpotId: spots[0].id, // Central Warehouse
      },
    }),
    prisma.user.create({
      data: {
        email: "worker@alamine.com",
        password,
        firstName: "Walid",
        lastName: "Worker",
        role: "WORKER",
        phone: "+216 20 000 003",
        assignedSpotId: spots[1].id, // Lac Boutique
      },
    }),
    prisma.user.create({
      data: {
        email: "client@alamine.com",
        password,
        firstName: "Sami",
        lastName: "Client",
        role: "CLIENT",
        phone: "+216 20 000 004",
      },
    }),
  ]);

  // Assign manager to the first vending spot.
  await prisma.vendingSpot.update({
    where: { id: spots[0].id },
    data: { managerId: manager.id },
  });

  // 3. Categories + products + distributed inventory.
  const createdProducts = [];
  for (const [categoryName, products] of Object.entries(CATALOG)) {
    const category = await prisma.category.create({
      data: { name: categoryName },
    });
    for (const p of products) {
      const product = await prisma.product.create({
        data: {
          name: p.name,
          description: p.description,
          price: p.price,
          imageUrl: p.image,
          categoryId: category.id,
        },
      });
      createdProducts.push(product);
      // Spread stock across every spot with a pseudo-random quantity.
      await prisma.inventory.createMany({
        data: spots.map((s, i) => ({
          productId: product.id,
          spotId: s.id,
          quantity: 5 + ((p.name.length * (i + 3)) % 60),
        })),
      });
    }
  }

  // 4. A sample order from the demo client to populate dashboards.
  const sample = createdProducts.slice(0, 3);
  const total = sample.reduce((sum, p) => sum + Number(p.price) * 2, 0);
  await prisma.order.create({
    data: {
      clientId: client.id,
      spotId: spots[1].id,
      status: "VERIFYING",
      totalAmount: total,
      address: "12 Rue de Carthage, Tunis",
      phone: "+216 20 000 004",
      items: {
        create: sample.map((p) => ({
          productId: p.id,
          quantity: 2,
          price: p.price,
        })),
      },
    },
  });

  console.log(
    `✅ Seed complete: ${createdProducts.length} products, ${spots.length} spots, 4 users.`,
  );
  console.log(
    "🔑 Login: admin@alamine.com / manager@alamine.com / worker@alamine.com / client@alamine.com",
  );
  console.log(`🔑 Password for all: ${DEMO_PASSWORD}`);
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
