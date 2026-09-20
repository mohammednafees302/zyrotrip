const fs = require('fs');
let schema = fs.readFileSync('prisma/schema.prisma', 'utf8');

const defaultsToFix = ['CULTURAL', 'SIGHTSEEING', 'USER', 'DRAFT', 'PENDING'];

defaultsToFix.forEach(d => {
  const regex = new RegExp(`@default\\(${d}\\)`, 'g');
  schema = schema.replace(regex, `@default("${d}")`);
});

fs.writeFileSync('prisma/schema.prisma', schema);
