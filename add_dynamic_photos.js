const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();

const prompts = [
  "scenic beautiful landscape {name} travel photography no humans cinematic",
  "beautiful sunset at {name} scenic view empty no people",
  "aerial drone view of {name} beautiful nature landscape",
  "iconic landmark in {name} scenic empty no tourists",
  "beautiful daytime nature in {name} professional photography",
  "stunning architecture or nature {name} wide angle empty",
  "panoramic scenic view of {name} beautiful lighting",
  "peaceful morning in {name} beautiful landscape no people"
];

async function addPhotos() {
  console.log('📸 Generating dynamic AI gallery photos for all destinations...\n');

  const destinations = await db.destination.findMany({
    select: { id: true, name: true, slug: true },
    orderBy: { name: 'asc' }
  });

  console.log(`Found ${destinations.length} destinations\n`);

  for (const dest of destinations) {
    // Delete existing images
    await db.destinationImage.deleteMany({ where: { destinationId: dest.id } });

    // Generate 8 unique pollinations.ai URLs based on the destination name
    const photos = prompts.map((promptText, index) => {
      // Replace {name} with the actual destination name
      const prompt = promptText.replace('{name}', dest.name);
      
      // We add a unique random seed to ensure uniqueness even if cached
      const seed = Math.floor(Math.random() * 1000000);
      
      const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1200&height=800&nologo=true&seed=${seed}`;
      
      return {
        url,
        alt: `${dest.name} landscape ${index + 1}`,
      };
    });

    // Create all photos
    await db.destinationImage.createMany({
      data: photos.map((photo, index) => ({
        destinationId: dest.id,
        url: photo.url,
        alt: photo.alt,
        caption: photo.alt,
        order: index,
      }))
    });

    console.log(`✅ ${dest.name} — generated 8 dynamic photos`);
  }

  console.log('\n🎉 All dynamic gallery photos updated successfully!');
}

addPhotos()
  .catch(console.error)
  .finally(() => db.$disconnect());
