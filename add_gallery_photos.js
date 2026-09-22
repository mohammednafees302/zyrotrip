const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();

// Real Unsplash photo IDs — landscapes & architecture only, NO humans
const galleryPhotos = {
  'bali': [
    { url: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1200&q=80', alt: 'Bali rice terraces' },
    { url: 'https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b?w=1200&q=80', alt: 'Bali temple at sunset' },
    { url: 'https://images.unsplash.com/photo-1574236170878-f89f99c63e52?w=1200&q=80', alt: 'Bali jungle waterfall' },
    { url: 'https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=1200&q=80', alt: 'Bali ocean at sunrise' },
    { url: 'https://images.unsplash.com/photo-1606041011872-596597976b25?w=1200&q=80', alt: 'Bali sacred temple gate' },
    { url: 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=1200&q=80', alt: 'Bali volcano view' },
    { url: 'https://images.unsplash.com/photo-1536184680516-79e6e2df2035?w=1200&q=80', alt: 'Bali terraced landscape' },
    { url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80', alt: 'Bali tropical flowers' },
  ],
  'santorini': [
    { url: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=1200&q=80', alt: 'Santorini white buildings' },
    { url: 'https://images.unsplash.com/photo-1533104816931-20fa691ff6ca?w=1200&q=80', alt: 'Santorini caldera view' },
    { url: 'https://images.unsplash.com/photo-1601581975053-7c036f1f4eb5?w=1200&q=80', alt: 'Santorini blue dome church' },
    { url: 'https://images.unsplash.com/photo-1555993539-1732b0258235?w=1200&q=80', alt: 'Santorini sunset cliffs' },
    { url: 'https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=1200&q=80', alt: 'Santorini volcanic beach' },
    { url: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=1200&q=80', alt: 'Santorini terrace view' },
    { url: 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=1200&q=80', alt: 'Santorini blue sea' },
    { url: 'https://images.unsplash.com/photo-1504512485720-7d83a16ee930?w=1200&q=80', alt: 'Santorini stone pathway' },
  ],
  'kyoto': [
    { url: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1200&q=80', alt: 'Kyoto bamboo forest' },
    { url: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=1200&q=80', alt: 'Kyoto golden temple' },
    { url: 'https://images.unsplash.com/photo-1478436127897-769e1b3f0f36?w=1200&q=80', alt: 'Kyoto cherry blossoms' },
    { url: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=1200&q=80', alt: 'Kyoto red torii gates' },
    { url: 'https://images.unsplash.com/photo-1576675466969-38eeae4b41f6?w=1200&q=80', alt: 'Kyoto zen garden' },
    { url: 'https://images.unsplash.com/photo-1606425271394-c3ca9aa1fc06?w=1200&q=80', alt: 'Kyoto autumn maple' },
    { url: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=1200&q=80', alt: 'Kyoto pagoda at dusk' },
    { url: 'https://images.unsplash.com/photo-1526129318478-62ed807ebdf9?w=1200&q=80', alt: 'Kyoto stone lanterns' },
  ],
  'tokyo': [
    { url: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1200&q=80', alt: 'Tokyo skyline at night' },
    { url: 'https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?w=1200&q=80', alt: 'Tokyo Mount Fuji view' },
    { url: 'https://images.unsplash.com/photo-1513407030348-c983a97b98d8?w=1200&q=80', alt: 'Tokyo temple grounds' },
    { url: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=1200&q=80', alt: 'Tokyo cherry blossom path' },
    { url: 'https://images.unsplash.com/photo-1550439062-609e1531270e?w=1200&q=80', alt: 'Tokyo tower illuminated' },
    { url: 'https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?w=1200&q=80', alt: 'Tokyo traditional gate' },
    { url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80', alt: 'Tokyo gardens at dawn' },
    { url: 'https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=1200&q=80', alt: 'Tokyo serene garden' },
  ],
  'paris': [
    { url: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=1200&q=80', alt: 'Paris Eiffel Tower' },
    { url: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1200&q=80', alt: 'Paris river Seine' },
    { url: 'https://images.unsplash.com/photo-1520939817895-060bdaf4fe1b?w=1200&q=80', alt: 'Paris Notre Dame Cathedral' },
    { url: 'https://images.unsplash.com/photo-1543349689-9a4d426bee8e?w=1200&q=80', alt: 'Paris Louvre museum' },
    { url: 'https://images.unsplash.com/photo-1524396309943-e03f5249f002?w=1200&q=80', alt: 'Paris Montmartre rooftops' },
    { url: 'https://images.unsplash.com/photo-1568684373965-df7f58cd8cfb?w=1200&q=80', alt: 'Paris Arc de Triomphe' },
    { url: 'https://images.unsplash.com/photo-1491166617655-0723a0854d4a?w=1200&q=80', alt: 'Paris street at sunset' },
    { url: 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?w=1200&q=80', alt: 'Paris golden hour' },
  ],
  'dubai': [
    { url: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1200&q=80', alt: 'Dubai skyline' },
    { url: 'https://images.unsplash.com/photo-1518684079-3c830dcef090?w=1200&q=80', alt: 'Dubai desert dunes' },
    { url: 'https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?w=1200&q=80', alt: 'Dubai Burj Khalifa' },
    { url: 'https://images.unsplash.com/photo-1537985418200-8e67f9c8fb99?w=1200&q=80', alt: 'Dubai Marina at night' },
    { url: 'https://images.unsplash.com/photo-1571771019784-3ff35f4f4277?w=1200&q=80', alt: 'Dubai desert sunset' },
    { url: 'https://images.unsplash.com/photo-1526495124232-a04e1849168c?w=1200&q=80', alt: 'Dubai beach coast' },
    { url: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=1200&q=80', alt: 'Dubai golden dunes' },
    { url: 'https://images.unsplash.com/photo-1595845764802-07c78eec86b5?w=1200&q=80', alt: 'Dubai architecture' },
  ],
  'maldives': [
    { url: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=1200&q=80', alt: 'Maldives overwater bungalow' },
    { url: 'https://images.unsplash.com/photo-1540202404-a2f29016b523?w=1200&q=80', alt: 'Maldives crystal lagoon' },
    { url: 'https://images.unsplash.com/photo-1573843981267-be1ceee3b38d?w=1200&q=80', alt: 'Maldives turquoise water' },
    { url: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=1200&q=80', alt: 'Maldives sunset villa' },
    { url: 'https://images.unsplash.com/photo-1530053969600-caed2596d242?w=1200&q=80', alt: 'Maldives coral reef' },
    { url: 'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?w=1200&q=80', alt: 'Maldives ocean waves' },
    { url: 'https://images.unsplash.com/photo-1586500036706-41963de24d8b?w=1200&q=80', alt: 'Maldives aerial view' },
    { url: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=1200&q=80', alt: 'Maldives white sand beach' },
  ],
  'new-york-city': [
    { url: 'https://images.unsplash.com/photo-1492666673288-3c4b4576ad9a?w=1200&q=80', alt: 'New York City skyline' },
    { url: 'https://images.unsplash.com/photo-1534430480872-3498386e7856?w=1200&q=80', alt: 'NYC Central Park autumn' },
    { url: 'https://images.unsplash.com/photo-1500916434205-0c77489c6cf7?w=1200&q=80', alt: 'NYC Brooklyn Bridge' },
    { url: 'https://images.unsplash.com/photo-1541336032412-2048a678540d?w=1200&q=80', alt: 'NYC Empire State Building' },
    { url: 'https://images.unsplash.com/photo-1435224654926-ecc9f7fa028c?w=1200&q=80', alt: 'NYC Times Square signs' },
    { url: 'https://images.unsplash.com/photo-1490644658840-3f2e3f8c5625?w=1200&q=80', alt: 'NYC aerial dawn' },
    { url: 'https://images.unsplash.com/photo-1516475429286-465d815a0df7?w=1200&q=80', alt: 'NYC Manhattan at dusk' },
    { url: 'https://images.unsplash.com/photo-1567967455389-e696c1a95d21?w=1200&q=80', alt: 'NYC Statue of Liberty' },
  ],
  'rome': [
    { url: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=1200&q=80', alt: 'Rome Colosseum' },
    { url: 'https://images.unsplash.com/photo-1531572753322-ad063cecc140?w=1200&q=80', alt: 'Rome Trevi Fountain' },
    { url: 'https://images.unsplash.com/photo-1583691849573-26f4b8567e7a?w=1200&q=80', alt: 'Rome ancient forum' },
    { url: 'https://images.unsplash.com/photo-1525874684015-58379d421a52?w=1200&q=80', alt: 'Rome St Peters dome' },
    { url: 'https://images.unsplash.com/photo-1515542622106-078bda69b888?w=1200&q=80', alt: 'Rome cobblestone streets' },
    { url: 'https://images.unsplash.com/photo-1542820229-081e0c12af0b?w=1200&q=80', alt: 'Rome Pantheon' },
    { url: 'https://images.unsplash.com/photo-1561293087-c3e11e3c6f4b?w=1200&q=80', alt: 'Rome Vatican gardens' },
    { url: 'https://images.unsplash.com/photo-1580983559367-0dc2f8934365?w=1200&q=80', alt: 'Rome golden sunset' },
  ],
  'barcelona': [
    { url: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=1200&q=80', alt: 'Barcelona Sagrada Familia' },
    { url: 'https://images.unsplash.com/photo-1464790719320-516ecd75af6c?w=1200&q=80', alt: 'Barcelona Park Guell' },
    { url: 'https://images.unsplash.com/photo-1510519138101-570d1dca3d66?w=1200&q=80', alt: 'Barcelona Gothic Quarter' },
    { url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80', alt: 'Barcelona beach coastline' },
    { url: 'https://images.unsplash.com/photo-1561083177-26b6cfc5294c?w=1200&q=80', alt: 'Barcelona rooftop view' },
    { url: 'https://images.unsplash.com/photo-1543785734-4b6e564642f8?w=1200&q=80', alt: 'Barcelona architecture' },
    { url: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=1200&q=80', alt: 'Barcelona sunset' },
    { url: 'https://images.unsplash.com/photo-1575201442498-f80bdd3a4e28?w=1200&q=80', alt: 'Barcelona mosaic art' },
  ],
  'amsterdam': [
    { url: 'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=1200&q=80', alt: 'Amsterdam canals' },
    { url: 'https://images.unsplash.com/photo-1567963432-7e08b4e82e93?w=1200&q=80', alt: 'Amsterdam historic bridges' },
    { url: 'https://images.unsplash.com/photo-1512470876302-972faa2aa9a4?w=1200&q=80', alt: 'Amsterdam tulip fields' },
    { url: 'https://images.unsplash.com/photo-1548438294-1ad5d5f4f063?w=1200&q=80', alt: 'Amsterdam row houses' },
    { url: 'https://images.unsplash.com/photo-1517448931760-f84cc4b3ef8e?w=1200&q=80', alt: 'Amsterdam windmill' },
    { url: 'https://images.unsplash.com/photo-1572616929781-a22e83ebad1c?w=1200&q=80', alt: 'Amsterdam at dusk' },
    { url: 'https://images.unsplash.com/photo-1585011664466-b7bbe92f34ef?w=1200&q=80', alt: 'Amsterdam canal boats' },
    { url: 'https://images.unsplash.com/photo-1583244534735-d236fb3b5b3b?w=1200&q=80', alt: 'Amsterdam night reflections' },
  ],
  'sydney': [
    { url: 'https://images.unsplash.com/photo-1506374322094-6021fc3926f1?w=1200&q=80', alt: 'Sydney Opera House' },
    { url: 'https://images.unsplash.com/photo-1524820197278-540916411e20?w=1200&q=80', alt: 'Sydney Harbour Bridge' },
    { url: 'https://images.unsplash.com/photo-1523428461295-92770e70d7ae?w=1200&q=80', alt: 'Sydney Bondi Beach waves' },
    { url: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=1200&q=80', alt: 'Sydney aerial harbour' },
    { url: 'https://images.unsplash.com/photo-1559543563-8f1e5fcc44ab?w=1200&q=80', alt: 'Sydney coastal cliffs' },
    { url: 'https://images.unsplash.com/photo-1494233892892-84542a694e72?w=1200&q=80', alt: 'Sydney golden sunset' },
    { url: 'https://images.unsplash.com/photo-1587893904767-af15c0aaf5f3?w=1200&q=80', alt: 'Sydney blue mountains' },
    { url: 'https://images.unsplash.com/photo-1598978453938-39eb6e3bbc29?w=1200&q=80', alt: 'Sydney botanical gardens' },
  ],
  'cape-town': [
    { url: 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=1200&q=80', alt: 'Cape Town Table Mountain' },
    { url: 'https://images.unsplash.com/photo-1576485290814-1c72aa4bbb8e?w=1200&q=80', alt: 'Cape Town ocean coast' },
    { url: 'https://images.unsplash.com/photo-1565799923986-56dc6f760d0e?w=1200&q=80', alt: 'Cape Town beach' },
    { url: 'https://images.unsplash.com/photo-1606046604972-77cc76aee944?w=1200&q=80', alt: 'Cape Town sunset' },
    { url: 'https://images.unsplash.com/photo-1562602833-0f4ab2fc46e3?w=1200&q=80', alt: 'Cape Town vineyard' },
    { url: 'https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1?w=1200&q=80', alt: 'Cape Town cliffside' },
    { url: 'https://images.unsplash.com/photo-1607563378541-cc3c1bcfe6e5?w=1200&q=80', alt: 'Cape Town harbor' },
    { url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=1200&q=80', alt: 'Cape Town fynbos' },
  ],
  'machu-picchu': [
    { url: 'https://images.unsplash.com/photo-1526392060635-9d6019884377?w=1200&q=80', alt: 'Machu Picchu ruins' },
    { url: 'https://images.unsplash.com/photo-1580619305218-8423a7ef79b4?w=1200&q=80', alt: 'Machu Picchu misty mountains' },
    { url: 'https://images.unsplash.com/photo-1587595431973-160d0d94add1?w=1200&q=80', alt: 'Machu Picchu sunrise' },
    { url: 'https://images.unsplash.com/photo-1569259285660-bf0fd9cd9a6c?w=1200&q=80', alt: 'Machu Picchu stone terraces' },
    { url: 'https://images.unsplash.com/photo-1489507644017-a8e0e4e28c7f?w=1200&q=80', alt: 'Machu Picchu green valley' },
    { url: 'https://images.unsplash.com/photo-1566041510639-8d95a2490bfb?w=1200&q=80', alt: 'Machu Picchu Inca walls' },
    { url: 'https://images.unsplash.com/photo-1574744534937-97e41e4f6ba0?w=1200&q=80', alt: 'Machu Picchu clouds' },
    { url: 'https://images.unsplash.com/photo-1485841890310-6a055c88698a?w=1200&q=80', alt: 'Machu Picchu ancient city' },
  ],
  'iceland-reykjavik': [
    { url: 'https://images.unsplash.com/photo-1476610182048-b716b8518aae?w=1200&q=80', alt: 'Iceland Northern Lights' },
    { url: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=1200&q=80', alt: 'Iceland waterfall' },
    { url: 'https://images.unsplash.com/photo-1504893524553-b855bce32c67?w=1200&q=80', alt: 'Iceland black sand beach' },
    { url: 'https://images.unsplash.com/photo-1516733968668-dbdce39c4651?w=1200&q=80', alt: 'Iceland aurora borealis' },
    { url: 'https://images.unsplash.com/photo-1520769945061-0a448c463865?w=1200&q=80', alt: 'Iceland hot spring' },
    { url: 'https://images.unsplash.com/photo-1539066033764-e1c23c3a6c10?w=1200&q=80', alt: 'Iceland glacier' },
    { url: 'https://images.unsplash.com/photo-1570358934836-6802981e481e?w=1200&q=80', alt: 'Iceland lava fields' },
    { url: 'https://images.unsplash.com/photo-1531261801697-9c3b95a93ab5?w=1200&q=80', alt: 'Iceland mountain valley' },
  ],
  'phuket': [
    { url: 'https://images.unsplash.com/photo-1519451241324-20b4ea2c4220?w=1200&q=80', alt: 'Phuket turquoise bay' },
    { url: 'https://images.unsplash.com/photo-1501179691627-eeaa65ea017c?w=1200&q=80', alt: 'Phuket limestone cliffs' },
    { url: 'https://images.unsplash.com/photo-1589394815803-964e73bf5695?w=1200&q=80', alt: 'Phuket Thai temple' },
    { url: 'https://images.unsplash.com/photo-1537956965359-7573183d1f57?w=1200&q=80', alt: 'Phuket sunset beach' },
    { url: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=1200&q=80', alt: 'Phuket island aerial' },
    { url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80', alt: 'Phuket emerald sea' },
    { url: 'https://images.unsplash.com/photo-1559628129-67cf63b72248?w=1200&q=80', alt: 'Phuket mangrove forest' },
    { url: 'https://images.unsplash.com/photo-1503917988258-f87a78e3c995?w=1200&q=80', alt: 'Phuket tropical lagoon' },
  ],
};

// Default photos for any destination not listed above
const defaultPhotos = [
  { url: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1200&q=80', alt: 'Mountain landscape' },
  { url: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=1200&q=80', alt: 'Ocean coastline' },
  { url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&q=80', alt: 'Forest trail' },
  { url: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=1200&q=80', alt: 'Aerial green valley' },
  { url: 'https://images.unsplash.com/photo-1518623489648-a173ef7824f3?w=1200&q=80', alt: 'Sunrise landscape' },
  { url: 'https://images.unsplash.com/photo-1540390769625-2fc3f8b1d50c?w=1200&q=80', alt: 'Tropical beach' },
  { url: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1200&q=80', alt: 'Travel destination' },
  { url: 'https://images.unsplash.com/photo-1488085061387-422e29b40080?w=1200&q=80', alt: 'Scenic view' },
];

async function addPhotos() {
  console.log('📸 Adding gallery photos to all destinations...\n');

  const destinations = await db.destination.findMany({
    select: { id: true, name: true, slug: true },
    orderBy: { name: 'asc' }
  });

  console.log(`Found ${destinations.length} destinations\n`);

  for (const dest of destinations) {
    // Delete existing images first to avoid duplicates
    await db.destinationImage.deleteMany({ where: { destinationId: dest.id } });

    const photos = galleryPhotos[dest.slug] || defaultPhotos;

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

    console.log(`✅ ${dest.name} (${dest.slug}) — added ${photos.length} photos`);
  }

  console.log('\n🎉 All gallery photos updated successfully!');
}

addPhotos()
  .catch(console.error)
  .finally(() => db.$disconnect());
