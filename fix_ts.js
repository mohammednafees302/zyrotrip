const fs = require('fs');

const replaceInFile = (path, replacements) => {
  if (!fs.existsSync(path)) return;
  let code = fs.readFileSync(path, 'utf8');
  let changed = false;
  replacements.forEach(r => {
    if (code.match(r[0])) {
      code = code.replace(r[0], r[1]);
      changed = true;
    }
  });
  if (changed) fs.writeFileSync(path, code);
};

const pages = [
  'src/app/experiences/page.tsx', 
  'src/app/hotels/page.tsx', 
  'src/app/packages/page.tsx', 
  'src/components/destination/DestinationsGrid.tsx'
];
pages.forEach(p => {
  replaceInFile(p, [
    [/, mode: "insensitive"/g, ''],
    [/, mode: 'insensitive'/g, '']
  ]);
});

replaceInFile('src/app/hotels/[slug]/page.tsx', [
  [/hotel\.amenities\.map/g, '(JSON.parse(hotel.amenities || "[]")).map'],
  [/room\.amenities\.map/g, '(JSON.parse(room.amenities || "[]")).map']
]);

replaceInFile('src/app/hotels/page.tsx', [
  [/hotel\.amenities\.map/g, '(JSON.parse(hotel.amenities || "[]")).map']
]);

replaceInFile('src/app/packages/[slug]/page.tsx', [
  [/pkg\.included\.map/g, '(JSON.parse(pkg.included || "[]")).map'],
  [/pkg\.excluded\.map/g, '(JSON.parse(pkg.excluded || "[]")).map']
]);

replaceInFile('src/lib/auth.ts', [
  [/, UserRole/g, ''],
  [/import \{ UserRole \} from "@prisma\/client";/g, '']
]);

replaceInFile('src/app/packages/page.tsx', [
  [/, PackageCategory/g, ''],
  [/as PackageCategory/g, 'as string']
]);

replaceInFile('src/components/booking/BookingFlow.tsx', [
  [/isLead: z\.boolean\(\)\.default\(false\)/g, 'isLead: z.boolean().optional()']
]);
