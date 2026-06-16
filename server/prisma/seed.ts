import "dotenv/config";
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
})

const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 Seeding database...')

  // 1. Create Admin User
  const admin = await prisma.user.upsert({
    where: { email: 'admin@alamine.com' },
    update: {},
    create: {
      email: 'admin@alamine.com',
      password: 'hashed_password_here', // In real app, use bcrypt
      firstName: 'System',
      lastName: 'Admin',
      role: 'ADMIN',
      status: 'ACTIVE',
    },
  })

  // 2. Create Default Categories
  const categories = ['Electronics', 'Clothing', 'Home & Garden', 'Health']
  for (const cat of categories) {
    await prisma.category.upsert({
      where: { name: cat },
      update: {},
      create: { name: cat },
    })
  }

  // 3. Create Initial Vending Spots
  const spots = [
    { name: 'Main Boutique', location: 'Center', address: '123 Main St', phone: '0123456789' },
    { name: 'East Spot', location: 'East Side', address: '456 East St', phone: '0987654321' },
  ]
  for (const spot of spots) {
    await prisma.vendingSpot.create({ data: spot })
  }

  console.log('✅ Seeding completed.')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
