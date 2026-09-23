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
    // Original
    { name: 'Indonesia', code: 'ID', continent: 'Asia', flagUrl: 'https://flagcdn.com/id.svg' },
    { name: 'Greece', code: 'GR', continent: 'Europe', flagUrl: 'https://flagcdn.com/gr.svg' },
    { name: 'Japan', code: 'JP', continent: 'Asia', flagUrl: 'https://flagcdn.com/jp.svg' },
    { name: 'Chile', code: 'CL', continent: 'South America', flagUrl: 'https://flagcdn.com/cl.svg' },
    { name: 'France', code: 'FR', continent: 'Europe', flagUrl: 'https://flagcdn.com/fr.svg' },
    { name: 'Italy', code: 'IT', continent: 'Europe', flagUrl: 'https://flagcdn.com/it.svg' },
    { name: 'Morocco', code: 'MA', continent: 'Africa', flagUrl: 'https://flagcdn.com/ma.svg' },
    { name: 'Thailand', code: 'TH', continent: 'Asia', flagUrl: 'https://flagcdn.com/th.svg' },
    { name: 'Peru', code: 'PE', continent: 'South America', flagUrl: 'https://flagcdn.com/pe.svg' },
    // New
    { name: 'USA', code: 'US', continent: 'North America', flagUrl: 'https://flagcdn.com/us.svg' },
    { name: 'UAE', code: 'AE', continent: 'Asia', flagUrl: 'https://flagcdn.com/ae.svg' },
    { name: 'Australia', code: 'AU', continent: 'Oceania', flagUrl: 'https://flagcdn.com/au.svg' },
    { name: 'Spain', code: 'ES', continent: 'Europe', flagUrl: 'https://flagcdn.com/es.svg' },
    { name: 'Netherlands', code: 'NL', continent: 'Europe', flagUrl: 'https://flagcdn.com/nl.svg' },
    { name: 'Turkey', code: 'TR', continent: 'Europe', flagUrl: 'https://flagcdn.com/tr.svg' },
    { name: 'Singapore', code: 'SG', continent: 'Asia', flagUrl: 'https://flagcdn.com/sg.svg' },
    { name: 'South Africa', code: 'ZA', continent: 'Africa', flagUrl: 'https://flagcdn.com/za.svg' },
    { name: 'Brazil', code: 'BR', continent: 'South America', flagUrl: 'https://flagcdn.com/br.svg' },
    { name: 'Maldives', code: 'MV', continent: 'Asia', flagUrl: 'https://flagcdn.com/mv.svg' },
    { name: 'Kenya', code: 'KE', continent: 'Africa', flagUrl: 'https://flagcdn.com/ke.svg' },
    { name: 'Iceland', code: 'IS', continent: 'Europe', flagUrl: 'https://flagcdn.com/is.svg' },
    { name: 'Czech Republic', code: 'CZ', continent: 'Europe', flagUrl: 'https://flagcdn.com/cz.svg' },
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
    // ── Original 3 ────────────────────────────────────────────────────────────
    {
      name: 'Bali', slug: 'bali', countryName: 'Indonesia', categorySlugs: ['beach', 'cultural', 'luxury'],
      tagline: 'Island of the Gods', description: 'A tropical paradise known for its forested volcanic mountains, iconic rice paddies, beaches, and coral reefs.',
      heroImage: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1200&q=80',
      priceFrom: 1200, rating: 4.9, bestTimeToVisit: 'April to October',
      climate: 'Tropical', language: 'Balinese, Indonesian', timezone: 'Asia/Makassar',
      latitude: -8.4095, longitude: 115.1889, featured: true, trending: true, published: true,
    },
    {
      name: 'Santorini', slug: 'santorini', countryName: 'Greece', categorySlugs: ['beach', 'honeymoon', 'luxury'],
      tagline: 'Iconic whitewashed villages', description: 'Famous for its stunning sunsets, whitewashed cubiform houses clinging to cliffs, and crystal-clear Aegean waters.',
      heroImage: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=1200&q=80',
      priceFrom: 1800, rating: 4.8, bestTimeToVisit: 'May to October',
      climate: 'Mediterranean', language: 'Greek', timezone: 'Europe/Athens',
      latitude: 36.3932, longitude: 25.4615, featured: true, trending: true, published: true,
    },
    {
      name: 'Kyoto', slug: 'kyoto', countryName: 'Japan', categorySlugs: ['cultural', 'city'],
      tagline: 'Ancient temples and tradition', description: 'Once the capital of Japan, famous for its numerous classical Buddhist temples, gardens, imperial palaces, and traditional wooden houses.',
      heroImage: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1200&q=80',
      priceFrom: 1600, rating: 4.9, bestTimeToVisit: 'March to May, September to November',
      climate: 'Humid subtropical', language: 'Japanese', timezone: 'Asia/Tokyo',
      latitude: 35.0116, longitude: 135.7681, featured: true, trending: true, published: true,
    },

    // ── 20 New Destinations ────────────────────────────────────────────────────
    {
      name: 'Tokyo', slug: 'tokyo', countryName: 'Japan', categorySlugs: ['city', 'cultural'],
      tagline: 'Where tradition meets tomorrow', description: 'A dazzling megacity blending ultramodern skyscrapers with ancient temples, world-class cuisine, and unparalleled energy — Tokyo is like nowhere else on Earth.',
      heroImage: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1200&q=80',
      priceFrom: 1900, rating: 4.9, bestTimeToVisit: 'March to May, September to November',
      climate: 'Humid subtropical', language: 'Japanese', timezone: 'Asia/Tokyo',
      latitude: 35.6762, longitude: 139.6503, featured: true, trending: true, published: true,
    },
    {
      name: 'New York City', slug: 'new-york-city', countryName: 'USA', categorySlugs: ['city', 'cultural'],
      tagline: 'The city that never sleeps', description: 'New York City is a global hub of art, fashion, and finance — home to iconic landmarks like Times Square, Central Park, the Statue of Liberty, and the most vibrant cultural scene on the planet.',
      heroImage: 'https://images.unsplash.com/photo-1499092346589-b9b6be3e94b2?w=1200&q=80',
      priceFrom: 2100, rating: 4.8, bestTimeToVisit: 'April to June, September to November',
      climate: 'Humid continental', language: 'English', timezone: 'America/New_York',
      latitude: 40.7128, longitude: -74.0060, featured: true, trending: true, published: true,
    },
    {
      name: 'Paris', slug: 'paris', countryName: 'France', categorySlugs: ['city', 'cultural', 'honeymoon'],
      tagline: 'The City of Light', description: 'Paris enchants visitors with its Haussmann boulevards, world-renowned museums, café culture, and the timeless romance of the Eiffel Tower glittering against the Parisian sky.',
      heroImage: 'https://images.unsplash.com/photo-1502602881462-f22444bf1fc1?w=1200&q=80',
      priceFrom: 1700, rating: 4.8, bestTimeToVisit: 'April to June, September to October',
      climate: 'Oceanic', language: 'French', timezone: 'Europe/Paris',
      latitude: 48.8566, longitude: 2.3522, featured: true, trending: false, published: true,
    },
    {
      name: 'Dubai', slug: 'dubai', countryName: 'UAE', categorySlugs: ['luxury', 'city'],
      tagline: 'Where dreams become skylines', description: 'Dubai is a city of superlatives — tallest building, biggest mall, most luxurious hotels. Set against the Arabian Desert, it merges future-forward architecture with Arabian hospitality.',
      heroImage: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1200&q=80',
      priceFrom: 2300, rating: 4.7, bestTimeToVisit: 'November to April',
      climate: 'Desert', language: 'Arabic, English', timezone: 'Asia/Dubai',
      latitude: 25.2048, longitude: 55.2708, featured: true, trending: true, published: true,
    },
    {
      name: 'Sydney', slug: 'sydney', countryName: 'Australia', categorySlugs: ['beach', 'city'],
      tagline: 'Harbour city sunshine', description: 'Sydney dazzles with its iconic Opera House sails, the Harbour Bridge arching over sparkling blue waters, and world-famous Bondi Beach — all wrapped in a laid-back Australian lifestyle.',
      heroImage: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=1200&q=80',
      priceFrom: 2000, rating: 4.7, bestTimeToVisit: 'September to November, March to May',
      climate: 'Oceanic', language: 'English', timezone: 'Australia/Sydney',
      latitude: -33.8688, longitude: 151.2093, featured: true, trending: false, published: true,
    },
    {
      name: 'Rome', slug: 'rome', countryName: 'Italy', categorySlugs: ['cultural', 'city'],
      tagline: 'Eternal city, eternal wonder', description: 'Rome layers 3,000 years of history into every cobblestone street — the Colosseum, Vatican City, the Pantheon, and countless piazzas make it one of the world\'s greatest open-air museums.',
      heroImage: 'https://images.unsplash.com/photo-1552832233-4f1ab7c2e36b?w=1200&q=80',
      priceFrom: 1400, rating: 4.8, bestTimeToVisit: 'April to June, September to October',
      climate: 'Mediterranean', language: 'Italian', timezone: 'Europe/Rome',
      latitude: 41.9028, longitude: 12.4964, featured: false, trending: false, published: true,
    },
    {
      name: 'Barcelona', slug: 'barcelona', countryName: 'Spain', categorySlugs: ['city', 'beach', 'cultural'],
      tagline: 'Gaudí, tapas & Mediterranean soul', description: 'Barcelona pulses with Catalan culture, Antoni Gaudí\'s surreal architecture, world-class FC Barcelona, and a golden Mediterranean coastline that keeps the party going well into the night.',
      heroImage: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=1200&q=80',
      priceFrom: 1350, rating: 4.7, bestTimeToVisit: 'May to June, September to October',
      climate: 'Mediterranean', language: 'Catalan, Spanish', timezone: 'Europe/Madrid',
      latitude: 41.3851, longitude: 2.1734, featured: false, trending: true, published: true,
    },
    {
      name: 'Amsterdam', slug: 'amsterdam', countryName: 'Netherlands', categorySlugs: ['city', 'cultural'],
      tagline: 'City of canals & culture', description: 'Amsterdam\'s picturesque canal rings, world-class museums like the Rijksmuseum and Anne Frank House, and its famously tolerant, bicycle-friendly culture make it Europe\'s most charming capital.',
      heroImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80',
      priceFrom: 1300, rating: 4.6, bestTimeToVisit: 'April to May, September to October',
      climate: 'Oceanic', language: 'Dutch', timezone: 'Europe/Amsterdam',
      latitude: 52.3676, longitude: 4.9041, featured: false, trending: false, published: true,
    },
    {
      name: 'Istanbul', slug: 'istanbul', countryName: 'Turkey', categorySlugs: ['cultural', 'city'],
      tagline: 'Where East meets West', description: 'Istanbul straddles two continents and millennia of empires — from the Byzantine Hagia Sophia and Ottoman Blue Mosque to the Grand Bazaar\'s labyrinthine spice-scented corridors.',
      heroImage: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=1200&q=80',
      priceFrom: 1100, rating: 4.7, bestTimeToVisit: 'April to May, September to November',
      climate: 'Mediterranean', language: 'Turkish', timezone: 'Europe/Istanbul',
      latitude: 41.0082, longitude: 28.9784, featured: false, trending: true, published: true,
    },
    {
      name: 'Singapore', slug: 'singapore', countryName: 'Singapore', categorySlugs: ['city', 'luxury'],
      tagline: 'The Lion City shines', description: 'Singapore is a futuristic island city-state of extraordinary diversity — Marina Bay Sands\' infinity pool, Gardens by the Bay\'s supertrees, and a hawker centre food scene that rivals any Michelin kitchen.',
      heroImage: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=1200&q=80',
      priceFrom: 1600, rating: 4.8, bestTimeToVisit: 'February to April',
      climate: 'Tropical rainforest', language: 'English, Mandarin, Malay, Tamil', timezone: 'Asia/Singapore',
      latitude: 1.3521, longitude: 103.8198, featured: true, trending: false, published: true,
    },
    {
      name: 'Cape Town', slug: 'cape-town', countryName: 'South Africa', categorySlugs: ['beach', 'adventure', 'city'],
      tagline: 'The Mother City of Africa', description: 'Cape Town stands at the tip of Africa with Table Mountain as its crown — a breathtaking convergence of mountains, vineyards, penguin beaches, and the raw power of two oceans meeting.',
      heroImage: 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=1200&q=80',
      priceFrom: 1250, rating: 4.7, bestTimeToVisit: 'March to May, September to November',
      climate: 'Mediterranean', language: 'Afrikaans, English, Xhosa', timezone: 'Africa/Johannesburg',
      latitude: -33.9249, longitude: 18.4241, featured: false, trending: true, published: true,
    },
    {
      name: 'Rio de Janeiro', slug: 'rio-de-janeiro', countryName: 'Brazil', categorySlugs: ['beach', 'cultural', 'adventure'],
      tagline: 'Cidade Maravilhosa', description: 'Rio de Janeiro is pure spectacle — Christ the Redeemer presiding over Copacabana and Ipanema beaches, samba rhythms spilling into the streets, and a jungle-clad mountain backdrop unlike anywhere else.',
      heroImage: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=1200&q=80',
      priceFrom: 1300, rating: 4.6, bestTimeToVisit: 'December to March',
      climate: 'Tropical monsoon', language: 'Portuguese', timezone: 'America/Sao_Paulo',
      latitude: -22.9068, longitude: -43.1729, featured: false, trending: false, published: true,
    },
    {
      name: 'Maldives', slug: 'maldives', countryName: 'Maldives', categorySlugs: ['beach', 'honeymoon', 'luxury'],
      tagline: 'Paradise found on Earth', description: 'The Maldives is the ultimate tropical escape — a necklace of 1,200 coral islands in the Indian Ocean, each fringed by powder-white beaches, overwater bungalows, and the world\'s most pristine turquoise lagoons.',
      heroImage: 'https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=1200&q=80',
      priceFrom: 3200, rating: 4.9, bestTimeToVisit: 'November to April',
      climate: 'Tropical monsoon', language: 'Dhivehi', timezone: 'Indian/Maldives',
      latitude: 3.2028, longitude: 73.2207, featured: true, trending: true, published: true,
    },
    {
      name: 'Machu Picchu', slug: 'machu-picchu', countryName: 'Peru', categorySlugs: ['adventure', 'cultural', 'mountain'],
      tagline: 'Lost city in the clouds', description: 'Machu Picchu is the jewel of the Inca Empire — a 15th-century citadel perched 2,430m above sea level in the Andes, veiled in morning mist and surrounded by cloud forest.',
      heroImage: 'https://images.unsplash.com/photo-1587595431973-160d0d94add1?w=1200&q=80',
      priceFrom: 1800, rating: 4.9, bestTimeToVisit: 'May to September',
      climate: 'Subtropical highland', language: 'Spanish, Quechua', timezone: 'America/Lima',
      latitude: -13.1631, longitude: -72.5450, featured: true, trending: true, published: true,
    },
    {
      name: 'Nairobi & Safari Kenya', slug: 'safari-kenya', countryName: 'Kenya', categorySlugs: ['wildlife', 'adventure'],
      tagline: 'The Big Five await', description: 'Kenya\'s Masai Mara offers the world\'s greatest wildlife spectacle — the Great Migration of over two million wildebeest, alongside lions, elephants, and leopards roaming endless golden savannahs.',
      heroImage: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=1200&q=80',
      priceFrom: 2500, rating: 4.8, bestTimeToVisit: 'July to October',
      climate: 'Semi-arid', language: 'Swahili, English', timezone: 'Africa/Nairobi',
      latitude: -1.2921, longitude: 36.8219, featured: true, trending: true, published: true,
    },
    {
      name: 'Reykjavik', slug: 'reykjavik', countryName: 'Iceland', categorySlugs: ['adventure', 'cultural'],
      tagline: 'Land of fire, ice & northern lights', description: 'Iceland\'s capital is the gateway to otherworldly landscapes — erupting geysers, cascading waterfalls, black sand beaches, volcanic craters, and on winter nights, the electric dance of the Aurora Borealis.',
      heroImage: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=1200&q=80',
      priceFrom: 2200, rating: 4.7, bestTimeToVisit: 'June to August (midnight sun), November to February (northern lights)',
      climate: 'Subarctic oceanic', language: 'Icelandic', timezone: 'Atlantic/Reykjavik',
      latitude: 64.1265, longitude: -21.8174, featured: false, trending: true, published: true,
    },
    {
      name: 'Prague', slug: 'prague', countryName: 'Czech Republic', categorySlugs: ['city', 'cultural'],
      tagline: 'The Golden City of a Hundred Spires', description: 'Prague\'s medieval Old Town Square, astronomical clock, Charles Bridge draped in baroque statues, and hilltop castle make it Europe\'s most fairy-tale city — impossibly preserved and endlessly romantic.',
      heroImage: 'https://images.unsplash.com/photo-1541849546-216549ae216d?w=1200&q=80',
      priceFrom: 950, rating: 4.7, bestTimeToVisit: 'May to September',
      climate: 'Oceanic', language: 'Czech', timezone: 'Europe/Prague',
      latitude: 50.0755, longitude: 14.4378, featured: false, trending: false, published: true,
    },
    {
      name: 'Phuket', slug: 'phuket', countryName: 'Thailand', categorySlugs: ['beach', 'luxury'],
      tagline: 'Pearl of the Andaman', description: 'Phuket\'s dramatic limestone karsts, emerald-clear waters, powdery white beaches at Patong, Kata, and Karon, and vibrant nightlife make it Thailand\'s most beloved and stunning island.',
      heroImage: 'https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=1200&q=80',
      priceFrom: 1100, rating: 4.6, bestTimeToVisit: 'November to April',
      climate: 'Tropical monsoon', language: 'Thai', timezone: 'Asia/Bangkok',
      latitude: 7.8804, longitude: 98.3923, featured: false, trending: false, published: true,
    },
    {
      name: 'Amalfi Coast', slug: 'amalfi-coast', countryName: 'Italy', categorySlugs: ['beach', 'honeymoon', 'luxury'],
      tagline: 'Cliffside villages kissed by the sun', description: 'The Amalfi Coast is one of Italy\'s most breathtaking stretches — pastel-hued villages clinging to vertiginous cliffs, lemon groves cascading to turquoise coves, and the perfume of the Tyrrhenian Sea on every breeze.',
      heroImage: 'https://images.unsplash.com/photo-1533587851505-d119e13fa0d7?w=1200&q=80',
      priceFrom: 2100, rating: 4.9, bestTimeToVisit: 'May to June, September to October',
      climate: 'Mediterranean', language: 'Italian', timezone: 'Europe/Rome',
      latitude: 40.6340, longitude: 14.6027, featured: true, trending: true, published: true,
    },
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
      address: 'Kedewatan, Ubud, Bali', heroImage: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1200&q=80',
      amenities: JSON.stringify(['Pool', 'Spa', 'Restaurant', 'WiFi', 'Room Service']), published: true,
    },
    {
      name: 'Park Hyatt Tokyo', slug: 'park-hyatt-tokyo', destinationSlug: 'tokyo',
      stars: 5, rating: 4.9, priceFrom: 1200,
      description: 'An ultra-luxurious hotel perched on the top floors of the Shinjuku Park Tower, immortalised in Lost in Translation.',
      address: '3-7-1-2 Nishi Shinjuku, Shinjuku, Tokyo', heroImage: 'https://images.unsplash.com/photo-1615880484746-a134be9a6ecf?w=1200&q=80',
      amenities: JSON.stringify(['Infinity Pool', 'Spa', 'Fine Dining', 'WiFi', 'Concierge']), published: true,
    },
    {
      name: 'Burj Al Arab', slug: 'burj-al-arab', destinationSlug: 'dubai',
      stars: 5, rating: 4.8, priceFrom: 3500,
      description: 'The world\'s most iconic luxury hotel, shaped like a billowing sail on its own artificial island.',
      address: 'Jumeirah Street, Dubai', heroImage: 'https://images.unsplash.com/photo-1526495124232-a04e1849168c?w=1200&q=80',
      amenities: JSON.stringify(['Private Beach', 'Helicopter Transfer', 'Butler Service', 'Multiple Restaurants']), published: true,
    },
    {
      name: 'Over The Water Villa Maldives', slug: 'overwater-maldives', destinationSlug: 'maldives',
      stars: 5, rating: 5.0, priceFrom: 2800,
      description: 'Spend your days in a glass-floored overwater bungalow with direct access to the world\'s most pristine lagoon.',
      address: 'North Malé Atoll, Maldives', heroImage: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=1200&q=80',
      amenities: JSON.stringify(['Glass Floor', 'Private Lagoon', 'Snorkelling', 'Butler', 'Spa']), published: true,
    },
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
      title: 'Bali Spiritual Journey', slug: 'bali-spiritual-journey-7d', destinationSlug: 'bali', category: 'CULTURAL',
      duration: 7, priceFrom: 1299, rating: 4.9, maxTravelers: 12, featured: true, published: true,
      heroImage: 'https://images.unsplash.com/photo-1604999333679-b86d54738315?w=1200&q=80',
      overview: 'Discover the spiritual heart of Bali through ancient temples, sacred water blessings, and serene rice terraces.',
      included: JSON.stringify(['6 nights luxury accommodation', 'Daily breakfast and 4 dinners', 'Private English-speaking guide', 'All temple entrance fees', 'Airport transfers']),
      excluded: JSON.stringify(['International flights', 'Travel insurance', 'Personal expenses']),
      cancellationPolicy: 'Free cancellation up to 30 days before departure.',
    },
    {
      title: 'Tokyo & Kyoto Explorer', slug: 'tokyo-kyoto-explorer-10d', destinationSlug: 'tokyo', category: 'CULTURAL',
      duration: 10, priceFrom: 2499, rating: 4.9, maxTravelers: 15, featured: true, published: true,
      heroImage: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1200&q=80',
      overview: 'Journey through Japan\'s contrasts — the neon-lit energy of Tokyo and the serene temples of Kyoto.',
      included: JSON.stringify(['9 nights accommodation', 'Bullet train pass', 'Daily breakfast', 'Expert guide']),
      excluded: JSON.stringify(['International flights', 'Dinner (most nights)', 'Personal expenses']),
      cancellationPolicy: 'Free cancellation up to 45 days before departure.',
    },
    {
      title: 'Maldives Honeymoon Escape', slug: 'maldives-honeymoon-7d', destinationSlug: 'maldives', category: 'BEACH',
      duration: 7, priceFrom: 3899, rating: 5.0, maxTravelers: 2, featured: true, published: true,
      heroImage: 'https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=1200&q=80',
      overview: 'An all-inclusive romantic escape in an overwater villa surrounded by the purest turquoise waters.',
      included: JSON.stringify(['6 nights overwater villa', 'All meals & cocktails', 'Couples spa treatment', 'Snorkelling & diving']),
      excluded: JSON.stringify(['International flights', 'Travel insurance']),
      cancellationPolicy: 'Free cancellation up to 60 days before departure.',
    },
    {
      title: 'Kenya Safari Adventure', slug: 'kenya-safari-8d', destinationSlug: 'safari-kenya', category: 'ADVENTURE',
      duration: 8, priceFrom: 3199, rating: 4.8, maxTravelers: 10, featured: true, published: true,
      heroImage: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=1200&q=80',
      overview: 'Witness the Great Migration and the Big Five across Kenya\'s most iconic national parks.',
      included: JSON.stringify(['7 nights luxury tented camps', 'All meals', 'Game drives', 'Maasai village visit', 'Internal flights']),
      excluded: JSON.stringify(['International flights', 'Visa fees', 'Gratuities']),
      cancellationPolicy: 'Free cancellation up to 60 days before departure.',
    },
    {
      title: 'Amalfi Coast Luxury Drive', slug: 'amalfi-coast-luxury-6d', destinationSlug: 'amalfi-coast', category: 'LUXURY',
      duration: 6, priceFrom: 2799, rating: 4.9, maxTravelers: 8, featured: true, published: true,
      heroImage: 'https://images.unsplash.com/photo-1533587851505-d119e13fa0d7?w=1200&q=80',
      overview: 'Cruise the Amalfi Coast in style — stay in clifftop boutique hotels, island-hop to Capri, and feast on fresh seafood.',
      included: JSON.stringify(['5 nights boutique hotels', 'Private boat day trip', 'Wine & food tastings', 'Driver and guide']),
      excluded: JSON.stringify(['International flights', 'Flights within Italy']),
      cancellationPolicy: 'Free cancellation up to 30 days before departure.',
    },
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
      role: 'USER',
      wishlist: { create: {} }
    }
  });

  await db.user.create({
    data: {
      email: 'admin@zyrotrip.com',
      passwordHash: await bcrypt.hash('Admin@12345', 12),
      firstName: 'Alex',
      lastName: 'Admin',
      name: 'Alex Admin',
      role: 'ADMIN',
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
  console.log(`📍 Total destinations: ${destinationsData.length}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
