import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Fetching all destinations...');
  const destinations = await prisma.destination.findMany({
    include: {
      images: {
        orderBy: { order: 'asc' },
      },
    },
  });

  console.log(`Found ${destinations.length} destinations.`);

  for (const dest of destinations) {
    if (dest.images.length > 0) {
      const highResImage = dest.images[0]?.url;
      
      if (highResImage && dest.heroImage !== highResImage) {
        console.log(`Updating heroImage for ${dest.name}...`);
        await prisma.destination.update({
          where: { id: dest.id },
          data: { heroImage: highResImage },
        });
      } else {
        console.log(`${dest.name} already has a high-res heroImage.`);
      }
    } else {
      console.log(`Skipping ${dest.name} - no gallery images found.`);
    }
  }

  console.log('Finished updating hero images.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
