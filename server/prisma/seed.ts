import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';

// Postgres driver adapter — supplies the connection string to Prisma 7.
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// Shared demo password for every seeded account (hashed once, reused).
const DEMO_PASSWORD = 'Password123!';

// Curated product catalog — realistic names, TND prices and Unsplash imagery.
const CATALOG: Record<string, { name: string; description: string; price: number; image: string }[]> = {
  Beverages: [
    { name: 'Arabica Coffee Beans 1kg', description: 'Premium single-origin roasted Arabica beans.', price: 28.9, image: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=800&q=80' },
    { name: 'Fresh Orange Juice 1L', description: '100% pressed oranges, no added sugar.', price: 6.5, image: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&w=800&q=80' },
    { name: 'Sparkling Water Pack x6', description: 'Naturally sparkling mineral water.', price: 9.2, image: 'https://images.unsplash.com/photo-1560023907-5f339617ea30?auto=format&fit=crop&w=800&q=80' },
    { name: 'Green Tea Box x25', description: 'Antioxidant-rich whole-leaf green tea bags.', price: 7.8, image: 'https://images.unsplash.com/photo-1627435601361-ec25f5b1d0e5?auto=format&fit=crop&w=800&q=80' },
  ],
  Snacks: [
    { name: 'Dark Chocolate 70% 100g', description: 'Intense Belgian dark chocolate bar.', price: 5.4, image: 'https://images.unsplash.com/photo-1511381939415-e44015466834?auto=format&fit=crop&w=800&q=80' },
    { name: 'Salted Almonds 250g', description: 'Roasted and lightly salted whole almonds.', price: 12.0, image: 'https://images.unsplash.com/photo-1508061253366-f7da158b6d46?auto=format&fit=crop&w=800&q=80' },
    { name: 'Potato Chips Classic', description: 'Crispy kettle-cooked potato chips.', price: 3.2, image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=800&q=80' },
  ],
  'Dairy & Eggs': [
    { name: 'Fresh Whole Milk 1L', description: 'Farm-fresh pasteurized whole milk.', price: 2.1, image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=800&q=80' },
    { name: 'Free-Range Eggs x12', description: 'Large free-range eggs from local farms.', price: 6.9, image: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?auto=format&fit=crop&w=800&q=80' },
    { name: 'Aged Gouda Cheese 300g', description: 'Matured 12-month Dutch gouda.', price: 15.5, image: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?auto=format&fit=crop&w=800&q=80' },
  ],
  Bakery: [
    { name: 'Artisan Sourdough Loaf', description: 'Slow-fermented crusty sourdough bread.', price: 4.5, image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80' },
    { name: 'Butter Croissant x4', description: 'Flaky all-butter French croissants.', price: 5.0, image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=800&q=80' },
  ],
  'Fruits & Vegetables': [
    { name: 'Royal Gala Apples 1kg', description: 'Sweet and crisp seasonal apples.', price: 3.8, image: 'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?auto=format&fit=crop&w=800&q=80' },
    { name: 'Vine Tomatoes 1kg', description: 'Ripe, juicy vine-grown tomatoes.', price: 2.9, image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=800&q=80' },
  ],
  Household: [
    { name: 'Multi-Surface Cleaner 750ml', description: 'Powerful streak-free surface spray.', price: 4.2, image: 'https://images.unsplash.com/photo-1585421514738-01798e348b17?auto=format&fit=crop&w=800&q=80' },
  ],
  'Personal Care': [
    { name: 'Nourishing Shampoo 400ml', description: 'Sulphate-free shampoo for daily care.', price: 8.6, image: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=800&q=80' },
  ],
};

async function main() {
  console.log('🌱 Seeding database...');

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

  // 1. Users across every role.
  const [admin, , , client] = await Promise.all([
    prisma.user.create({ data: { email: 'admin@alamine.com', password, firstName: 'System', lastName: 'Admin', role: 'ADMIN', phone: '+216 20 000 001' } }),
    prisma.user.create({ data: { email: 'manager@alamine.com', password, firstName: 'Mona', lastName: 'Manager', role: 'MANAGER', phone: '+216 20 000 002' } }),
    prisma.user.create({ data: { email: 'worker@alamine.com', password, firstName: 'Walid', lastName: 'Worker', role: 'WORKER', phone: '+216 20 000 003' } }),
    prisma.user.create({ data: { email: 'client@alamine.com', password, firstName: 'Sami', lastName: 'Client', role: 'CLIENT', phone: '+216 20 000 004' } }),
  ]);

  // 2. Vending spots (boutiques) + central warehouse.
  const spots = await Promise.all([
    prisma.vendingSpot.create({ data: { name: 'Central Warehouse', location: 'Tunis', address: 'Zone Industrielle, Tunis', phone: '+216 71 000 000' } }),
    prisma.vendingSpot.create({ data: { name: 'Lac Boutique', location: 'Les Berges du Lac', address: 'Rue du Lac, Tunis', phone: '+216 71 000 111' } }),
    prisma.vendingSpot.create({ data: { name: 'Sousse Spot', location: 'Sousse', address: 'Avenue Habib Bourguiba, Sousse', phone: '+216 73 000 222' } }),
  ]);

  // 3. Categories + products + distributed inventory.
  const createdProducts = [];
  for (const [categoryName, products] of Object.entries(CATALOG)) {
    const category = await prisma.category.create({ data: { name: categoryName } });
    for (const p of products) {
      const product = await prisma.product.create({
        data: { name: p.name, description: p.description, price: p.price, imageUrl: p.image, categoryId: category.id },
      });
      createdProducts.push(product);
      // Spread stock across every spot with a pseudo-random quantity.
      await prisma.inventory.createMany({
        data: spots.map((s, i) => ({ productId: product.id, spotId: s.id, quantity: 5 + ((p.name.length * (i + 3)) % 60) })),
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
      status: 'VERIFYING',
      totalAmount: total,
      address: '12 Rue de Carthage, Tunis',
      phone: '+216 20 000 004',
      items: { create: sample.map((p) => ({ productId: p.id, quantity: 2, price: p.price })) },
    },
  });

  console.log(`✅ Seed complete: ${createdProducts.length} products, ${spots.length} spots, 4 users.`);
  console.log('🔑 Login: admin@alamine.com / manager@alamine.com / worker@alamine.com / client@alamine.com');
  console.log(`🔑 Password for all: ${DEMO_PASSWORD}`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
