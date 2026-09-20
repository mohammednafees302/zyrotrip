const fs = require('fs');

function replaceInFile(path, searchRegex, replaceText) {
    if (!fs.existsSync(path)) return;
    let content = fs.readFileSync(path, 'utf8');
    content = content.replace(searchRegex, replaceText);
    fs.writeFileSync(path, content, 'utf8');
}

// Fix search API (mode insensitive)
replaceInFile('src/app/api/search/route.ts', /mode:\s*['"]insensitive['"]/g, '');
replaceInFile('src/app/api/search/route.ts', /,\s*,/g, ',');

// Fix Hotels list
replaceInFile('src/app/hotels/page.tsx', /\{hotel\.amenities\.map\(\(amenity\) => \(/g, '{(JSON.parse(hotel.amenities || \"[]\")).map((amenity: string) => (');

// Fix Hotels detail
replaceInFile('src/app/hotels/[slug]/page.tsx', /\{hotel\.amenities\.map\(\(a\) => \(/g, '{(JSON.parse(hotel.amenities || \"[]\")).map((a: string) => (');

// Fix Packages detail
replaceInFile('src/app/packages/[slug]/page.tsx', /\{pkg\.included\.map\(\(item, i\) => \(/g, '{(JSON.parse(pkg.included || \"[]\")).map((item: string, i: number) => (');
replaceInFile('src/app/packages/[slug]/page.tsx', /\{pkg\.excluded\.map\(\(item, i\) => \(/g, '{(JSON.parse(pkg.excluded || \"[]\")).map((item: string, i: number) => (');

// Fix Wishlist API enum import
replaceInFile('src/app/api/wishlist/route.ts', /WishlistItemType,?/g, '');

// Fix auth UserRole import
replaceInFile('src/lib/auth.ts', /UserRole,?/g, '');

console.log('Done');
