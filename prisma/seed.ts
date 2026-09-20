import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const db = new PrismaClient();

async function main() {
  console.log('🌱 Seeding ZyroTrip database...');

  await db.auditLog.deleteMany();
  await db.review.deleteMany();
  await db.couponUsage.deleteMany();
  await db.coupon.deleteMany();
  await db.bookingTraveler.deleteMany();
  await db.payment.deleteMany();
  await db.invoice.deleteMany();
  await db.booking.deleteMany();
  await db.wishlistItem.deleteMany();
  await db.wishlist.deleteMany();
  await db.user.deleteMany();
  await db.experience.deleteMany();
  await db.packageDay.deleteMany();
  await db.packageImage.deleteMany();
  await db.travelPackage.deleteMany();
  await db.hotelRoom.deleteMany();
  await db.hotelImage.deleteMany();
  await db.hotel.deleteMany();
  await db.destinationImage.deleteMany();
  await db.destination.deleteMany();
  await db.destinationCategory.deleteMany();
  await db.region.deleteMany();
  await db.country.deleteMany();

  console.log('🧹 Cleaned existing data.');

  const countriesData = [
    { name: 'Indonesia', code: 'ID', continent: 'Asia' },
    { name: 'Greece', code: 'GR', continent: 'Europe' },
    { name: 'Japan', code: 'JP', continent: 'Asia' },
    { name: 'Chile', code: 'CL', continent: 'South America' },
    { name: 'France', code: 'FR', continent: 'Europe' },
    { name: 'Italy', code: 'IT', continent: 'Europe' },
    { name: 'Morocco', code: 'MA', continent: 'Africa' },
    { name: 'Thailand', code: 'TH', continent: 'Asia' },
    { name: 'Peru', code: 'PE', continent: 'South America' },
  ];

  const countries: Record<string, string> = {};
  for (const c of countriesData) {
    const created = await db.country.create({ data: c });
    countries[c.name] = created.id;
  }
  console.log('🌍 Countries created.');

  const categoriesData = [
    { name: 'Adventure', slug: 'adventure', icon: 'mountain' },
    { name: 'Cultural', slug: 'cultural', icon: 'landmark' },
    { name: 'Beach', slug: 'beach', icon: 'waves' },
    { name: 'Mountain', slug: 'mountain', icon: 'mountain-snow' },
    { name: 'City Break', slug: 'city', icon: 'buildings' },
    { name: 'Wildlife', slug: 'wildlife', icon: 'paw-print' },
    { name: 'Honeymoon', slug: 'honeymoon', icon: 'heart' },
    { name: 'Luxury', slug: 'luxury', icon: 'crown' },
  ];

  const categories: Record<string, string> = {};
  for (const cat of categoriesData) {
    const created = await db.destinationCategory.create({ data: cat });
    categories[cat.slug] = created.id;
  }
  console.log('🏷️ Categories created.');

  const destinationsData = [
    {
      name: 'Bali', slug: 'bali', countryName: 'Indonesia', categorySlugs: ['beach', 'cultural', 'luxury'],
      tagline: 'Island of the Gods', description: 'A tropical paradise known for its forested volcanic mountains, iconic rice paddies, beaches, and coral reefs.',
      heroImage: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1200&q=80',
      priceFrom: 1200, rating: 4.9, bestTimeToVisit: 'April to October',
      latitude: -8.4095, longitude: 115.1889, featured: true, trending: true, published: true,
    },
    {
      name: 'Santorini', slug: 'santorini', countryName: 'Greece', categorySlugs: ['beach', 'honeymoon', 'luxury'],
      tagline: 'Iconic whitewashed villages', description: 'Famous for its stunning sunsets, whitewashed cubiform houses clinging to cliffs, and crystal-clear Aegean waters.',
      heroImage: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=1200&q=80',
      priceFrom: 1800, rating: 4.8, bestTimeToVisit: 'May to October',
      latitude: 36.3932, longitude: 25.4615, featured: true, trending: true, published: true,
    },
    {
      name: 'Kyoto', slug: 'kyoto', countryName: 'Japan', categorySlugs: ['cultural', 'city'],
      tagline: 'Ancient temples and tradition', description: 'Once the capital of Japan, famous for its numerous classical Buddhist temples, gardens, imperial palaces, and traditional wooden houses.',
      heroImage: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1200&q=80',
      priceFrom: 1600, rating: 4.9, bestTimeToVisit: 'March to May, September to November',
      latitude: 35.0116, longitude: 135.7681, featured: true, trending: true, published: true,
    }
  ];

  const destinationMap: Record<string, string> = {};
  for (const dest of destinationsData) {
    const { countryName, categorySlugs, ...data } = dest;
    const created = await db.destination.create({
      data: {
        ...data,
        countryId: countries[countryName]!,
        categories: {
          connect: categorySlugs.map(slug => ({ id: categories[slug] })),
        },
        images: {
          create: [
            { url: data.heroImage, alt: `${data.name} Hero`, order: 0 },
            { url: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&q=80', alt: 'Scenery', order: 1 },
          ]
        }
      }
    });
    destinationMap[dest.slug] = created.id;
  }
  console.log('📍 Destinations created.');

  const hotelsData = [
    {
      name: 'Aman Amandari', slug: 'aman-amandari', destinationSlug: 'bali',
      stars: 5, rating: 4.9, priceFrom: 850,
      description: 'A serene luxury resort modeled after a traditional Balinese village.',
      address: 'Kedewatan, Ubud, Bali', heroImage: 'https://images.unsplash.com/photo-1582719478250-c89d145f39b4?w=1200&q=80',
      amenities: JSON.stringify(['Pool', 'Spa', 'Restaurant', 'WiFi', 'Room Service']), published: true,
    }
  ];

  for (const hotel of hotelsData) {
    const { destinationSlug, ...data } = hotel;
    await db.hotel.create({
      data: {
        ...data,
        destinationId: destinationMap[destinationSlug]!,
        images: {
          create: [{ url: data.heroImage, alt: data.name, order: 0 }]
        }
      }
    });
  }
  console.log('🏨 Hotels created.');

  const packagesData = [
    {
      title: 'Bali Spiritual Journey', slug: 'bali-spiritual-journey-7d', destinationSlug: 'bali', category: "CULTURAL",
      duration: 7, priceFrom: 1299, rating: 4.9, maxTravelers: 12, featured: true, published: true,
      heroImage: 'https://images.unsplash.com/photo-1604999333679-b86d54738315?w=1200&q=80',
      overview: 'Discover the spiritual heart of Bali through ancient temples, sacred water blessings, and serene rice terraces.',
      included: JSON.stringify(['6 nights luxury accommodation', 'Daily breakfast and 4 dinners', 'Private English-speaking guide', 'All temple entrance fees', 'Airport transfers']),
      excluded: JSON.stringify(['International flights', 'Travel insurance', 'Personal expenses']),
      cancellationPolicy: 'Free cancellation up to 30 days before departure.',
    }
  ];

  for (const pkg of packagesData) {
    const { destinationSlug, overview, heroImage, ...data } = pkg;
    await db.travelPackage.create({
      data: {
        ...data,
        description: overview,
        destinationId: destinationMap[destinationSlug]!,
        images: {
          create: [{ url: heroImage, alt: data.title, order: 0 }]
        },
        days: {
          create: [
            { dayNumber: 1, title: 'Arrival & Welcome', description: 'Settle into your accommodation and enjoy a welcome dinner.', activities: { create: [] } },
            { dayNumber: 2, title: 'Local Immersion', description: 'Explore the highlights of the area with an expert local guide.', activities: { create: [] } }
          ]
        }
      }
    });
  }
  console.log('✈️ Packages created.');

  const passwordHash = await bcrypt.hash('Demo@12345', 12);
  const demoUser = await db.user.create({
    data: {
      email: 'demo@zyrotrip.com',
      passwordHash,
      firstName: 'Sarah',
      lastName: 'Demo',
      name: 'Sarah Demo',
      role: "USER",
      wishlist: { create: {} }
    }
  });

  const adminUser = await db.user.create({
    data: {
      email: 'admin@zyrotrip.com',
      passwordHash: await bcrypt.hash('Admin@12345', 12),
      firstName: 'Alex',
      lastName: 'Admin',
      name: 'Alex Admin',
      role: "ADMIN",
      wishlist: { create: {} }
    }
  });

  await db.review.create({
    data: {
      rating: 5,
      title: 'Absolutely incredible experience',
      body: 'ZyroTrip planned every detail perfectly. Bali was breathtaking and the cultural immersion was authentic and respectful. Highly recommend!',
      published: true,
      featured: true,
      images: JSON.stringify([]),
      userId: demoUser.id,
      destinationId: destinationMap['bali']
    }
  });

  console.log('👤 Users and reviews created.');

  await db.coupon.createMany({
    data: [
      { code: 'WELCOME20', type: 'PERCENTAGE', value: 20, maxDiscount: 200, active: true },
      { code: 'FIRSTTRIP', type: 'FIXED_AMOUNT', value: 100, minOrderAmount: 500, active: true },
    ]
  });
  console.log('🎟️ Coupons created.');

  console.log('✅ All seed data generated successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
