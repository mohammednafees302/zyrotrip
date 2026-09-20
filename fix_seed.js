const fs = require('fs');
let seed = fs.readFileSync('prisma/seed.ts', 'utf8');

// The line is currently: url: typeof heroImage !== 'undefined' ? heroImage : data.heroImage
// Wait, it is actually url: heroImage || data.heroImage
// Let's replace it carefully.
seed = seed.replace(/url:\s*heroImage\s*\|\|\s*data\.heroImage/g, 'url: (typeof heroImage !== "undefined" ? heroImage : data.heroImage)');

fs.writeFileSync('prisma/seed.ts', seed);
